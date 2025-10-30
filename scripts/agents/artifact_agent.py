#!/usr/bin/env python3
"""Hardened Artifact Agent runtime.

This agent maintains health/status metadata for the artifact worker, exposes
an HTTP health endpoint, tails inter-agent coordination files, and appends
structured audit events so other services can reason about artifact outputs.

Design goals:
- Zero shared-state assumptions (all coordination via files under tmp/agent_status)
- Atomic writes for all JSON updates
- Health endpoint for external probes (default: 5013)
- Rotation-safe logging with UTC timestamps
- Graceful shutdown on SIGTERM/SIGINT with final status write
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import signal
import sys
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_STATUS_DIR = ROOT / "tmp" / "agent_status"
DEFAULT_CODEX_DIR = DEFAULT_STATUS_DIR / "codex_tasks"
DEFAULT_SHARED_DIR = DEFAULT_STATUS_DIR / "shared"
DEFAULT_LOG_DIR = ROOT / "logs" / "agents"


def utc_now() -> datetime:
    """Return aware UTC datetime."""
    return datetime.now(timezone.utc)


def utc_iso() -> str:
    """Return current UTC time in ISO-8601 format."""
    return utc_now().strftime("%Y-%m-%dT%H:%M:%SZ")


def atomic_write_json(path: Path, payload: Dict) -> None:
    """Atomically write JSON payload to path."""
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.parent / f"{path.name}.tmp"
    with temporary.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
    temporary.replace(path)


def append_jsonl(path: Path, payload: Dict) -> None:
    """Append JSON payload as a single line (JSONL) to path."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        json.dump(payload, handle)
        handle.write("\n")


@dataclass
class ArtifactAgentState:
    """State tracker persisted to status file."""

    started_at: str = field(default_factory=utc_iso)
    updated_at: str = field(default_factory=utc_iso)
    status: str = "starting"
    phase: str = "startup"
    notes: str = "initializing artifact agent"
    recent_tasks: List[Dict[str, str]] = field(default_factory=list)
    processed_task_ids: Set[str] = field(default_factory=set)
    pending_tasks: int = 0
    http_port: int = 0
    processed_total: int = 0

    def to_payload(self, log_file: Path, audit_log: Path) -> Dict:
        """Render status payload written to JSON."""
        return {
            "agent": "artifact",
            "phase": self.phase,
            "status": self.status,
            "started_at": self.started_at,
            "updated_at": self.updated_at,
            "finished_at": "" if self.status not in {"stopped", "error"} else self.updated_at,
            "artifacts": [str(log_file), str(audit_log)],
            "notes": self.notes,
            "http_port": self.http_port,
            "metrics": {
                "pending_tasks": self.pending_tasks,
                "processed_total": self.processed_total,
                "recent_tasks": self.recent_tasks[-10:],
            },
        }


class ArtifactAgent:
    """Runtime controller for Artifact Agent orchestration."""

    def __init__(
        self,
        status_file: Path,
        log_file: Path,
        audit_log_file: Path,
        registry_file: Path,
        coordination_log: Path,
        codex_dir: Path,
        poll_interval: int,
        port: int,
        install_signal_handlers: bool = True,
    ) -> None:
        self.status_file = status_file
        self.log_file = log_file
        self.audit_log_file = audit_log_file
        self.registry_file = registry_file
        self.coordination_log = coordination_log
        self.codex_dir = codex_dir
        self.poll_interval = max(5, poll_interval)
        self.port = port

        self._stop_event = threading.Event()
        self._httpd: Optional[ThreadingHTTPServer] = None
        self._http_thread: Optional[threading.Thread] = None
        self.state = ArtifactAgentState(http_port=self.port)
        self.logger = self._configure_logger()

        self.status_file.parent.mkdir(parents=True, exist_ok=True)
        self.log_file.parent.mkdir(parents=True, exist_ok=True)
        self.audit_log_file.parent.mkdir(parents=True, exist_ok=True)
        self.codex_dir.mkdir(parents=True, exist_ok=True)
        self.registry_file.parent.mkdir(parents=True, exist_ok=True)

        self._load_previous_state()

        if install_signal_handlers:
            signal.signal(signal.SIGTERM, self._handle_signal)
            signal.signal(signal.SIGINT, self._handle_signal)

    def _configure_logger(self) -> logging.Logger:
        logger = logging.getLogger("artifact-agent")
        logger.setLevel(logging.INFO)
        logger.propagate = False

        # Reset handlers if re-instantiated (tests)
        for handler in list(logger.handlers):
            handler.close()
            logger.removeHandler(handler)

        formatter = logging.Formatter(
            fmt="%(asctime)sZ [%(levelname)s] %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%S",
        )
        formatter.converter = time.gmtime  # type: ignore[attr-defined]

        rotating_handler = RotatingFileHandler(
            self.log_file,
            maxBytes=1_048_576,
            backupCount=5,
            encoding="utf-8",
        )
        rotating_handler.setFormatter(formatter)
        logger.addHandler(rotating_handler)

        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)

        return logger

    def _load_previous_state(self) -> None:
        """Seed state from existing status file if available."""
        if not self.status_file.exists():
            return
        try:
            data = json.loads(self.status_file.read_text(encoding="utf-8"))
            processed = data.get("metrics", {}).get("recent_tasks", [])
            self.state.processed_task_ids = {
                entry.get("task_id")
                for entry in processed
                if isinstance(entry, dict) and entry.get("task_id")
            }
            self.state.recent_tasks = [
                entry
                for entry in processed
                if isinstance(entry, dict) and entry.get("task_id")
            ]
            self.state.processed_total = data.get("metrics", {}).get("processed_total", 0)
        except json.JSONDecodeError:
            self.logger.warning("status file corrupted; starting fresh")
        except Exception as exc:
            self.logger.warning("failed to load previous state: %s", exc)

    # ---------------------------------------------------------------------
    # Lifecycle
    # ---------------------------------------------------------------------
    def run(self) -> None:
        """Entry point: start services then loop until stopped."""
        self.logger.info("Starting Artifact Agent on port %s", self.port)
        self.state.status = "starting"
        self.state.phase = "startup"
        self.state.notes = "artifact agent booting"
        self._flush_status()
        self._update_registry(status="starting")
        self._append_coordination_event("agent_start", "Artifact agent boot sequence initiated")

        try:
            self._start_http_server()
        except OSError as exc:
            self.logger.error("failed to bind HTTP server on port %s: %s", self.port, exc)
            self.state.status = "error"
            self.state.phase = "http_bind_failed"
            self.state.notes = f"HTTP bind failed: {exc}"
            self._flush_status()
            self._append_coordination_event(
                "agent_error",
                "Artifact agent failed to bind HTTP server",
                metadata={"port": self.port, "error": str(exc)},
            )
            return

        self.state.status = "running"
        self.state.phase = "steady"
        self.state.notes = "artifact agent heartbeat active"
        self._flush_status()
        self._update_registry(status="active")

        while not self._stop_event.is_set():
            try:
                new_results = self._scan_codex_results()
                pending = self._count_pending_requests()
                self.state.pending_tasks = pending
                self.state.updated_at = utc_iso()
                if new_results:
                    self.state.notes = f"processed {len(new_results)} new codex results"
                else:
                    self.state.notes = f"heartbeat ok; pending {pending}"
                self._flush_status()
                if new_results:
                    self._append_coordination_event(
                        "artifact_results",
                        "Artifact agent recorded CODEX task results",
                        metadata={"count": len(new_results), "pending": pending},
                    )
                time.sleep(self.poll_interval)
            except Exception as exc:  # pylint: disable=broad-except
                self.logger.exception("Unhandled error in main loop: %s", exc)
                self.state.status = "error"
                self.state.phase = "loop_error"
                self.state.notes = f"loop error: {exc}"
                self._flush_status()
                self._append_coordination_event(
                    "agent_error",
                    "Artifact agent encountered loop error",
                    metadata={"error": str(exc)},
                )
                time.sleep(self.poll_interval)

        self._shutdown()

    def stop(self) -> None:
        """Signal the agent to stop."""
        self._stop_event.set()

    def _handle_signal(self, signum: int, _: Optional[object]) -> None:  # pragma: no cover
        self.logger.info("Received signal %s, shutting down", signum)
        self.stop()

    # ------------------------------------------------------------------
    # Core helpers
    # ------------------------------------------------------------------
    def _start_http_server(self) -> None:
        """Create HTTP health server in background thread."""

        agent = self

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self) -> None:  # noqa: N802  (framework method)
                if self.path not in {"/", "/health", "/healthz"}:
                    self.send_response(404)
                    self.end_headers()
                    return

                payload = agent._health_payload()  # pylint: disable=protected-access
                body = json.dumps(payload).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *_args) -> None:  # noqa: D401
                """Silence default HTTP server logging."""
                return

        server = ThreadingHTTPServer(("127.0.0.1", self.port), Handler)
        server.daemon_threads = True

        thread = threading.Thread(target=server.serve_forever, name="artifact-http", daemon=True)
        thread.start()

        self._httpd = server
        self._http_thread = thread
        self.logger.info("Health endpoint available on http://127.0.0.1:%s/health", self.port)

    def _shutdown(self) -> None:
        """Graceful shutdown path."""
        if self._httpd is not None:
            self._httpd.shutdown()
            self._httpd.server_close()
        if self._http_thread is not None and self._http_thread.is_alive():
            self._http_thread.join(timeout=2)

        self.state.status = "stopped"
        self.state.phase = "shutdown"
        self.state.updated_at = utc_iso()
        self.state.notes = "artifact agent stopped"
        self._flush_status()
        self._update_registry(status="idle")
        self._append_coordination_event("agent_stop", "Artifact agent shutdown complete")
        self.logger.info("Artifact agent stopped")

    def _health_payload(self) -> Dict:
        return {
            "agent": "artifact",
            "status": self.state.status,
            "phase": self.state.phase,
            "timestamp": utc_iso(),
            "pending_tasks": self.state.pending_tasks,
            "processed_total": self.state.processed_total,
            "recent_tasks": self.state.recent_tasks[-5:],
        }

    def _count_pending_requests(self) -> int:
        if not self.codex_dir.exists():
            return 0
        count = 0
        for request_file in self.codex_dir.glob("task_*.request.json"):
            task_id = request_file.name.split(".")[0].replace("task_", "")
            result_file = self.codex_dir / f"task_{task_id}.result.json"
            if not result_file.exists():
                count += 1
        return count

    def _scan_codex_results(self) -> List[str]:
        """Discover new CODEX task results and append audit entries."""
        if not self.codex_dir.exists():
            return []
        new_task_ids: List[str] = []
        for result_file in sorted(self.codex_dir.glob("task_*.result.json")):
            name = result_file.name
            if not name.startswith("task_"):
                continue
            task_id = name[len("task_"):]
            if task_id.endswith(".result.json"):
                task_id = task_id[: -len(".result.json")]
            elif task_id.endswith(".json"):
                task_id = task_id[: -len(".json")]
            if task_id in self.state.processed_task_ids:
                continue
            try:
                payload = json.loads(result_file.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                self.logger.warning("Skipping malformed result file: %s", result_file)
                continue
            except OSError as exc:
                self.logger.warning("Failed to read %s: %s", result_file, exc)
                continue

            status = payload.get("status", "unknown")
            summary = payload.get("result", {}).get("summary", "")
            metadata = {
                "task_id": task_id,
                "status": status,
                "summary": summary[:160],
                "source_agent": payload.get("source_agent", "unknown"),
                "artifacts_created": payload.get("result", {}).get("artifacts_created", []),
            }
            append_jsonl(self.audit_log_file, {
                "timestamp": utc_iso(),
                "event": "codex_task_result",
                **metadata,
            })
            self.logger.info(
                "Recorded task result %s (%s) with %d artifacts",
                task_id,
                status,
                len(metadata["artifacts_created"]),
            )

            self.state.processed_task_ids.add(task_id)
            self.state.recent_tasks.append({
                "task_id": task_id,
                "status": status,
                "completed_at": payload.get("completed_at", utc_iso()),
            })
            self.state.processed_total += 1
            new_task_ids.append(task_id)
        return new_task_ids

    def _update_registry(self, status: str) -> None:
        if not self.registry_file.exists():
            registry_payload = {
                "agents": {
                    "artifact": {
                        "status": status,
                        "pid": None,
                        "port": self.port,
                        "last_seen": utc_iso(),
                    }
                },
                "updated_at": utc_iso(),
            }
            atomic_write_json(self.registry_file, registry_payload)
            return

        try:
            registry = json.loads(self.registry_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            registry = {}
        agents = registry.setdefault("agents", {})
        agent_entry = agents.setdefault("artifact", {})
        agent_entry.update(
            {
                "status": status,
                "pid": os.getpid(),
                "port": self.port,
                "last_seen": utc_iso(),
            }
        )
        registry["updated_at"] = utc_iso()
        atomic_write_json(self.registry_file, registry)

    def _flush_status(self) -> None:
        self.state.updated_at = utc_iso()
        payload = self.state.to_payload(self.log_file, self.audit_log_file)
        atomic_write_json(self.status_file, payload)

    def _append_coordination_event(self, event_type: str, message: str, metadata: Optional[Dict] = None) -> None:
        append_jsonl(
            self.coordination_log,
            {
                "timestamp": utc_iso(),
                "event_type": event_type,
                "source_agent": "artifact",
                "message": message,
                "metadata": metadata or {},
            },
        )


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the hardened Artifact Agent")
    parser.add_argument("--status-file", required=True, help="Path to artifact status JSON")
    parser.add_argument("--log-file", required=True, help="Path to rotating agent log")
    parser.add_argument("--audit-log", required=True, help="Path to structured audit log")
    parser.add_argument("--registry-file", required=True, help="Path to agent registry JSON")
    parser.add_argument("--coord-log", required=True, help="Coordination log JSONL")
    parser.add_argument("--codex-dir", default=str(DEFAULT_CODEX_DIR), help="Directory with CODEX tasks/results")
    parser.add_argument("--poll-interval", type=int, default=15, help="Seconds between health sweeps")
    parser.add_argument("--port", type=int, default=5013, help="Health server port")
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)

    status_file = Path(args.status_file)
    log_file = Path(args.log_file)
    audit_log_file = Path(args.audit_log)
    registry_file = Path(args.registry_file)
    coord_log = Path(args.coord_log)
    codex_dir = Path(args.codex_dir)

    agent = ArtifactAgent(
        status_file=status_file,
        log_file=log_file,
        audit_log_file=audit_log_file,
        registry_file=registry_file,
        coordination_log=coord_log,
        codex_dir=codex_dir,
        poll_interval=args.poll_interval,
        port=args.port,
    )

    try:
        agent.run()
        return 0
    except KeyboardInterrupt:  # pragma: no cover - manual interrupt
        agent.stop()
        return 0
    except Exception as exc:  # pragma: no cover - fail-safe
        agent.logger.exception("Fatal error: %s", exc)
        agent.stop()
        return 1


if __name__ == "__main__":
    sys.exit(main())
