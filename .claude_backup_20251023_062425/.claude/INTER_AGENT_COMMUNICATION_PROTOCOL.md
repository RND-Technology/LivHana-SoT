---
diataxis: reference
owner: Jesse Niesen (CEO)
status: active - inter-agent coordination protocol
version: 1.0
timestamp: 2025-10-22T21:30:00Z
---

# INTER-AGENT COMMUNICATION PROTOCOL

**Purpose**: Define machine-readable communication protocol for Liv Hana (Claude Code CLI) to coordinate with external CODEX agents (Cursor) via shared JSON files.

**Principle of One (PO1)**: One file per purpose. Each communication has a single, atomic JSON file.

---

## ARCHITECTURE OVERVIEW

### Agent Topology

```
┌─────────────────────────────────────────┐
│   Liv Hana Layer 1.1 (Voice Orchestrator) │
│   Environment: Claude Code CLI          │
│   Location: claude-tier1 terminal       │
│   Mode: Voice-first, always listening   │
└─────────────┬───────────────────────────┘
              │
              │ Shared File System
              │ (tmp/agent_status/)
              │
┌─────────────▼───────────────────────────┐
│   CODEX External Agent                  │
│   Environment: Cursor IDE               │
│   Location: Separate window (sandboxed) │
│   Mode: Text-based task execution       │
└─────────────────────────────────────────┘
```

### Communication Channels

- **Outbound (Liv Hana → CODEX)**: Task request files
- **Inbound (CODEX → Liv Hana)**: Status update files
- **Shared State**: Agent status registry

---

## FILE LOCATIONS

All inter-agent communication files stored under:

```
tmp/agent_status/
├── codex_tasks/              # Task requests from Liv Hana to CODEX
│   ├── task_<task_id>.request.json
│   └── task_<task_id>.result.json
├── codex_status/             # Status updates from CODEX
│   ├── heartbeat.json
│   └── current_task.json
├── livhana_status/           # Status updates from Liv Hana
│   ├── heartbeat.json
│   └── active_coordination.json
└── shared/                   # Shared coordination files
    ├── agent_registry.json
    └── coordination_log.jsonl
```

---

## JSON SCHEMAS

### 1. Task Request Schema (Liv Hana → CODEX)

**File**: `tmp/agent_status/codex_tasks/task_<task_id>.request.json`

```json
{
  "task_id": "string (UUID v4)",
  "request_type": "enum: execute|research|validate|deploy",
  "priority": "enum: critical|high|medium|low",
  "source_agent": "string (livhana-layer1.1)",
  "target_agent": "string (codex-cursor)",
  "created_at": "string (ISO 8601 UTC)",
  "timeout_seconds": "number (default: 300, max: 3600)",
  "throttle_capacity": "number (0.0-1.0, default: 0.8)",
  "context": {
    "jesse_directive": "string (verbatim instruction)",
    "session_id": "string (current session UUID)",
    "voice_mode_active": "boolean",
    "related_tasks": "array of task_ids"
  },
  "payload": {
    "task_type": "string (specific action)",
    "parameters": "object (task-specific params)",
    "files_to_modify": "array of absolute paths",
    "files_to_read": "array of absolute paths",
    "expected_artifacts": "array of expected output paths"
  },
  "coordination": {
    "blocking": "boolean (does Liv Hana wait?)",
    "progress_updates_required": "boolean",
    "update_interval_seconds": "number (default: 30)"
  }
}
```

### 2. Task Result Schema (CODEX → Liv Hana)

**File**: `tmp/agent_status/codex_tasks/task_<task_id>.result.json`

```json
{
  "task_id": "string (matches request)",
  "status": "enum: completed|failed|partial|timeout|blocked",
  "source_agent": "string (codex-cursor)",
  "completed_at": "string (ISO 8601 UTC)",
  "execution_time_seconds": "number",
  "capacity_used": "number (0.0-1.0, actual capacity consumed)",
  "result": {
    "success": "boolean",
    "artifacts_created": "array of absolute paths",
    "files_modified": "array of absolute paths",
    "summary": "string (human-readable summary)",
    "metrics": "object (task-specific metrics)"
  },
  "errors": [
    {
      "code": "string (error code)",
      "message": "string (error description)",
      "severity": "enum: fatal|error|warning",
      "file": "string (optional, file related to error)",
      "line": "number (optional)"
    }
  ],
  "next_actions": [
    {
      "action": "string (recommended next step)",
      "priority": "enum: critical|high|medium|low",
      "requires_jesse": "boolean (needs human decision)"
    }
  ]
}
```

### 3. Heartbeat Schema (Both Agents)

**Files**:
- `tmp/agent_status/codex_status/heartbeat.json`
- `tmp/agent_status/livhana_status/heartbeat.json`

```json
{
  "agent_name": "string (livhana-layer1.1 | codex-cursor)",
  "status": "enum: active|idle|busy|paused|error",
  "last_heartbeat": "string (ISO 8601 UTC)",
  "uptime_seconds": "number",
  "current_capacity": "number (0.0-1.0, available capacity)",
  "active_tasks": "array of task_ids",
  "health": {
    "cpu_ok": "boolean",
    "memory_ok": "boolean",
    "disk_ok": "boolean",
    "last_error": "string|null"
  }
}
```

### 4. Agent Registry Schema (Shared)

**File**: `tmp/agent_status/shared/agent_registry.json`

```json
{
  "updated_at": "string (ISO 8601 UTC)",
  "agents": {
    "livhana-layer1.1": {
      "type": "orchestrator",
      "environment": "claude-code-cli",
      "pid": "number|null",
      "status": "enum: active|idle|error",
      "last_seen": "string (ISO 8601 UTC)",
      "capabilities": ["voice", "orchestration", "task_delegation"]
    },
    "codex-cursor": {
      "type": "executor",
      "environment": "cursor-ide",
      "pid": "number|null",
      "status": "enum: active|idle|busy|error",
      "last_seen": "string (ISO 8601 UTC)",
      "capabilities": ["code_execution", "file_operations", "git_operations"]
    }
  }
}
```

### 5. Coordination Log Schema (Append-Only)

**File**: `tmp/agent_status/shared/coordination_log.jsonl`

Each line is a separate JSON object:

```json
{
  "timestamp": "string (ISO 8601 UTC)",
  "event_type": "enum: task_created|task_started|task_completed|task_failed|handoff|escalation",
  "task_id": "string|null",
  "source_agent": "string",
  "target_agent": "string|null",
  "message": "string (human-readable description)",
  "metadata": "object (event-specific data)"
}
```

---

## POLLING & WATCH MECHANISM

### Liv Hana → CODEX (Task Monitoring)

**Frequency**: Check every 5 seconds when blocking task active

**Logic**:
```python
# Pseudo-code for Liv Hana
def monitor_codex_task(task_id, timeout_seconds):
    start_time = now()
    result_file = f"tmp/agent_status/codex_tasks/task_{task_id}.result.json"

    while (now() - start_time) < timeout_seconds:
        if file_exists(result_file):
            result = read_json(result_file)
            return result

        # Check CODEX heartbeat to ensure it's alive
        heartbeat = read_json("tmp/agent_status/codex_status/heartbeat.json")
        if heartbeat["status"] == "error":
            return timeout_error("CODEX agent in error state")

        sleep(5)  # Poll every 5 seconds

    return timeout_error("Task exceeded timeout")
```

**Timeout Behavior**:
- Default timeout: 300 seconds (5 minutes)
- Max timeout: 3600 seconds (60 minutes)
- On timeout: Liv Hana logs warning, continues with voice orchestration
- CODEX continues execution in background (non-blocking)

### CODEX → Liv Hana (Task Discovery)

**Frequency**: Check every 10 seconds when idle

**Logic**:
```python
# Pseudo-code for CODEX
def poll_for_tasks():
    task_dir = "tmp/agent_status/codex_tasks/"
    request_files = glob(f"{task_dir}task_*.request.json")

    for request_file in request_files:
        task_id = extract_task_id(request_file)
        result_file = f"{task_dir}task_{task_id}.result.json"

        # Skip if already processed
        if file_exists(result_file):
            continue

        # Process task
        request = read_json(request_file)
        result = execute_task(request)
        write_json(result_file, result)

        # Update heartbeat
        update_heartbeat("busy")

    # Update heartbeat when idle
    update_heartbeat("idle")
```

### Heartbeat Updates

**Both agents**: Update heartbeat every 30 seconds

**Critical**: If heartbeat not updated in 90 seconds, agent considered dead

---

## THROTTLE MECHANISM (Cursor Capacity)

### Capacity Tracking

CODEX tracks Cursor capacity usage to prevent crashes:

```json
{
  "capacity_threshold": 0.8,
  "current_load": {
    "open_files": 12,
    "active_operations": 3,
    "memory_usage_mb": 2048,
    "estimated_capacity": 0.65
  }
}
```

### Throttle Enforcement

1. **Task Request**: Liv Hana includes `throttle_capacity: 0.8` in request
2. **CODEX Pre-Check**: Before accepting task, CODEX checks current capacity
3. **Defer if Overload**: If capacity > threshold, CODEX defers task with status:
   ```json
   {
     "status": "deferred",
     "reason": "capacity_exceeded",
     "retry_after_seconds": 60
   }
   ```
4. **Liv Hana Retry**: Automatically retries after cooldown period

---

## TASK TYPES & PAYLOADS

### execute: Code Execution

```json
{
  "payload": {
    "task_type": "execute",
    "parameters": {
      "script_path": "/absolute/path/to/script.sh",
      "args": ["arg1", "arg2"],
      "working_directory": "/absolute/path/to/workdir",
      "capture_output": true,
      "timeout_seconds": 300
    }
  }
}
```

### research: Code Investigation

```json
{
  "payload": {
    "task_type": "research",
    "parameters": {
      "query": "How does voice_mode_boot.sh handle silence protocol?",
      "search_paths": ["/absolute/path/to/scripts", "/absolute/path/to/.claude"],
      "depth": "thorough",
      "output_format": "markdown"
    }
  }
}
```

### validate: Quality Check

```json
{
  "payload": {
    "task_type": "validate",
    "parameters": {
      "validation_type": "preflight|lint|test|security",
      "target_files": ["/absolute/path/to/file1.ts", "/absolute/path/to/file2.ts"],
      "strict_mode": true
    }
  }
}
```

### deploy: Deployment Execution

```json
{
  "payload": {
    "task_type": "deploy",
    "parameters": {
      "service_name": "voice-service",
      "environment": "production",
      "gcp_project": "reggieanddrodispensary",
      "region": "us-central1",
      "dry_run": false
    }
  }
}
```

---

## ERROR HANDLING

### Error Escalation Flow

1. **CODEX Detects Error**: Writes result with `status: failed`
2. **Liv Hana Receives Failure**: Analyzes error severity
3. **Auto-Retry Logic**:
   - `severity: warning` → Retry up to 2 times
   - `severity: error` → Single retry with increased timeout
   - `severity: fatal` → No retry, escalate to Jesse
4. **Jesse Escalation**: Liv Hana uses voice to alert Jesse with error summary

### Error Codes

| Code | Description | Severity | Auto-Retry |
|------|-------------|----------|------------|
| `CAPACITY_EXCEEDED` | Cursor overloaded | warning | Yes (3x) |
| `FILE_NOT_FOUND` | Required file missing | error | Yes (1x) |
| `PERMISSION_DENIED` | Access denied | error | No |
| `TIMEOUT` | Task exceeded timeout | error | Yes (1x) |
| `EXECUTION_FAILED` | Script/command failed | error | No |
| `VALIDATION_FAILED` | QA validation failed | fatal | No |
| `GIT_CONFLICT` | Git merge conflict | fatal | No |
| `UNKNOWN_ERROR` | Unhandled exception | fatal | No |

---

## COORDINATION PATTERNS

### Pattern 1: Fire-and-Forget (Non-Blocking)

**Use Case**: Background research, low-priority tasks

**Flow**:
1. Liv Hana creates task with `blocking: false`
2. Liv Hana continues voice orchestration immediately
3. CODEX processes task in background
4. Liv Hana checks result later (async)

### Pattern 2: Blocking Wait (Synchronous)

**Use Case**: Critical tasks requiring completion before continuing

**Flow**:
1. Liv Hana creates task with `blocking: true`
2. Liv Hana polls for result every 5 seconds
3. CODEX processes task, writes result
4. Liv Hana receives result, continues

### Pattern 3: Progressive Updates (Streaming)

**Use Case**: Long-running tasks (>60s) needing progress visibility

**Flow**:
1. Liv Hana creates task with `progress_updates_required: true`
2. CODEX creates progress file: `task_<task_id>.progress.json`
3. CODEX updates progress file every 30 seconds
4. Liv Hana reads progress, reports to Jesse via voice
5. CODEX completes, writes final result

**Progress File Schema**:
```json
{
  "task_id": "string",
  "progress_percent": "number (0-100)",
  "current_step": "string",
  "steps_completed": "number",
  "steps_total": "number",
  "last_update": "string (ISO 8601 UTC)",
  "estimated_completion": "string (ISO 8601 UTC)"
}
```

### Pattern 4: Multi-Agent Chain (Sequential)

**Use Case**: Complex workflows requiring multiple agents

**Flow**:
1. Liv Hana creates Task A for CODEX
2. CODEX completes Task A, suggests next action
3. Liv Hana creates Task B based on Task A result
4. Chain continues until workflow complete

---

## BOOT INTEGRATION

### Liv Hana Boot Sequence

Add to `scripts/claude_tier1_boot.sh` (after Step 3):

```bash
# Step 3.5: Initialize inter-agent communication
banner "STEP 3.5: INTER-AGENT COMMUNICATION SETUP"

# Create directory structure
mkdir -p "$ROOT/tmp/agent_status/codex_tasks"
mkdir -p "$ROOT/tmp/agent_status/codex_status"
mkdir -p "$ROOT/tmp/agent_status/livhana_status"
mkdir -p "$ROOT/tmp/agent_status/shared"

# Initialize agent registry
cat > "$ROOT/tmp/agent_status/shared/agent_registry.json" <<EOF
{
  "updated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "agents": {
    "livhana-layer1.1": {
      "type": "orchestrator",
      "environment": "claude-code-cli",
      "pid": $$,
      "status": "active",
      "last_seen": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
      "capabilities": ["voice", "orchestration", "task_delegation"]
    },
    "codex-cursor": {
      "type": "executor",
      "environment": "cursor-ide",
      "pid": null,
      "status": "unknown",
      "last_seen": null,
      "capabilities": ["code_execution", "file_operations", "git_operations"]
    }
  }
}
EOF

# Initialize Liv Hana heartbeat
cat > "$ROOT/tmp/agent_status/livhana_status/heartbeat.json" <<EOF
{
  "agent_name": "livhana-layer1.1",
  "status": "active",
  "last_heartbeat": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "uptime_seconds": 0,
  "current_capacity": 1.0,
  "active_tasks": [],
  "health": {
    "cpu_ok": true,
    "memory_ok": true,
    "disk_ok": true,
    "last_error": null
  }
}
EOF

# Initialize coordination log
touch "$ROOT/tmp/agent_status/shared/coordination_log.jsonl"
echo '{"timestamp":"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'","event_type":"session_start","source_agent":"livhana-layer1.1","message":"Inter-agent communication initialized"}' >> "$ROOT/tmp/agent_status/shared/coordination_log.jsonl"

success "Inter-agent communication initialized"
info "Protocol: .claude/INTER_AGENT_COMMUNICATION_PROTOCOL.md"
```

### CODEX Boot Sequence

Create `scripts/codex_agent_boot.sh`:

```bash
#!/usr/bin/env bash
# CODEX Agent Boot Script - Cursor Environment
# Initializes CODEX for inter-agent communication with Liv Hana

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "========================================="
echo "CODEX AGENT BOOT SEQUENCE"
echo "========================================="
echo "Timestamp: $TIMESTAMP"
echo "Root: $ROOT"
echo

# Check if agent_status exists
if [[ ! -d "$ROOT/tmp/agent_status" ]]; then
  echo "ERROR: Inter-agent communication not initialized"
  echo "Run: bash scripts/claude_tier1_boot.sh first"
  exit 1
fi

# Initialize CODEX heartbeat
cat > "$ROOT/tmp/agent_status/codex_status/heartbeat.json" <<EOF
{
  "agent_name": "codex-cursor",
  "status": "active",
  "last_heartbeat": "$TIMESTAMP",
  "uptime_seconds": 0,
  "current_capacity": 0.8,
  "active_tasks": [],
  "health": {
    "cpu_ok": true,
    "memory_ok": true,
    "disk_ok": true,
    "last_error": null
  }
}
EOF

# Update agent registry
python3 -c "
import json
from pathlib import Path

registry_path = Path('$ROOT/tmp/agent_status/shared/agent_registry.json')
registry = json.loads(registry_path.read_text())
registry['agents']['codex-cursor']['status'] = 'active'
registry['agents']['codex-cursor']['last_seen'] = '$TIMESTAMP'
registry['agents']['codex-cursor']['pid'] = $$
registry['updated_at'] = '$TIMESTAMP'
registry_path.write_text(json.dumps(registry, indent=2))
"

# Log to coordination log
echo '{"timestamp":"'$TIMESTAMP'","event_type":"agent_ready","source_agent":"codex-cursor","message":"CODEX agent initialized and ready for tasks"}' >> "$ROOT/tmp/agent_status/shared/coordination_log.jsonl"

echo "✅ CODEX agent initialized"
echo "✅ Heartbeat active"
echo "✅ Ready to receive tasks from Liv Hana"
echo
echo "Protocol: .claude/INTER_AGENT_COMMUNICATION_PROTOCOL.md"
echo "========================================="
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Immediate)

- [x] Protocol document created (this file)
- [ ] Directory structure created in boot script
- [ ] Heartbeat mechanism implemented (both agents)
- [ ] Agent registry initialized
- [ ] Coordination log started

### Phase 2: Core Communication (Week 1)

- [ ] Task request/result schema validated
- [ ] Polling mechanism implemented (Liv Hana)
- [ ] Task discovery implemented (CODEX)
- [ ] Basic error handling
- [ ] Throttle mechanism (capacity tracking)

### Phase 3: Advanced Features (Week 2)

- [ ] Progressive updates (streaming)
- [ ] Multi-agent chain coordination
- [ ] Auto-retry logic
- [ ] Jesse escalation protocol
- [ ] Telemetry & metrics

---

## TESTING SCENARIOS

### Test 1: Simple Task Execution

**Scenario**: Liv Hana asks CODEX to run preflight checks

1. Liv Hana creates task request: `execute` type, run `scripts/START.sh preflight`
2. CODEX polls, finds task, executes
3. CODEX writes result with status `completed`
4. Liv Hana reads result, reports to Jesse via voice

**Success Criteria**:
- Task completed within timeout
- Result includes all artifacts
- No errors logged

### Test 2: Capacity Throttle

**Scenario**: CODEX at 85% capacity, Liv Hana sends task with 80% threshold

1. CODEX heartbeat shows `current_capacity: 0.15` (85% used)
2. Liv Hana sends task with `throttle_capacity: 0.8`
3. CODEX defers task with status `deferred`
4. Liv Hana waits 60 seconds, retries
5. CODEX capacity drops to 0.5, accepts task

**Success Criteria**:
- Task deferred on first attempt
- Task accepted on retry after cooldown
- No Cursor crash

### Test 3: Progressive Updates

**Scenario**: Long-running deployment task (5+ minutes)

1. Liv Hana creates deploy task with `progress_updates_required: true`
2. CODEX starts task, creates progress file
3. CODEX updates progress every 30 seconds
4. Liv Hana reads progress, reports to Jesse: "Deployment 40% complete..."
5. CODEX completes, writes final result

**Success Criteria**:
- Progress updates received every 30 seconds
- Liv Hana reports progress via voice
- Final result matches expected artifacts

### Test 4: Error Escalation

**Scenario**: CODEX encounters fatal error (git conflict)

1. Liv Hana sends task to deploy service
2. CODEX encounters git merge conflict
3. CODEX writes result with `status: failed`, error code `GIT_CONFLICT`
4. Liv Hana reads result, determines error is fatal
5. Liv Hana alerts Jesse via voice: "Critical error: Git conflict detected. Your input needed."

**Success Criteria**:
- Error correctly classified as fatal
- No auto-retry attempted
- Jesse alerted via voice within 10 seconds

---

## PERMANENCE GUARANTEE

This protocol document is:

1. **Referenced in boot script**: `scripts/claude_tier1_boot.sh` (Step 3.5)
2. **Registered in index**: `docs/INDEX.md` under "Inter-Agent Coordination"
3. **PO1 Protected**: One file per purpose, not subject to cleanup
4. **Version Controlled**: All changes tracked in git

**DO NOT OVERRIDE** without Jesse CEO approval.

---

## SUCCESS METRICS

### Operational Metrics

- **Task Success Rate**: >95% of tasks complete without error
- **Average Task Latency**: <30 seconds from request to result
- **Heartbeat Uptime**: >99.9% (both agents)
- **Capacity Safety**: Zero Cursor crashes due to overload

### User Experience Metrics

- **Jesse Copy/Paste Events**: Zero (full automation)
- **Voice Interruptions**: <5% (minimal manual intervention)
- **Task Transparency**: 100% (Jesse aware of all agent activity)

---

**Document Status**: Active - Inter-Agent Communication Protocol
**Owner**: Jesse Niesen (CEO)
**Version**: 1.0
**Last Updated**: 2025-10-22T21:30:00Z

---

**"One agent is smart. Two coordinating agents is intelligence. Zero human glue code is victory."** - Jesse CEO
