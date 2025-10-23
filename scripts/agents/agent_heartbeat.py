#!/usr/bin/env python3
"""
Lightweight heartbeat loop for Tier-1 background agents.

Each agent runs inside a tmux session and periodically emits
status JSON plus log statements so the voice orchestrator can
reason about health without manual intervention.
"""

from __future__ import annotations

import argparse
import json
import os
import signal
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict


def iso_now() -> str:
    """Return current UTC time in ISO-8601 format with Z suffix."""
    return datetime.now(tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def atomic_write(path: Path, payload: Dict) -> None:
    """Atomically write JSON payload to path."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(".tmp")
    with tmp_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
    tmp_path.replace(path)


def append_log(log_path: Path, message: str) -> None:
    """Append a log line with timestamp."""
    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_path.touch(exist_ok=True)
    timestamp = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S %Z")
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(f"[{timestamp}] {message}\n")


def build_status(agent: str, session: str, status: str, notes: str) -> Dict:
    """Build common status payload."""
    return {
        "agent": agent,
        "phase": agent,
        "status": status,
        "heartbeat": iso_now(),
        "tmux_session": session,
        "notes": notes,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Emit periodic heartbeat updates for Tier-1 agents."
    )
    parser.add_argument("agent", help="Agent identifier (e.g., planning, artifact)")
    parser.add_argument("status_file", help="Path to JSON status file to manage")
    parser.add_argument("log_file", help="Path to agent log file")
    parser.add_argument(
        "--session",
        default="unknown",
        help="Associated tmux session name (for diagnostics)",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=15,
        help="Heartbeat interval in seconds (default: 15)",
    )
    parser.add_argument(
        "--notes",
        default="automatic heartbeat active",
        help="Human-readable note describing current loop",
    )

    args = parser.parse_args()
    status_path = Path(args.status_file)
    log_path = Path(args.log_file)

    running = True

    def stop_handler(signum, frame):  # noqa: D401
        """Capture termination for graceful shutdown."""
        nonlocal running
        running = False

    signal.signal(signal.SIGTERM, stop_handler)
    signal.signal(signal.SIGINT, stop_handler)

    # Initial status
    append_log(log_path, f"Heartbeat loop starting for agent '{args.agent}'")
    atomic_write(
        status_path,
        build_status(
            args.agent,
            args.session,
            status="running",
            notes=args.notes,
        ),
    )

    while running:
        time.sleep(max(1, args.interval))
        atomic_write(
            status_path,
            build_status(
                args.agent,
                args.session,
                status="running",
                notes=args.notes,
            ),
        )

    append_log(log_path, f"Heartbeat loop stopping for agent '{args.agent}'")
    atomic_write(
        status_path,
        build_status(
            args.agent,
            args.session,
            status="stopped",
            notes="agent heartbeat stopped (MAX_AUTO loop terminated)",
        ),
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
