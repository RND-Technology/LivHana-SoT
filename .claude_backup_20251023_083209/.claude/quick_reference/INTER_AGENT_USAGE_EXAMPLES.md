# Inter-Agent Communication - Usage Examples

Quick reference guide for using the inter-agent communication protocol between Liv Hana and CODEX.

## Quick Start

### 1. Initialize Communication (One-Time Setup)

Already done! Protocol initialized at boot. Verify with:

```bash
# Check directory structure
ls -la tmp/agent_status/

# Check agent registry
cat tmp/agent_status/shared/agent_registry.json

# Check coordination log
tail tmp/agent_status/shared/coordination_log.jsonl
```

### 2. Liv Hana: Send Task to CODEX

```python
from scripts.inter_agent_utils import LivHanaCoordinator

coordinator = LivHanaCoordinator()

# Create a simple execution task
task_id = coordinator.create_task_request(
    request_type="execute",
    priority="high",
    payload={
        "task_type": "execute",
        "parameters": {
            "script_path": "/absolute/path/to/scripts/START.sh",
            "args": ["preflight"],
            "working_directory": "/absolute/path/to/project",
            "capture_output": True,
            "timeout_seconds": 120
        }
    },
    jesse_directive="Run preflight checks to validate environment",
    blocking=True,  # Wait for result
    timeout_seconds=180
)

print(f"Task created: {task_id}")

# Poll for result
result = coordinator.poll_task_result(task_id, timeout_seconds=180)
print(f"Result: {result['status']}")
print(f"Summary: {result['result']['summary']}")
```

### 3. CODEX: Process Pending Tasks

```python
from scripts.inter_agent_utils import CodexExecutor
import time

executor = CodexExecutor()

# Discover pending tasks
tasks = executor.discover_pending_tasks()
print(f"Found {len(tasks)} pending tasks")

for task in tasks:
    task_id = task["task_id"]
    print(f"Processing task: {task_id}")

    # Check capacity before accepting
    capacity = executor.check_capacity()
    if capacity < task["throttle_capacity"]:
        # Defer task
        executor.write_task_result(
            task_id=task_id,
            status="deferred",
            success=False,
            summary=f"Capacity {capacity:.2%} below threshold {task['throttle_capacity']:.2%}",
            errors=[{
                "code": "CAPACITY_EXCEEDED",
                "message": "Cursor overloaded, deferring task",
                "severity": "warning"
            }],
            next_actions=[{
                "action": "retry_after_60_seconds",
                "priority": "high",
                "requires_jesse": False
            }]
        )
        continue

    # Execute task (example: run script)
    start_time = time.time()
    try:
        # TODO: Actual task execution logic here
        success = True
        summary = "Task completed successfully"
        errors = []
    except Exception as e:
        success = False
        summary = f"Task failed: {str(e)}"
        errors = [{
            "code": "EXECUTION_FAILED",
            "message": str(e),
            "severity": "error"
        }]

    execution_time = time.time() - start_time

    # Write result
    executor.write_task_result(
        task_id=task_id,
        status="completed" if success else "failed",
        success=success,
        summary=summary,
        errors=errors,
        execution_time_seconds=execution_time
    )
```

## Common Use Cases

### Use Case 1: Run Preflight Checks

**Scenario**: Liv Hana needs CODEX to validate environment before deployment

```python
# Liv Hana side
coordinator = LivHanaCoordinator()

task_id = coordinator.create_task_request(
    request_type="validate",
    priority="critical",
    payload={
        "task_type": "validate",
        "parameters": {
            "validation_type": "preflight",
            "target_files": [],
            "strict_mode": True
        }
    },
    jesse_directive="Validate environment meets all requirements",
    blocking=True,
    timeout_seconds=120
)

# Wait for result
result = coordinator.poll_task_result(task_id)

if result["status"] == "completed" and result["result"]["success"]:
    print("✅ Preflight checks passed")
else:
    print("❌ Preflight checks failed")
    for error in result.get("errors", []):
        print(f"  - {error['message']}")
```

### Use Case 2: Background Research

**Scenario**: Liv Hana needs CODEX to research codebase (non-blocking)

```python
# Liv Hana side
coordinator = LivHanaCoordinator()

task_id = coordinator.create_task_request(
    request_type="research",
    priority="medium",
    payload={
        "task_type": "research",
        "parameters": {
            "query": "How does the voice_mode_boot.sh handle silence protocol?",
            "search_paths": [
                "/absolute/path/to/scripts",
                "/absolute/path/to/.claude"
            ],
            "depth": "thorough",
            "output_format": "markdown"
        }
    },
    jesse_directive="Research voice mode silence protocol implementation",
    blocking=False,  # Don't wait
    timeout_seconds=600
)

print(f"Research task {task_id} started in background")
print("Liv Hana continues with other work...")

# Check result later
time.sleep(60)
result = coordinator.poll_task_result(task_id, timeout_seconds=5)
if result and result["status"] == "completed":
    print(f"Research complete: {result['result']['summary']}")
```

### Use Case 3: Long-Running Deployment with Progress

**Scenario**: Deploy service with progress updates to Jesse

```python
# Liv Hana side
coordinator = LivHanaCoordinator()

task_id = coordinator.create_task_request(
    request_type="deploy",
    priority="high",
    payload={
        "task_type": "deploy",
        "parameters": {
            "service_name": "voice-service",
            "environment": "production",
            "gcp_project": "reggieanddrodispensary",
            "region": "us-central1",
            "dry_run": False
        }
    },
    jesse_directive="Deploy voice-service to production",
    blocking=True,
    timeout_seconds=600,
    progress_updates_required=True
)

# Monitor progress
import json
progress_file = f"tmp/agent_status/codex_tasks/task_{task_id}.progress.json"

while True:
    if Path(progress_file).exists():
        with open(progress_file) as f:
            progress = json.load(f)
        print(f"Progress: {progress['progress_percent']}% - {progress['current_step']}")

    # Check if completed
    result_file = f"tmp/agent_status/codex_tasks/task_{task_id}.result.json"
    if Path(result_file).exists():
        with open(result_file) as f:
            result = json.load(f)
        print(f"Deployment {result['status']}")
        break

    time.sleep(5)
```

```python
# CODEX side (in deployment script)
executor = CodexExecutor()

# Start deployment
executor.update_task_progress(
    task_id=task_id,
    progress_percent=0,
    current_step="Building Docker image",
    steps_completed=0,
    steps_total=5
)

# ... build image ...
time.sleep(30)

executor.update_task_progress(
    task_id=task_id,
    progress_percent=20,
    current_step="Pushing to GCR",
    steps_completed=1,
    steps_total=5
)

# ... push to registry ...
time.sleep(40)

executor.update_task_progress(
    task_id=task_id,
    progress_percent=60,
    current_step="Deploying to Cloud Run",
    steps_completed=3,
    steps_total=5
)

# ... deploy ...
time.sleep(30)

executor.update_task_progress(
    task_id=task_id,
    progress_percent=100,
    current_step="Deployment complete",
    steps_completed=5,
    steps_total=5
)

# Write final result
executor.write_task_result(
    task_id=task_id,
    status="completed",
    success=True,
    summary="Voice-service deployed successfully to production",
    artifacts_created=[
        "https://voice-service-xxxxx-uc.a.run.app"
    ]
)
```

### Use Case 4: Multi-Agent Chain

**Scenario**: Sequential tasks where output of one feeds into next

```python
# Liv Hana side
coordinator = LivHanaCoordinator()

# Step 1: Research
research_task_id = coordinator.create_task_request(
    request_type="research",
    priority="high",
    payload={
        "task_type": "research",
        "parameters": {
            "query": "Find all TODO comments in voice-service code",
            "search_paths": ["/absolute/path/to/backend/voice-service"],
            "depth": "thorough",
            "output_format": "json"
        }
    },
    jesse_directive="Find all TODOs in voice-service",
    blocking=True
)

research_result = coordinator.poll_task_result(research_task_id)

if research_result["status"] == "completed":
    todos = research_result["result"]["artifacts_created"]

    # Step 2: Validate TODOs against requirements
    validate_task_id = coordinator.create_task_request(
        request_type="validate",
        priority="high",
        payload={
            "task_type": "validate",
            "parameters": {
                "validation_type": "requirements",
                "target_files": todos,
                "strict_mode": True
            }
        },
        jesse_directive="Validate TODOs are addressed before shipping",
        blocking=True
    )

    validate_result = coordinator.poll_task_result(validate_task_id)

    if validate_result["status"] == "completed":
        print("✅ All TODOs validated")
    else:
        print("❌ Validation failed - TODOs must be resolved")
```

## Command-Line Interface

### Check Agent Status

```bash
# Check CODEX status from Liv Hana
python3 scripts/inter_agent_utils.py --agent livhana --action status

# Discover pending tasks from CODEX
python3 scripts/inter_agent_utils.py --agent codex --action discover

# Check CODEX capacity
python3 scripts/inter_agent_utils.py --agent codex --action capacity
```

### Monitor Task

```bash
# Poll for task result
python3 scripts/inter_agent_utils.py \
  --agent livhana \
  --action poll \
  --task-id <task-id> \
  --timeout 300
```

### View Coordination Log

```bash
# View all coordination events
cat tmp/agent_status/shared/coordination_log.jsonl | jq '.'

# Filter by event type
cat tmp/agent_status/shared/coordination_log.jsonl | \
  jq 'select(.event_type == "task_completed")'

# View recent events
tail -20 tmp/agent_status/shared/coordination_log.jsonl | jq '.'
```

## Troubleshooting

### Problem: CODEX not picking up tasks

**Solution**: Check heartbeat

```bash
cat tmp/agent_status/codex_status/heartbeat.json
```

If `status: "unknown"`, CODEX hasn't booted. Run:

```bash
bash scripts/codex_agent_boot.sh
```

### Problem: Task stuck in pending

**Solution**: Check if result file exists

```bash
ls tmp/agent_status/codex_tasks/task_*.result.json
```

If result exists but polling fails, check file permissions.

### Problem: Capacity exceeded

**Solution**: Wait for CODEX to finish current tasks

```bash
# Check current capacity
python3 scripts/inter_agent_utils.py --agent codex --action capacity

# Check active tasks
cat tmp/agent_status/codex_status/heartbeat.json | jq '.active_tasks'
```

### Problem: Communication files corrupted

**Solution**: Reinitialize

```bash
# Clear old files
rm -rf tmp/agent_status/codex_tasks/*
rm -rf tmp/agent_status/codex_status/*
rm -rf tmp/agent_status/livhana_status/*

# Keep shared files (registry, log)
# Restart both agents
bash scripts/claude_tier1_boot.sh  # Liv Hana
bash scripts/codex_agent_boot.sh   # CODEX
```

## Best Practices

1. **Always use absolute paths** in task payloads
2. **Set realistic timeouts** (default 300s, max 3600s)
3. **Respect throttle capacity** (default 0.8 = 80%)
4. **Use blocking=False** for non-critical background tasks
5. **Enable progress updates** for tasks >60 seconds
6. **Check capacity** before accepting tasks (CODEX side)
7. **Log all events** to coordination log
8. **Update heartbeat** every 30 seconds (both agents)
9. **Handle errors gracefully** with proper error codes
10. **Clean up old task files** periodically (>24h old)

## Integration with Voice Mode

Liv Hana can seamlessly coordinate with CODEX while maintaining voice conversation with Jesse:

```python
# In voice mode conversation handler
def handle_jesse_request(jesse_says: str):
    if "run preflight" in jesse_says.lower():
        # Send task to CODEX (non-blocking)
        task_id = coordinator.create_task_request(
            request_type="validate",
            priority="high",
            payload={"task_type": "validate", "parameters": {"validation_type": "preflight"}},
            jesse_directive=jesse_says,
            blocking=False
        )

        # Continue voice conversation
        speak("Started preflight checks. I'll let you know when it's done.")

        # Monitor in background, alert when complete
        result = coordinator.poll_task_result(task_id, timeout_seconds=120)
        if result["status"] == "completed":
            speak("Preflight checks passed. Ready to deploy.")
        else:
            speak(f"Preflight checks failed: {result['errors'][0]['message']}")
```

---

**For full protocol specification, see**: `.claude/INTER_AGENT_COMMUNICATION_PROTOCOL.md`
