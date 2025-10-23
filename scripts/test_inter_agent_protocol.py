#!/usr/bin/env python3
"""
Test script for inter-agent communication protocol.
Validates that Liv Hana and CODEX can coordinate via JSON files.
"""

import json
import time
from pathlib import Path
from inter_agent_utils import LivHanaCoordinator, CodexExecutor

ROOT = Path(__file__).parent.parent


def test_basic_communication():
    """Test basic task creation and result writing."""
    print("=" * 60)
    print("TEST 1: Basic Communication")
    print("=" * 60)

    # Liv Hana creates a task
    coordinator = LivHanaCoordinator()
    print("\n[Liv Hana] Creating test task...")

    task_id = coordinator.create_task_request(
        request_type="execute",
        priority="medium",
        payload={
            "task_type": "execute",
            "parameters": {
                "script_path": "/bin/echo",
                "args": ["Hello from CODEX"],
                "working_directory": str(ROOT),
                "capture_output": True,
                "timeout_seconds": 10,
            },
        },
        jesse_directive="Test basic inter-agent communication",
        blocking=False,
        timeout_seconds=30,
    )

    print(f"[Liv Hana] Task created: {task_id}")

    # Verify request file exists
    request_file = ROOT / "tmp/agent_status/codex_tasks" / f"task_{task_id}.request.json"
    assert request_file.exists(), "Request file not created"
    print(f"[Liv Hana] ✅ Request file created: {request_file}")

    # CODEX discovers and processes task
    executor = CodexExecutor()
    print("\n[CODEX] Discovering pending tasks...")

    tasks = executor.discover_pending_tasks()
    assert len(tasks) > 0, "No pending tasks found"
    print(f"[CODEX] Found {len(tasks)} pending task(s)")

    task = tasks[0]
    assert task["task_id"] == task_id, "Task ID mismatch"
    print(f"[CODEX] Processing task: {task_id}")

    # CODEX writes result
    executor.write_task_result(
        task_id=task_id,
        status="completed",
        success=True,
        summary="Test task executed successfully",
        artifacts_created=["test-output.txt"],
        execution_time_seconds=0.5,
    )

    result_file = ROOT / "tmp/agent_status/codex_tasks" / f"task_{task_id}.result.json"
    assert result_file.exists(), "Result file not created"
    print(f"[CODEX] ✅ Result file created: {result_file}")

    # Liv Hana reads result
    print("\n[Liv Hana] Reading task result...")
    result = coordinator.poll_task_result(task_id, timeout_seconds=5)

    assert result is not None, "Result not found"
    assert result["status"] == "completed", f"Unexpected status: {result['status']}"
    assert result["result"]["success"], "Task marked as failed"
    print(f"[Liv Hana] ✅ Result received: {result['result']['summary']}")

    print("\n✅ TEST 1 PASSED\n")


def test_heartbeat():
    """Test heartbeat mechanism."""
    print("=" * 60)
    print("TEST 2: Heartbeat Mechanism")
    print("=" * 60)

    # Liv Hana updates heartbeat
    coordinator = LivHanaCoordinator()
    print("\n[Liv Hana] Updating heartbeat...")

    coordinator.update_heartbeat(
        status="active", current_capacity=0.9, active_tasks=["task-123"], last_error=None
    )

    livhana_heartbeat = ROOT / "tmp/agent_status/livhana_status/heartbeat.json"
    assert livhana_heartbeat.exists(), "Liv Hana heartbeat not created"
    print(f"[Liv Hana] ✅ Heartbeat updated: {livhana_heartbeat}")

    # CODEX updates heartbeat
    executor = CodexExecutor()
    print("\n[CODEX] Updating heartbeat...")

    executor.update_heartbeat(
        status="idle", current_capacity=0.75, active_tasks=[], last_error=None
    )

    codex_heartbeat = ROOT / "tmp/agent_status/codex_status/heartbeat.json"
    assert codex_heartbeat.exists(), "CODEX heartbeat not created"
    print(f"[CODEX] ✅ Heartbeat updated: {codex_heartbeat}")

    # Liv Hana checks CODEX status
    print("\n[Liv Hana] Checking CODEX status...")
    codex_status = coordinator.get_codex_status()

    assert codex_status is not None, "CODEX status not found"
    assert codex_status["status"] == "idle", f"Unexpected status: {codex_status['status']}"
    assert codex_status["current_capacity"] == 0.75, "Capacity mismatch"
    print(f"[Liv Hana] ✅ CODEX status: {codex_status['status']} (capacity: {codex_status['current_capacity']:.0%})")

    print("\n✅ TEST 2 PASSED\n")


def test_coordination_log():
    """Test coordination log."""
    print("=" * 60)
    print("TEST 3: Coordination Log")
    print("=" * 60)

    coordinator = LivHanaCoordinator()
    print("\n[Liv Hana] Logging coordination event...")

    coordinator.log_coordination_event(
        event_type="test_event",
        message="This is a test event",
        task_id="test-task-123",
        target_agent="codex-cursor",
        metadata={"test": True, "version": "1.0"},
    )

    log_file = ROOT / "tmp/agent_status/shared/coordination_log.jsonl"
    assert log_file.exists(), "Coordination log not found"
    print(f"[Liv Hana] ✅ Event logged to: {log_file}")

    # Read log and verify event
    with open(log_file) as f:
        lines = f.readlines()

    assert len(lines) > 0, "No events in log"
    last_event = json.loads(lines[-1])
    assert last_event["event_type"] == "test_event", "Event type mismatch"
    assert last_event["source_agent"] == "livhana-layer1.1", "Source agent mismatch"
    print(f"[Liv Hana] ✅ Event verified: {last_event['message']}")

    print("\n✅ TEST 3 PASSED\n")


def test_capacity_throttle():
    """Test capacity throttling."""
    print("=" * 60)
    print("TEST 4: Capacity Throttling")
    print("=" * 60)

    executor = CodexExecutor()
    print("\n[CODEX] Checking current capacity...")

    capacity = executor.check_capacity()
    print(f"[CODEX] Current capacity: {capacity:.2%}")

    # Simulate low capacity
    print("\n[CODEX] Simulating low capacity scenario (15% available)...")

    # Create task with high throttle threshold
    coordinator = LivHanaCoordinator()
    task_id = coordinator.create_task_request(
        request_type="execute",
        priority="low",
        payload={"task_type": "execute", "parameters": {}},
        jesse_directive="Test capacity throttle",
        blocking=False,
        throttle_capacity=0.9,  # Requires 90% capacity
    )

    # CODEX should defer if capacity < 90%
    if capacity < 0.9:
        print(f"[CODEX] Capacity {capacity:.2%} below threshold 90% - deferring task")

        executor.write_task_result(
            task_id=task_id,
            status="deferred",
            success=False,
            summary=f"Capacity {capacity:.2%} below threshold 90%",
            errors=[
                {
                    "code": "CAPACITY_EXCEEDED",
                    "message": "Cursor overloaded, deferring task",
                    "severity": "warning",
                }
            ],
            next_actions=[
                {"action": "retry_after_60_seconds", "priority": "high", "requires_jesse": False}
            ],
        )

        # Verify result
        result = coordinator.poll_task_result(task_id, timeout_seconds=5)
        assert result["status"] == "deferred", f"Expected deferred, got {result['status']}"
        print(f"[CODEX] ✅ Task deferred correctly")
    else:
        print(f"[CODEX] Capacity {capacity:.2%} above threshold - accepting task")
        executor.write_task_result(
            task_id=task_id, status="completed", success=True, summary="Task completed"
        )

    print("\n✅ TEST 4 PASSED\n")


def test_progress_updates():
    """Test progress updates for long-running tasks."""
    print("=" * 60)
    print("TEST 5: Progress Updates")
    print("=" * 60)

    coordinator = LivHanaCoordinator()
    print("\n[Liv Hana] Creating long-running task with progress updates...")

    task_id = coordinator.create_task_request(
        request_type="deploy",
        priority="high",
        payload={
            "task_type": "deploy",
            "parameters": {"service_name": "test-service", "environment": "staging"},
        },
        jesse_directive="Deploy test service with progress tracking",
        blocking=False,
        progress_updates_required=True,
    )

    print(f"[Liv Hana] Task created: {task_id}")

    # CODEX simulates progress updates
    executor = CodexExecutor()
    print("\n[CODEX] Simulating deployment with progress updates...")

    steps = [
        (0, "Starting deployment"),
        (25, "Building container"),
        (50, "Pushing to registry"),
        (75, "Deploying to Cloud Run"),
        (100, "Deployment complete"),
    ]

    for i, (progress, step) in enumerate(steps):
        executor.update_task_progress(
            task_id=task_id,
            progress_percent=progress,
            current_step=step,
            steps_completed=i,
            steps_total=len(steps),
        )
        print(f"[CODEX] Progress: {progress}% - {step}")
        time.sleep(0.5)

    # Write final result
    executor.write_task_result(
        task_id=task_id,
        status="completed",
        success=True,
        summary="Test service deployed successfully",
        execution_time_seconds=2.5,
    )

    # Verify progress file exists
    progress_file = ROOT / "tmp/agent_status/codex_tasks" / f"task_{task_id}.progress.json"
    assert progress_file.exists(), "Progress file not created"
    print(f"[CODEX] ✅ Progress file created: {progress_file}")

    # Liv Hana reads final result
    print("\n[Liv Hana] Reading deployment result...")
    result = coordinator.poll_task_result(task_id, timeout_seconds=5)

    assert result["status"] == "completed", f"Unexpected status: {result['status']}"
    print(f"[Liv Hana] ✅ Deployment result: {result['result']['summary']}")

    print("\n✅ TEST 5 PASSED\n")


def cleanup_test_files():
    """Clean up test artifacts."""
    print("\n[Cleanup] Removing test files...")

    codex_tasks_dir = ROOT / "tmp/agent_status/codex_tasks"
    for file in codex_tasks_dir.glob("task_*.json"):
        file.unlink()
        print(f"  Removed: {file.name}")

    print("[Cleanup] ✅ Test files cleaned up")


def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("INTER-AGENT COMMUNICATION PROTOCOL - TEST SUITE")
    print("=" * 60 + "\n")

    tests = [
        test_basic_communication,
        test_heartbeat,
        test_coordination_log,
        test_capacity_throttle,
        test_progress_updates,
    ]

    passed = 0
    failed = 0

    for test_func in tests:
        try:
            test_func()
            passed += 1
        except AssertionError as e:
            print(f"\n❌ TEST FAILED: {e}\n")
            failed += 1
        except Exception as e:
            print(f"\n❌ TEST ERROR: {e}\n")
            failed += 1

    # Cleanup
    try:
        cleanup_test_files()
    except Exception as e:
        print(f"[Cleanup] Warning: {e}")

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Passed: {passed}/{len(tests)}")
    print(f"Failed: {failed}/{len(tests)}")

    if failed == 0:
        print("\n✅ ALL TESTS PASSED")
        return 0
    else:
        print(f"\n❌ {failed} TEST(S) FAILED")
        return 1


if __name__ == "__main__":
    exit(main())
