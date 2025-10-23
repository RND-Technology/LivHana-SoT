#!/usr/bin/env python3
"""
Codex Task Queue Producer/Consumer Utilities

Manages task queue in tmp/agent_status/codex_tasks.json
following the inter-agent communication protocol.

Producer: Adds tasks to the queue
Consumer: Reads and processes tasks from the queue
"""

import json
import os
import sys
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class CodexTaskQueue:
    """Manages the Codex task queue with file locking."""

    def __init__(self, queue_file: str = None):
        """Initialize the task queue manager."""
        if queue_file is None:
            root = Path(__file__).parent.parent
            queue_file = root / "tmp" / "agent_status" / "codex_tasks.json"

        self.queue_file = Path(queue_file)
        self.queue_file.parent.mkdir(parents=True, exist_ok=True)

        # Initialize queue file if it doesn't exist
        if not self.queue_file.exists():
            self._write_queue({"tasks": [], "last_updated": None})

    def _read_queue(self) -> Dict:
        """Read the current queue state."""
        try:
            with open(self.queue_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {"tasks": [], "last_updated": None}

    def _write_queue(self, data: Dict) -> None:
        """Write the queue state atomically."""
        data["last_updated"] = datetime.utcnow().isoformat() + "Z"

        # Write to temp file first, then rename (atomic)
        temp_file = self.queue_file.with_suffix('.tmp')
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            f.write('\n')

        temp_file.replace(self.queue_file)

    def add_task(
        self,
        task_type: str,
        parameters: Dict,
        priority: str = "medium",
        blocking: bool = False,
        timeout_seconds: int = 300
    ) -> str:
        """
        Add a task to the queue (Producer).

        Args:
            task_type: Type of task (execute, research, validate, deploy)
            parameters: Task-specific parameters
            priority: Task priority (critical, high, medium, low)
            blocking: Whether Liv Hana should wait for completion
            timeout_seconds: Maximum execution time

        Returns:
            task_id: UUID of the created task
        """
        task_id = str(uuid.uuid4())

        task = {
            "task_id": task_id,
            "request_type": task_type,
            "priority": priority,
            "source_agent": "livhana-layer1.1",
            "target_agent": "codex-cursor",
            "created_at": datetime.utcnow().isoformat() + "Z",
            "timeout_seconds": timeout_seconds,
            "status": "pending",
            "payload": {
                "task_type": task_type,
                "parameters": parameters
            },
            "coordination": {
                "blocking": blocking,
                "progress_updates_required": timeout_seconds > 60
            }
        }

        queue = self._read_queue()
        queue["tasks"].append(task)
        self._write_queue(queue)

        return task_id

    def get_pending_tasks(self) -> List[Dict]:
        """Get all pending tasks (Consumer)."""
        queue = self._read_queue()
        return [t for t in queue["tasks"] if t.get("status") == "pending"]

    def get_task(self, task_id: str) -> Optional[Dict]:
        """Get a specific task by ID."""
        queue = self._read_queue()
        for task in queue["tasks"]:
            if task["task_id"] == task_id:
                return task
        return None

    def update_task_status(
        self,
        task_id: str,
        status: str,
        result: Optional[Dict] = None
    ) -> bool:
        """
        Update task status (Consumer).

        Args:
            task_id: UUID of the task
            status: New status (in_progress, completed, failed, timeout)
            result: Optional result data

        Returns:
            bool: True if task was found and updated
        """
        queue = self._read_queue()

        for task in queue["tasks"]:
            if task["task_id"] == task_id:
                task["status"] = status
                task["updated_at"] = datetime.utcnow().isoformat() + "Z"

                if result:
                    task["result"] = result

                self._write_queue(queue)
                return True

        return False

    def remove_completed_tasks(self, max_age_seconds: int = 3600) -> int:
        """
        Remove completed/failed tasks older than max_age_seconds.

        Returns:
            int: Number of tasks removed
        """
        queue = self._read_queue()
        now = datetime.utcnow()

        original_count = len(queue["tasks"])

        queue["tasks"] = [
            t for t in queue["tasks"]
            if t.get("status") not in ["completed", "failed"]
            or (datetime.fromisoformat(t.get("updated_at", t["created_at"]).rstrip("Z"))
                - now).total_seconds() < max_age_seconds
        ]

        removed = original_count - len(queue["tasks"])

        if removed > 0:
            self._write_queue(queue)

        return removed

    def get_stats(self) -> Dict:
        """Get queue statistics."""
        queue = self._read_queue()
        tasks = queue["tasks"]

        return {
            "total_tasks": len(tasks),
            "pending": len([t for t in tasks if t.get("status") == "pending"]),
            "in_progress": len([t for t in tasks if t.get("status") == "in_progress"]),
            "completed": len([t for t in tasks if t.get("status") == "completed"]),
            "failed": len([t for t in tasks if t.get("status") == "failed"]),
            "last_updated": queue.get("last_updated")
        }


def main():
    """CLI interface for task queue management."""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  codex_task_queue.py add <type> <params_json>")
        print("  codex_task_queue.py list [status]")
        print("  codex_task_queue.py update <task_id> <status> [result_json]")
        print("  codex_task_queue.py stats")
        print("  codex_task_queue.py cleanup [max_age_seconds]")
        sys.exit(1)

    queue = CodexTaskQueue()
    command = sys.argv[1]

    if command == "add":
        if len(sys.argv) < 4:
            print("Error: add requires type and parameters", file=sys.stderr)
            sys.exit(1)

        task_type = sys.argv[2]
        parameters = json.loads(sys.argv[3])

        task_id = queue.add_task(task_type, parameters)
        print(json.dumps({"task_id": task_id, "status": "added"}))

    elif command == "list":
        status_filter = sys.argv[2] if len(sys.argv) > 2 else None

        if status_filter:
            q = queue._read_queue()
            tasks = [t for t in q["tasks"] if t.get("status") == status_filter]
        else:
            tasks = queue._read_queue()["tasks"]

        print(json.dumps(tasks, indent=2))

    elif command == "update":
        if len(sys.argv) < 4:
            print("Error: update requires task_id and status", file=sys.stderr)
            sys.exit(1)

        task_id = sys.argv[2]
        status = sys.argv[3]
        result = json.loads(sys.argv[4]) if len(sys.argv) > 4 else None

        success = queue.update_task_status(task_id, status, result)
        print(json.dumps({"success": success}))

    elif command == "stats":
        stats = queue.get_stats()
        print(json.dumps(stats, indent=2))

    elif command == "cleanup":
        max_age = int(sys.argv[2]) if len(sys.argv) > 2 else 3600
        removed = queue.remove_completed_tasks(max_age)
        print(json.dumps({"removed": removed}))

    else:
        print(f"Error: Unknown command '{command}'", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
