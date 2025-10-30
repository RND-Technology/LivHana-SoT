#!/usr/bin/env python3
"""
Inter-Agent Communication Utilities
Provides helper functions for Liv Hana and CODEX to coordinate via JSON files.
"""

import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any, Literal

# Root directory
ROOT = Path(__file__).parent.parent
AGENT_STATUS_DIR = ROOT / "tmp" / "agent_status"

# Agent identifiers
LIVHANA_AGENT = "livhana-layer1.1"
CODEX_AGENT = "codex-cursor"

# Task types
TaskType = Literal["execute", "research", "validate", "deploy"]
TaskStatus = Literal["completed", "failed", "partial", "timeout", "blocked", "deferred"]
Priority = Literal["critical", "high", "medium", "low"]


class InterAgentCommunication:
    """Base class for inter-agent communication."""

    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.codex_tasks_dir = AGENT_STATUS_DIR / "codex_tasks"
        self.codex_status_dir = AGENT_STATUS_DIR / "codex_status"
        self.livhana_status_dir = AGENT_STATUS_DIR / "livhana_status"
        self.shared_dir = AGENT_STATUS_DIR / "shared"

    def _ensure_dirs(self):
        """Ensure all required directories exist."""
        self.codex_tasks_dir.mkdir(parents=True, exist_ok=True)
        self.codex_status_dir.mkdir(parents=True, exist_ok=True)
        self.livhana_status_dir.mkdir(parents=True, exist_ok=True)
        self.shared_dir.mkdir(parents=True, exist_ok=True)

    def _utc_now(self) -> str:
        """Return current UTC timestamp in ISO 8601 format."""
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    def update_heartbeat(
        self,
        status: str,
        current_capacity: float = 1.0,
        active_tasks: Optional[List[str]] = None,
        last_error: Optional[str] = None,
    ):
        """Update agent heartbeat file."""
        self._ensure_dirs()

        if self.agent_name == LIVHANA_AGENT:
            heartbeat_file = self.livhana_status_dir / "heartbeat.json"
        else:
            heartbeat_file = self.codex_status_dir / "heartbeat.json"

        # Read existing heartbeat to get uptime
        uptime_seconds = 0
        if heartbeat_file.exists():
            try:
                existing = json.loads(heartbeat_file.read_text())
                uptime_seconds = existing.get("uptime_seconds", 0) + 30  # Increment by poll interval
            except Exception:
                pass

        heartbeat = {
            "agent_name": self.agent_name,
            "status": status,
            "last_heartbeat": self._utc_now(),
            "uptime_seconds": uptime_seconds,
            "current_capacity": current_capacity,
            "active_tasks": active_tasks or [],
            "health": {
                "cpu_ok": True,
                "memory_ok": True,
                "disk_ok": True,
                "last_error": last_error,
            },
        }

        heartbeat_file.write_text(json.dumps(heartbeat, indent=2))

    def log_coordination_event(
        self,
        event_type: str,
        message: str,
        task_id: Optional[str] = None,
        target_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Append event to coordination log."""
        self._ensure_dirs()

        log_file = self.shared_dir / "coordination_log.jsonl"
        event = {
            "timestamp": self._utc_now(),
            "event_type": event_type,
            "task_id": task_id,
            "source_agent": self.agent_name,
            "target_agent": target_agent,
            "message": message,
            "metadata": metadata or {},
        }

        with log_file.open("a") as f:
            f.write(json.dumps(event) + "\n")


class LivHanaCoordinator(InterAgentCommunication):
    """Liv Hana-specific coordination utilities."""

    def __init__(self):
        super().__init__(LIVHANA_AGENT)

    def create_task_request(
        self,
        request_type: TaskType,
        priority: Priority,
        payload: Dict[str, Any],
        jesse_directive: str,
        blocking: bool = False,
        timeout_seconds: int = 300,
        throttle_capacity: float = 0.8,
        progress_updates_required: bool = False,
    ) -> str:
        """Create a task request for CODEX."""
        self._ensure_dirs()

        task_id = str(uuid.uuid4())
        session_id = Path(ROOT / "tmp" / "claude_tier1_state.json")
        voice_mode_active = True  # Default for Liv Hana

        # Read session ID if available
        if session_id.exists():
            try:
                state = json.loads(session_id.read_text())
                voice_mode_active = state.get("voice_mode", {}).get("ready", True)
            except Exception:
                pass

        request = {
            "task_id": task_id,
            "request_type": request_type,
            "priority": priority,
            "source_agent": LIVHANA_AGENT,
            "target_agent": CODEX_AGENT,
            "created_at": self._utc_now(),
            "timeout_seconds": timeout_seconds,
            "throttle_capacity": throttle_capacity,
            "context": {
                "jesse_directive": jesse_directive,
                "session_id": str(session_id),
                "voice_mode_active": voice_mode_active,
                "related_tasks": [],
            },
            "payload": payload,
            "coordination": {
                "blocking": blocking,
                "progress_updates_required": progress_updates_required,
                "update_interval_seconds": 30,
            },
        }

        # Write request file
        request_file = self.codex_tasks_dir / f"task_{task_id}.request.json"
        request_file.write_text(json.dumps(request, indent=2))

        # Log event
        self.log_coordination_event(
            "task_created",
            f"Created {request_type} task: {jesse_directive[:50]}...",
            task_id=task_id,
            target_agent=CODEX_AGENT,
        )

        return task_id

    def poll_task_result(
        self, task_id: str, timeout_seconds: int = 300, poll_interval: int = 5
    ) -> Optional[Dict[str, Any]]:
        """Poll for task result with timeout."""
        result_file = self.codex_tasks_dir / f"task_{task_id}.result.json"
        progress_file = self.codex_tasks_dir / f"task_{task_id}.progress.json"
        start_time = time.time()

        while (time.time() - start_time) < timeout_seconds:
            # Check if result exists
            if result_file.exists():
                try:
                    return json.loads(result_file.read_text())
                except Exception as e:
                    print(f"Error reading result: {e}")
                    return None

            # Check progress if available
            if progress_file.exists():
                try:
                    progress = json.loads(progress_file.read_text())
                    print(f"Progress: {progress['progress_percent']}% - {progress['current_step']}")
                except Exception:
                    pass

            # Check CODEX heartbeat
            codex_heartbeat = self.codex_status_dir / "heartbeat.json"
            if codex_heartbeat.exists():
                try:
                    heartbeat = json.loads(codex_heartbeat.read_text())
                    if heartbeat["status"] == "error":
                        print("CODEX agent in error state")
                        return None
                except Exception:
                    pass

            time.sleep(poll_interval)

        # Timeout reached
        return {
            "task_id": task_id,
            "status": "timeout",
            "errors": [
                {
                    "code": "TIMEOUT",
                    "message": f"Task exceeded timeout of {timeout_seconds} seconds",
                    "severity": "error",
                }
            ],
        }

    def get_codex_status(self) -> Optional[Dict[str, Any]]:
        """Get current CODEX agent status."""
        heartbeat_file = self.codex_status_dir / "heartbeat.json"
        if heartbeat_file.exists():
            try:
                return json.loads(heartbeat_file.read_text())
            except Exception:
                return None
        return None


class CodexExecutor(InterAgentCommunication):
    """CODEX-specific execution utilities."""

    def __init__(self):
        super().__init__(CODEX_AGENT)

    def discover_pending_tasks(self) -> List[Dict[str, Any]]:
        """Discover pending task requests."""
        self._ensure_dirs()

        pending_tasks = []
        for request_file in self.codex_tasks_dir.glob("task_*.request.json"):
            task_id = request_file.stem.replace("task_", "").replace(".request", "")
            result_file = self.codex_tasks_dir / f"task_{task_id}.result.json"

            # Skip if already processed
            if result_file.exists():
                continue

            try:
                request = json.loads(request_file.read_text())
                pending_tasks.append(request)
            except Exception as e:
                print(f"Error reading request {request_file}: {e}")

        return pending_tasks

    def check_capacity(self) -> float:
        """Check current capacity (0.0-1.0, where 1.0 is fully available)."""
        # TODO: Implement actual capacity checking based on:
        # - Open files in Cursor
        # - Active operations
        # - Memory usage
        # For now, return conservative estimate
        return 0.8

    def write_task_result(
        self,
        task_id: str,
        status: TaskStatus,
        success: bool,
        artifacts_created: Optional[List[str]] = None,
        files_modified: Optional[List[str]] = None,
        summary: str = "",
        metrics: Optional[Dict[str, Any]] = None,
        errors: Optional[List[Dict[str, Any]]] = None,
        next_actions: Optional[List[Dict[str, Any]]] = None,
        execution_time_seconds: float = 0,
    ):
        """Write task result for Liv Hana."""
        self._ensure_dirs()

        result = {
            "task_id": task_id,
            "status": status,
            "source_agent": CODEX_AGENT,
            "completed_at": self._utc_now(),
            "execution_time_seconds": execution_time_seconds,
            "capacity_used": 1.0 - self.check_capacity(),
            "result": {
                "success": success,
                "artifacts_created": artifacts_created or [],
                "files_modified": files_modified or [],
                "summary": summary,
                "metrics": metrics or {},
            },
            "errors": errors or [],
            "next_actions": next_actions or [],
        }

        result_file = self.codex_tasks_dir / f"task_{task_id}.result.json"
        result_file.write_text(json.dumps(result, indent=2))

        # Log event
        self.log_coordination_event(
            "task_completed" if success else "task_failed",
            f"Task {status}: {summary[:50]}...",
            task_id=task_id,
        )

    def update_task_progress(
        self,
        task_id: str,
        progress_percent: float,
        current_step: str,
        steps_completed: int,
        steps_total: int,
        estimated_completion: Optional[str] = None,
    ):
        """Update task progress for long-running tasks."""
        self._ensure_dirs()

        progress = {
            "task_id": task_id,
            "progress_percent": progress_percent,
            "current_step": current_step,
            "steps_completed": steps_completed,
            "steps_total": steps_total,
            "last_update": self._utc_now(),
            "estimated_completion": estimated_completion or "",
        }

        progress_file = self.codex_tasks_dir / f"task_{task_id}.progress.json"
        progress_file.write_text(json.dumps(progress, indent=2))


# CLI interface
def main():
    import argparse

    parser = argparse.ArgumentParser(description="Inter-agent communication utilities")
    parser.add_argument("--agent", choices=["livhana", "codex"], required=True)
    parser.add_argument("--action", required=True)
    parser.add_argument("--task-id", help="Task ID for monitoring")
    parser.add_argument("--timeout", type=int, default=300, help="Timeout in seconds")

    args = parser.parse_args()

    if args.agent == "livhana":
        coordinator = LivHanaCoordinator()

        if args.action == "status":
            status = coordinator.get_codex_status()
            if status:
                print(json.dumps(status, indent=2))
            else:
                print("CODEX agent status not available")

        elif args.action == "poll" and args.task_id:
            print(f"Polling for task {args.task_id}...")
            result = coordinator.poll_task_result(args.task_id, args.timeout)
            if result:
                print(json.dumps(result, indent=2))
            else:
                print("No result received")

    elif args.agent == "codex":
        executor = CodexExecutor()

        if args.action == "discover":
            tasks = executor.discover_pending_tasks()
            print(f"Found {len(tasks)} pending tasks:")
            for task in tasks:
                print(f"  - {task['task_id']}: {task['request_type']} ({task['priority']})")

        elif args.action == "capacity":
            capacity = executor.check_capacity()
            print(f"Current capacity: {capacity:.2%}")


if __name__ == "__main__":
    main()
