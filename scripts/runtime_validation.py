#!/usr/bin/env python3
"""
Runtime Validation Module for Claude Tier-1 Sessions

Validates operational constraints during session execution:
- Todo list compliance (max 1 task in_progress)
- Token budget tracking
- Agent coordination rules
- File operation principles
- Checkpoint intervals

Based on: AGENT_DEPLOYMENT_FORENSIC_ANALYSIS_2025-10-21.md
Prevents: Multiple in_progress tasks (Crash #1), parallel agent conflicts

Usage:
    from runtime_validation import TodoValidator, TokenTracker, AgentCoordinator

    # Check todo list
    validator = TodoValidator()
    if not validator.validate_todo_list(todos):
        raise ValidationError("Multiple tasks in_progress")

    # Track tokens
    tracker = TokenTracker(budget=200000)
    tracker.log_usage(5000, "agent_spawn")
    if tracker.is_over_budget():
        raise BudgetExceeded()
"""

import json
import time
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional


class TaskStatus(Enum):
    """Valid task statuses per TodoWrite contract"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class ValidationError(Exception):
    """Raised when validation rules are violated"""
    pass


class BudgetExceeded(Exception):
    """Raised when token budget is exceeded"""
    pass


@dataclass
class Task:
    """Represents a single todo task"""
    content: str
    status: TaskStatus
    activeForm: str
    timestamp: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Task":
        """Create Task from dictionary"""
        return cls(
            content=data["content"],
            status=TaskStatus(data["status"]),
            activeForm=data["activeForm"],
            timestamp=datetime.now()
        )

    def is_in_progress(self) -> bool:
        """Check if task is in progress"""
        return self.status == TaskStatus.IN_PROGRESS

    def is_stale(self, max_age_minutes: int = 30) -> bool:
        """Check if task has been in_progress too long"""
        if not self.timestamp or not self.is_in_progress():
            return False
        age = (datetime.now() - self.timestamp).total_seconds() / 60
        return age > max_age_minutes


class TodoValidator:
    """
    Validates todo list compliance with TodoWrite tool contract

    Rules enforced:
    1. Exactly ONE task can be "in_progress" at any time
    2. Tasks in_progress for >30min are considered stale
    3. All required fields present (content, status, activeForm)
    """

    def __init__(self):
        self.violations: List[str] = []

    def validate_todo_list(self, todos: List[Dict[str, Any]]) -> bool:
        """
        Validate todo list against rules

        Args:
            todos: List of todo task dictionaries

        Returns:
            True if valid, False if violations found

        Side effects:
            Populates self.violations with error messages
        """
        self.violations = []

        if not todos:
            return True  # Empty list is valid

        # Parse tasks
        try:
            tasks = [Task.from_dict(t) for t in todos]
        except (KeyError, ValueError) as e:
            self.violations.append(f"Malformed task: {e}")
            return False

        # Rule 1: Exactly one task in_progress
        in_progress_tasks = [t for t in tasks if t.is_in_progress()]

        if len(in_progress_tasks) == 0:
            self.violations.append(
                "No tasks marked 'in_progress' - should have exactly 1 active task"
            )
            return False

        if len(in_progress_tasks) > 1:
            self.violations.append(
                f"Multiple tasks in_progress ({len(in_progress_tasks)}) - "
                f"TodoWrite contract allows EXACTLY 1"
            )
            for task in in_progress_tasks:
                self.violations.append(f"  - {task.content}")
            return False

        # Rule 2: Check for stale tasks
        stale_tasks = [t for t in tasks if t.is_stale()]
        if stale_tasks:
            for task in stale_tasks:
                self.violations.append(
                    f"Stale task (>30min in_progress): {task.content}"
                )

        # Rule 3: Validate required fields
        for i, task in enumerate(tasks):
            if not task.content:
                self.violations.append(f"Task {i}: Missing 'content' field")
            if not task.activeForm:
                self.violations.append(f"Task {i}: Missing 'activeForm' field")

        return len(self.violations) == 0

    def get_violations(self) -> List[str]:
        """Get list of validation violations"""
        return self.violations

    def get_in_progress_task(self, todos: List[Dict[str, Any]]) -> Optional[Task]:
        """Get the current in_progress task (if valid)"""
        if not self.validate_todo_list(todos):
            return None
        tasks = [Task.from_dict(t) for t in todos]
        in_progress = [t for t in tasks if t.is_in_progress()]
        return in_progress[0] if in_progress else None


@dataclass
class TokenUsageEntry:
    """Records a single token usage event"""
    timestamp: datetime
    amount: int
    context: str
    cumulative: int


class TokenTracker:
    """
    Tracks token usage against budget

    Usage:
        tracker = TokenTracker(budget=200000)
        tracker.log_usage(5000, "initial_prompt")
        tracker.log_usage(3000, "agent_response")

        if tracker.is_over_budget():
            print(f"Over budget by {tracker.get_overage()}")
    """

    def __init__(self, budget: int = 200000):
        self.budget = budget
        self.usage_log: List[TokenUsageEntry] = []
        self.cumulative_usage = 0

    def log_usage(self, amount: int, context: str = "") -> None:
        """
        Log token usage

        Args:
            amount: Number of tokens used
            context: Description of what used the tokens
        """
        self.cumulative_usage += amount
        entry = TokenUsageEntry(
            timestamp=datetime.now(),
            amount=amount,
            context=context,
            cumulative=self.cumulative_usage
        )
        self.usage_log.append(entry)

    def get_remaining(self) -> int:
        """Get remaining token budget"""
        return self.budget - self.cumulative_usage

    def get_usage_percentage(self) -> float:
        """Get percentage of budget used"""
        return (self.cumulative_usage / self.budget) * 100

    def is_over_budget(self, threshold: float = 1.0) -> bool:
        """
        Check if over budget

        Args:
            threshold: Percentage threshold (1.0 = 100%)
        """
        return self.get_usage_percentage() > (threshold * 100)

    def get_overage(self) -> int:
        """Get amount over budget (negative if under)"""
        return self.cumulative_usage - self.budget

    def should_warn(self, warning_threshold: float = 0.8) -> bool:
        """Check if approaching budget limit"""
        return self.get_usage_percentage() > (warning_threshold * 100)

    def get_summary(self) -> Dict[str, Any]:
        """Get usage summary"""
        return {
            "budget": self.budget,
            "used": self.cumulative_usage,
            "remaining": self.get_remaining(),
            "percentage": round(self.get_usage_percentage(), 2),
            "over_budget": self.is_over_budget(),
            "entries": len(self.usage_log)
        }

    def save_to_file(self, filepath: Path) -> None:
        """Save usage log to JSON file"""
        data = {
            "budget": self.budget,
            "cumulative_usage": self.cumulative_usage,
            "entries": [
                {
                    "timestamp": e.timestamp.isoformat(),
                    "amount": e.amount,
                    "context": e.context,
                    "cumulative": e.cumulative
                }
                for e in self.usage_log
            ]
        }
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)


@dataclass
class AgentInfo:
    """Information about a running agent"""
    agent_id: str
    task: str
    started_at: datetime
    parent_agent_id: Optional[str] = None
    timeout_seconds: int = 3600
    expected_output: Optional[str] = None

    def is_timed_out(self) -> bool:
        """Check if agent has exceeded timeout"""
        runtime = (datetime.now() - self.started_at).total_seconds()
        return runtime > self.timeout_seconds

    def get_runtime_seconds(self) -> int:
        """Get agent runtime in seconds"""
        return int((datetime.now() - self.started_at).total_seconds())


class AgentCoordinator:
    """
    Tracks and validates agent coordination

    Prevents:
    - Parallel agents without explicit coordination
    - Agent spawning without clear task specification
    - Missing timeout configuration
    - Undefined expected outputs

    Based on forensic analysis error category 1
    """

    def __init__(self, max_parallel_agents: int = 1):
        self.max_parallel_agents = max_parallel_agents
        self.active_agents: Dict[str, AgentInfo] = {}
        self.completed_agents: List[AgentInfo] = []

    def register_agent(
        self,
        agent_id: str,
        task: str,
        parent_agent_id: Optional[str] = None,
        timeout_seconds: int = 3600,
        expected_output: Optional[str] = None
    ) -> None:
        """
        Register a new agent

        Args:
            agent_id: Unique agent identifier
            task: Clear task specification
            parent_agent_id: Parent agent if this is a subagent
            timeout_seconds: Maximum runtime
            expected_output: Expected deliverable

        Raises:
            ValidationError: If coordination rules violated
        """
        # Check if too many agents
        if len(self.active_agents) >= self.max_parallel_agents:
            raise ValidationError(
                f"Cannot spawn agent - already {len(self.active_agents)} active "
                f"(max {self.max_parallel_agents}). "
                f"Active agents: {list(self.active_agents.keys())}"
            )

        # Check if task specified
        if not task or len(task.strip()) == 0:
            raise ValidationError("Cannot spawn agent without clear task specification")

        # Check if expected output specified
        if not expected_output:
            raise ValidationError(
                f"Cannot spawn agent without expected output specification. "
                f"Task: {task}"
            )

        # Register agent
        agent_info = AgentInfo(
            agent_id=agent_id,
            task=task,
            started_at=datetime.now(),
            parent_agent_id=parent_agent_id,
            timeout_seconds=timeout_seconds,
            expected_output=expected_output
        )
        self.active_agents[agent_id] = agent_info

    def complete_agent(self, agent_id: str) -> None:
        """Mark agent as completed"""
        if agent_id in self.active_agents:
            agent_info = self.active_agents.pop(agent_id)
            self.completed_agents.append(agent_info)

    def check_timeouts(self) -> List[str]:
        """
        Check for timed out agents

        Returns:
            List of agent IDs that have timed out
        """
        timed_out = []
        for agent_id, agent_info in self.active_agents.items():
            if agent_info.is_timed_out():
                timed_out.append(agent_id)
        return timed_out

    def get_active_agent_count(self) -> int:
        """Get number of active agents"""
        return len(self.active_agents)

    def can_spawn_agent(self) -> bool:
        """Check if another agent can be spawned"""
        return len(self.active_agents) < self.max_parallel_agents

    def get_agent_info(self, agent_id: str) -> Optional[AgentInfo]:
        """Get info about an agent"""
        return self.active_agents.get(agent_id)

    def get_summary(self) -> Dict[str, Any]:
        """Get coordination summary"""
        return {
            "max_parallel": self.max_parallel_agents,
            "active_count": len(self.active_agents),
            "completed_count": len(self.completed_agents),
            "can_spawn": self.can_spawn_agent(),
            "active_agents": [
                {
                    "id": agent_id,
                    "task": info.task,
                    "runtime_seconds": info.get_runtime_seconds(),
                    "timed_out": info.is_timed_out()
                }
                for agent_id, info in self.active_agents.items()
            ]
        }


class CheckpointManager:
    """
    Manages periodic checkpoints for recovery

    Saves state every N minutes to enable recovery after crashes
    """

    def __init__(self, checkpoint_dir: Path, interval_minutes: int = 5):
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        self.interval_minutes = interval_minutes
        self.last_checkpoint: Optional[datetime] = None

    def should_checkpoint(self) -> bool:
        """Check if it's time for a checkpoint"""
        if not self.last_checkpoint:
            return True
        elapsed = (datetime.now() - self.last_checkpoint).total_seconds() / 60
        return elapsed >= self.interval_minutes

    def save_checkpoint(self, state: Dict[str, Any]) -> Path:
        """
        Save checkpoint

        Args:
            state: State dictionary to save

        Returns:
            Path to checkpoint file
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        checkpoint_file = self.checkpoint_dir / f"checkpoint_{timestamp}.json"

        checkpoint_data = {
            "timestamp": datetime.now().isoformat(),
            "state": state
        }

        with open(checkpoint_file, 'w') as f:
            json.dump(checkpoint_data, f, indent=2)

        self.last_checkpoint = datetime.now()
        return checkpoint_file

    def load_latest_checkpoint(self) -> Optional[Dict[str, Any]]:
        """Load most recent checkpoint"""
        checkpoints = sorted(self.checkpoint_dir.glob("checkpoint_*.json"))
        if not checkpoints:
            return None

        latest = checkpoints[-1]
        with open(latest, 'r') as f:
            data = json.load(f)

        return data["state"]

    def cleanup_old_checkpoints(self, keep_last: int = 10) -> None:
        """Remove old checkpoints, keeping only the N most recent"""
        checkpoints = sorted(self.checkpoint_dir.glob("checkpoint_*.json"))
        if len(checkpoints) <= keep_last:
            return

        for checkpoint in checkpoints[:-keep_last]:
            checkpoint.unlink()


# Convenience functions for common validations

def validate_todos(todos: List[Dict[str, Any]]) -> bool:
    """
    Validate todo list

    Returns:
        True if valid, False otherwise

    Raises:
        ValidationError with details if invalid
    """
    validator = TodoValidator()
    if not validator.validate_todo_list(todos):
        raise ValidationError(
            "Todo list validation failed:\n" +
            "\n".join(f"  - {v}" for v in validator.get_violations())
        )
    return True


def check_can_spawn_agent(coordinator: AgentCoordinator) -> bool:
    """
    Check if agent can be spawned

    Raises:
        ValidationError if cannot spawn
    """
    if not coordinator.can_spawn_agent():
        raise ValidationError(
            f"Cannot spawn agent - {coordinator.get_active_agent_count()} "
            f"already active (max {coordinator.max_parallel_agents})"
        )
    return True


if __name__ == "__main__":
    # Self-test
    print("Runtime Validation Module - Self Test")
    print("=" * 50)

    # Test 1: TodoValidator
    print("\nTest 1: Todo Validation")
    validator = TodoValidator()

    valid_todos = [
        {"content": "Task 1", "status": "pending", "activeForm": "Doing task 1"},
        {"content": "Task 2", "status": "in_progress", "activeForm": "Doing task 2"},
        {"content": "Task 3", "status": "completed", "activeForm": "Did task 3"}
    ]

    if validator.validate_todo_list(valid_todos):
        print("✓ Valid todo list passed")
    else:
        print("✗ Valid todo list failed")

    invalid_todos = [
        {"content": "Task 1", "status": "in_progress", "activeForm": "Doing task 1"},
        {"content": "Task 2", "status": "in_progress", "activeForm": "Doing task 2"}
    ]

    if not validator.validate_todo_list(invalid_todos):
        print("✓ Invalid todo list caught")
        print(f"  Violations: {validator.get_violations()[0]}")

    # Test 2: TokenTracker
    print("\nTest 2: Token Tracking")
    tracker = TokenTracker(budget=10000)
    tracker.log_usage(3000, "initial_prompt")
    tracker.log_usage(2000, "response")
    print(f"✓ Used {tracker.cumulative_usage}/{tracker.budget} tokens")
    print(f"  {tracker.get_usage_percentage():.1f}% of budget")

    # Test 3: AgentCoordinator
    print("\nTest 3: Agent Coordination")
    coordinator = AgentCoordinator(max_parallel_agents=1)

    try:
        coordinator.register_agent(
            agent_id="agent1",
            task="Test task",
            expected_output="test_output.json"
        )
        print("✓ Agent registered successfully")
    except ValidationError as e:
        print(f"✗ Registration failed: {e}")

    try:
        coordinator.register_agent(
            agent_id="agent2",
            task="Second task",
            expected_output="output2.json"
        )
        print("✗ Should have prevented second agent")
    except ValidationError:
        print("✓ Prevented second agent (max_parallel=1)")

    print("\n" + "=" * 50)
    print("Self-test complete")
