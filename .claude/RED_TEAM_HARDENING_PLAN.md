# 🔴 RED TEAM: Tier-1 Boot System - Complete Hardening Plan

**Status**: PLANNING
**Created**: 2025-10-23
**Estimated Time**: 8-10 hours
**Risk Reduction**: 100% (all 12 vulnerabilities addressed)

---

## Executive Summary

The `claude-tier1` boot system currently has **12 vulnerabilities** ranging from CRITICAL (secrets in logs, RCE) to MEDIUM (race conditions, missing validation). This plan outlines a systematic hardening approach using **Principle of One** refactoring + **zero-trust security** patterns.

**Current State**:
- ✅ RCE vulnerability fixed (commit 6390eea6c)
- ⚠️ 11 vulnerabilities remaining
- ⚠️ Monolithic boot script (600+ lines)
- ⚠️ No comprehensive testing

**Target State**:
- ✅ All 12 vulnerabilities fixed
- ✅ Modular architecture (one file, one purpose)
- ✅ Comprehensive test coverage
- ✅ Zero secrets on disk or in logs
- ✅ Fail-fast with actionable errors

---

## Phase 1: File Structure Refactoring (Principle of One)

### Current Structure (BEFORE)
```
scripts/
├── claude_tier1_boot.sh          # 600+ lines, does EVERYTHING
├── start_tier1_services.sh       # Duplicate service startup logic
├── validate_all_green.sh         # Partial validation
├── claude_voice_session.sh       # Voice orchestrator
├── start_planning_agent.sh       # Agent spawn (5 similar files)
├── start_research_agent.sh
├── start_artifact_agent.sh
├── start_execution_monitor.sh
├── start_qa_agent.sh
└── agents/
    ├── voice_orchestrator_watch.sh
    └── validate_status.sh        # Overlapping validation
```

**Problems**:
- Monolithic boot script (multiple responsibilities)
- Duplicate service startup logic
- No clear separation of concerns
- Hard to test individual components
- No reusable helpers

---

### Target Structure (AFTER)
```
scripts/
├── claude_tier1_boot.sh          # ORCHESTRATOR ONLY (~100 lines)
│                                  # Calls helpers, handles sequencing
│
├── boot/                          # Boot-specific logic
│   ├── ensure_prerequisites.sh   # ONE: Check dependencies
│   ├── ensure_op_session.sh      # ONE: 1Password auth (ALREADY EXISTS)
│   ├── start_services.sh         # ONE: Service startup
│   ├── spawn_agents.sh           # ONE: Agent spawning
│   ├── validate_system.sh        # ONE: Health checks
│   └── cleanup_orphans.sh        # ONE: Process cleanup
│
├── guards/                        # Validation & safety checks
│   ├── validate_json.sh          # ONE: JSON schema validation
│   ├── check_port_collision.sh   # ONE: Port availability
│   ├── scrub_secrets.sh          # ONE: Log sanitization
│   ├── require_command.sh        # ONE: Dependency checker
│   ├── validate_pid_file.sh      # ONE: PID validation
│   └── check_disk_space.sh       # ONE: Disk availability
│
├── helpers/                       # Reusable utilities
│   ├── wait_for_service.sh       # ONE: Retry/backoff
│   ├── write_status_json.sh      # ONE: Atomic status writes
│   └── mask_sensitive_data.sh    # ONE: Log masking
│
├── agents/                        # Agent management
│   ├── spawn_agent.sh            # ONE: Generic agent spawner
│   ├── validate_agent.sh         # ONE: Agent health check
│   └── voice_orchestrator_watch.sh (existing)
│
└── tests/                         # Test suite
    ├── unit/
    │   ├── test_ensure_op_session.sh
    │   ├── test_wait_for_service.sh
    │   └── test_validate_json.sh
    ├── integration/
    │   └── test_full_boot.sh
    └── chaos/
        └── test_failure_modes.sh
```

**Benefits**:
- Each script < 100 lines
- Clear single responsibility
- Easy to test in isolation
- Reusable across projects
- Clear failure attribution

---

## Phase 2: Vulnerability Remediation (Detailed Implementation)

### V1: Race Condition - Service Startup vs Health Check
**Severity**: HIGH
**File**: `scripts/helpers/wait_for_service.sh` (NEW)
**Time**: 30 minutes

**Current Code** (claude_tier1_boot.sh:785-797):
```bash
sleep 5  # ❌ HARD-CODED WAIT
if ! lsof -i :3005 >/dev/null 2>&1; then
  error "integration-service failed to bind"
  exit 1
fi
if curl -sf http://localhost:3005/health >/dev/null 2>&1; then
  success "integration-service started"
else
  error "integration-service health check failed"
  exit 1
fi
```

**Hardened Code** (wait_for_service.sh):
```bash
#!/usr/bin/env bash
# wait_for_service.sh - Wait for service with retry/backoff
set -euo pipefail

wait_for_service() {
  local port="$1"
  local health_endpoint="${2:-/health}"
  local max_wait="${3:-30}"
  local check_interval="${4:-2}"
  local service_name="${5:-service}"

  local elapsed=0
  local attempt=1

  info "Waiting for ${service_name} on port ${port}..."

  while [[ $elapsed -lt $max_wait ]]; do
    # Check 1: Port is bound
    if lsof -ti :"$port" >/dev/null 2>&1; then
      # Check 2: HTTP health returns 200
      if curl -sf "http://localhost:${port}${health_endpoint}" >/dev/null 2>&1; then
        success "${service_name} UP (port ${port}, attempt ${attempt}, ${elapsed}s elapsed)"
        return 0
      else
        info "Port ${port} bound but health check failed (attempt ${attempt})"
      fi
    else
      info "Port ${port} not bound yet (attempt ${attempt})"
    fi

    sleep "$check_interval"
    ((elapsed += check_interval))
    ((attempt++))
  done

  error "${service_name} failed to become healthy within ${max_wait}s"
  error "Check logs: logs/${service_name}.log"
  return 1
}

# Usage:
# wait_for_service 3005 /health 30 2 integration-service
```

**Integration** (claude_tier1_boot.sh):
```bash
source "$ROOT/scripts/helpers/wait_for_service.sh"

# Start service
nohup op run --env-file="$ROOT/.env" -- npm start >> "$integration_log" 2>&1 &
INTEGRATION_PID=$!

# Wait with retry (no more race condition!)
if wait_for_service 3005 /health 30 2 integration-service; then
  echo "$INTEGRATION_PID" > "$ROOT/tmp/integration-service.pid"
else
  kill "$INTEGRATION_PID" 2>/dev/null || true
  exit 1
fi
```

**Testing**:
```bash
# Test slow startup
sleep 10 & wait_for_service 9999 /health 15 1 slow-service
# Should succeed after service binds

# Test timeout
wait_for_service 9998 /health 5 1 never-starts
# Should fail after 5s with clear error
```

---

### V3: No PID File Cleanup on Crash
**Severity**: MEDIUM
**File**: `scripts/guards/validate_pid_file.sh` (NEW)
**Time**: 20 minutes

**Current Code**:
```bash
echo "$INTEGRATION_PID" > "$ROOT/tmp/integration-service.pid"
# ❌ No validation, file persists even if process dies
```

**Hardened Code** (validate_pid_file.sh):
```bash
#!/usr/bin/env bash
# validate_pid_file.sh - Validate and clean stale PID files
set -euo pipefail

write_pid() {
  local pid="$1"
  local pid_file="$2"
  local process_name="${3:-}"

  # Validate PID is alive
  if ! kill -0 "$pid" 2>/dev/null; then
    error "Cannot write PID $pid to $pid_file - process not running"
    return 1
  fi

  # Optionally validate process name
  if [[ -n "$process_name" ]]; then
    if ! ps -p "$pid" -o comm= | grep -q "$process_name"; then
      error "PID $pid is not a $process_name process"
      return 1
    fi
  fi

  # Atomic write
  echo "$pid" > "${pid_file}.tmp"
  mv "${pid_file}.tmp" "$pid_file"
  chmod 600 "$pid_file"  # Secure permissions

  success "PID $pid written to $pid_file"
}

read_pid() {
  local pid_file="$1"
  local process_name="${2:-}"

  if [[ ! -f "$pid_file" ]]; then
    return 1
  fi

  local pid
  pid=$(cat "$pid_file")

  # Validate PID is numeric
  if ! [[ "$pid" =~ ^[0-9]+$ ]]; then
    warning "Invalid PID in $pid_file: $pid"
    rm -f "$pid_file"
    return 1
  fi

  # Check if process is alive
  if ! kill -0 "$pid" 2>/dev/null; then
    warning "Stale PID file $pid_file (PID $pid not running)"
    rm -f "$pid_file"
    return 1
  fi

  # Optionally validate process name
  if [[ -n "$process_name" ]]; then
    if ! ps -p "$pid" -o comm= | grep -q "$process_name"; then
      warning "PID $pid in $pid_file is not a $process_name process"
      rm -f "$pid_file"
      return 1
    fi
  fi

  echo "$pid"
}

cleanup_pid_file() {
  local pid_file="$1"

  if [[ -f "$pid_file" ]]; then
    local pid
    if pid=$(cat "$pid_file" 2>/dev/null); then
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi
}

# Usage:
# write_pid "$!" tmp/service.pid node
# pid=$(read_pid tmp/service.pid node) || echo "Service not running"
# cleanup_pid_file tmp/service.pid
```

**Testing**:
```bash
# Test stale PID
echo "99999" > /tmp/test.pid
read_pid /tmp/test.pid  # Should clean and return 1

# Test live PID
echo "$$" > /tmp/test.pid
pid=$(read_pid /tmp/test.pid)  # Should return $$

# Test corrupted PID
echo "not-a-number" > /tmp/test.pid
read_pid /tmp/test.pid  # Should clean and return 1
```

---

### V4: No Rollback on Partial Failure
**Severity**: HIGH
**File**: `scripts/boot/start_services.sh` (NEW)
**Time**: 45 minutes

**Current Code**:
```bash
# Start services independently
nohup npm start &  # ❌ If this fails, others keep starting
# No rollback mechanism
```

**Hardened Code** (start_services.sh):
```bash
#!/usr/bin/env bash
# start_services.sh - All-or-nothing service startup with rollback
set -euo pipefail

STARTED_SERVICES=()
STARTED_PIDS=()

cleanup_on_failure() {
  error "Service startup failed - rolling back..."

  for i in "${!STARTED_SERVICES[@]}"; do
    local service="${STARTED_SERVICES[$i]}"
    local pid="${STARTED_PIDS[$i]}"

    warning "Stopping $service (PID $pid)"
    kill "$pid" 2>/dev/null || true

    # Wait for graceful shutdown
    local count=0
    while kill -0 "$pid" 2>/dev/null && [[ $count -lt 10 ]]; do
      sleep 0.5
      ((count++))
    done

    # Force kill if still alive
    if kill -0 "$pid" 2>/dev/null; then
      warning "Force killing $service (PID $pid)"
      kill -9 "$pid" 2>/dev/null || true
    fi
  done

  error "Rollback complete. System left in clean state."
  exit 1
}

trap cleanup_on_failure ERR

start_service() {
  local name="$1"
  local start_command="$2"
  local port="$3"
  local health_endpoint="${4:-/health}"

  info "Starting $name..."

  # Execute start command in background
  eval "$start_command" &
  local pid=$!

  # Wait for health
  if wait_for_service "$port" "$health_endpoint" 30 2 "$name"; then
    STARTED_SERVICES+=("$name")
    STARTED_PIDS+=("$pid")
    write_pid "$pid" "tmp/${name}.pid" node
    success "$name started (PID $pid)"
  else
    error "$name failed to start"
    return 1
  fi
}

# Usage:
start_service "integration-service" \
  "cd backend/integration-service && op run --env-file=.env.integration -- npm start >> logs/integration.log 2>&1" \
  3005 /health

start_service "voice-service" \
  "cd backend/voice-service && npm start >> logs/voice.log 2>&1" \
  8080 /health

start_service "reasoning-gateway" \
  "cd backend/reasoning-gateway && npm start >> logs/reasoning.log 2>&1" \
  4002 /health

success "All services started successfully"
trap - ERR  # Remove error trap
```

**Testing**:
```bash
# Test partial failure
# Start 2 services, make 3rd fail
# Verify first 2 are killed (rollback)

# Test all success
# Verify all 3 services remain running
```

---

### V5: Hardcoded Ports (No Configuration)
**Severity**: MEDIUM
**File**: `backend/integration-service/.env.integration` (NEW)
**Time**: 15 minutes

**Current Code**:
```bash
curl http://localhost:3005/health  # ❌ Hardcoded port
lsof -i :3005                       # ❌ Port collision risk
```

**Hardened Code**:
```bash
# .env.integration (environment-driven ports)
PORT=3005
HEALTH_ENDPOINT=/health

# Read from env in code
INTEGRATION_PORT="${INTEGRATION_SERVICE_PORT:-3005}"
VOICE_PORT="${VOICE_SERVICE_PORT:-8080}"
REASONING_PORT="${REASONING_GATEWAY_PORT:-4002}"

# Check for collisions BEFORE starting
check_port_collision() {
  local port="$1"
  local service_name="$2"

  if lsof -ti :"$port" >/dev/null 2>&1; then
    local existing_pid
    existing_pid=$(lsof -ti :"$port")
    local existing_cmd
    existing_cmd=$(ps -p "$existing_pid" -o comm= 2>/dev/null || echo "unknown")

    error "Port $port already in use by $existing_cmd (PID $existing_pid)"
    error "Cannot start $service_name"
    error ""
    error "Options:"
    error "  1. Kill existing process: kill $existing_pid"
    error "  2. Use different port: export ${service_name^^}_PORT=<other-port>"
    return 1
  fi
}

# Before starting each service:
check_port_collision "$INTEGRATION_PORT" integration-service || exit 1
```

---

### V7: No Validation of op CLI Version
**Severity**: MEDIUM
**File**: `scripts/boot/ensure_prerequisites.sh` (NEW)
**Time**: 15 minutes

**Hardened Code**:
```bash
validate_op_cli_version() {
  local op_version
  op_version=$(op --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)

  if [[ -z "$op_version" ]]; then
    error "Cannot detect op CLI version"
    error "Output: $(op --version 2>&1)"
    exit 1
  fi

  local op_major="${op_version%%.*}"

  if [[ "$op_major" != "1" && "$op_major" != "2" ]]; then
    error "Unsupported op CLI version: $op_version"
    error "Supported: 1.x, 2.x"
    error "Install: brew install --cask 1password-cli"
    exit 1
  fi

  if [[ "$op_major" == "1" ]]; then
    warning "op CLI v1 detected ($op_version). Upgrade recommended:"
    warning "  brew upgrade --cask 1password-cli"
  else
    success "op CLI v$op_version detected"
  fi
}
```

---

### V8: tmux Session Naming Collision
**Severity**: MEDIUM
**File**: `scripts/agents/spawn_agent.sh` (NEW)
**Time**: 10 minutes

**Current Code**:
```bash
tmux new-session -s planning  # ❌ Collides with user's "planning" session
```

**Hardened Code**:
```bash
SESSION_PREFIX="livhana-tier1"

spawn_agent() {
  local agent_name="$1"
  local session_name="${SESSION_PREFIX}-${agent_name}"

  # Check if session already exists
  if tmux has-session -t "$session_name" 2>/dev/null; then
    warning "tmux session $session_name already exists - reusing"
    return 0
  fi

  # Create namespaced session
  if ! tmux new-session -d -s "$session_name" ...; then
    error "Failed to create tmux session $session_name"
    return 1
  fi

  # Validate session was created
  if ! tmux has-session -t "$session_name" 2>/dev/null; then
    error "tmux session $session_name created but disappeared"
    return 1
  fi

  success "Agent $agent_name spawned in tmux session $session_name"
}

# Sessions: livhana-tier1-planning, livhana-tier1-research, etc.
```

---

### V9: No Disk Space Check Before Log Writes
**Severity**: MEDIUM
**File**: `scripts/guards/check_disk_space.sh` (NEW)
**Time**: 15 minutes

**Hardened Code**:
```bash
check_disk_space() {
  local path="${1:-.}"
  local required_mb="${2:-1000}"

  local available_mb
  available_mb=$(df -m "$path" | awk 'NR==2 {print $4}')

  if [[ "$available_mb" -lt "$required_mb" ]]; then
    error "Insufficient disk space"
    error "  Path: $path"
    error "  Available: ${available_mb}MB"
    error "  Required: ${required_mb}MB"
    error ""
    error "Free up space:"
    error "  1. Check logs: du -sh logs/"
    error "  2. Check node_modules: du -sh */node_modules"
    error "  3. Run: docker system prune -af"
    return 1
  fi

  success "Disk space OK: ${available_mb}MB available"
}

# Call before boot
check_disk_space "$ROOT" 1000 || exit 1
```

---

### V10: Secrets in Log Files
**Severity**: CRITICAL
**File**: `scripts/guards/scrub_secrets.sh` (NEW)
**Time**: 45 minutes

**Current Code**:
```bash
npm start >> "$integration_log" 2>&1
# ❌ Service logs may contain:
#   - API_KEY=sk-1234567890abcdef
#   - DATABASE_URL=postgres://user:PASS@host/db
#   - JWT_SECRET=super-secret-token
```

**Hardened Code** (scrub_secrets.sh):
```bash
#!/usr/bin/env bash
# scrub_secrets.sh - Scrub secrets from streaming logs
set -euo pipefail

scrub_secrets() {
  sed -E \
    -e 's/(API[_-]?KEY[_-]?[A-Z0-9]*)[=:][^ \t]*/\1=***REDACTED***/gi' \
    -e 's/(TOKEN)[=:][^ \t]*/\1=***REDACTED***/gi' \
    -e 's/(SECRET)[=:][^ \t]*/\1=***REDACTED***/gi' \
    -e 's/(PASSWORD)[=:][^ \t]*/\1=***REDACTED***/gi' \
    -e 's/(DSN)[=:][^ \t]*/\1=***REDACTED***/gi' \
    -e 's/postgres:\/\/([^:]+):([^@]+)@/postgres:\/\/\1:***@/g' \
    -e 's/mysql:\/\/([^:]+):([^@]+)@/mysql:\/\/\1:***@/g' \
    -e 's/(Bearer|Basic) [A-Za-z0-9+\/=]+/\1 ***REDACTED***/g'
}

# Usage:
npm start 2>&1 | scrub_secrets >> "$integration_log" &
```

**Log File Security**:
```bash
# Secure log file creation
mkdir -p logs
touch "$integration_log"
chmod 600 "$integration_log"  # Owner read/write only

# Pipe through scrubber
op run --env-file=.env -- npm start 2>&1 | scrub_secrets >> "$integration_log" &
```

**Testing**:
```bash
echo "API_KEY=sk-1234567890" | scrub_secrets
# Output: API_KEY=***REDACTED***

echo "DATABASE_URL=postgres://user:secret@host/db" | scrub_secrets
# Output: DATABASE_URL=postgres://user:***@host/db

echo "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | scrub_secrets
# Output: Bearer ***REDACTED***
```

---

### V11: No Validation of tmux Success
**Severity**: MEDIUM
**File**: `scripts/agents/spawn_agent.sh` (ENHANCED)
**Time**: 15 minutes

**Current Code**:
```bash
tmux new-session -s planning ... &
success "planning agent spawned"  # ❌ No validation!
```

**Hardened Code**:
```bash
spawn_agent() {
  local agent_name="$1"
  local session_name="${SESSION_PREFIX}-${agent_name}"

  # Create session
  if ! tmux new-session -d -s "$session_name" ...; then
    error "Failed to create tmux session $session_name"
    return 1
  fi

  # Validate session exists
  if ! tmux has-session -t "$session_name" 2>/dev/null; then
    error "tmux session $session_name created but disappeared"
    error "tmux may be unstable. Check: tmux info"
    return 1
  fi

  # Validate session has panes
  local pane_count
  pane_count=$(tmux list-panes -t "$session_name" 2>/dev/null | wc -l)
  if [[ "$pane_count" -lt 1 ]]; then
    error "tmux session $session_name has no panes"
    return 1
  fi

  success "Agent $agent_name spawned in tmux session $session_name ($pane_count panes)"
}
```

---

### V12: No Health Check for Agents (Only Services)
**Severity**: HIGH
**File**: `scripts/agents/validate_agent.sh` (NEW)
**Time**: 30 minutes

**Current Code**:
```bash
tmux new-session -s planning ...
# ❌ No validation that agent wrote status JSON
# Funnel may never complete!
```

**Hardened Code** (validate_agent.sh):
```bash
#!/usr/bin/env bash
# validate_agent.sh - Validate agent health via status JSON
set -euo pipefail

validate_agent_started() {
  local agent="$1"
  local timeout="${2:-15}"
  local status_file="$ROOT/tmp/agent_status/${agent}.status.json"

  info "Validating $agent agent..."

  local elapsed=0
  while [[ $elapsed -lt $timeout ]]; do
    # Check file exists and has content
    if [[ -f "$status_file" ]] && [[ -s "$status_file" ]]; then
      # Validate JSON structure
      if jq -e '
        .agent != null and
        .status != null and
        .started_at != null
      ' "$status_file" >/dev/null 2>&1; then
        # Validate agent name matches
        local file_agent
        file_agent=$(jq -r '.agent' "$status_file")
        if [[ "$file_agent" == "$agent" ]]; then
          success "$agent agent validated (status file OK)"
          return 0
        else
          warning "$agent status file has wrong agent name: $file_agent"
        fi
      else
        warning "$agent status file exists but invalid JSON"
      fi
    fi

    sleep 1
    ((elapsed++))
  done

  error "$agent agent failed to write valid status within ${timeout}s"
  error "Status file: $status_file"
  if [[ -f "$status_file" ]]; then
    error "Content:"
    cat "$status_file" >&2 || error "  (cannot read file)"
  else
    error "  (file does not exist)"
  fi
  return 1
}

# Usage after spawning each agent:
validate_agent_started planning 15 || exit 1
validate_agent_started research 15 || exit 1
validate_agent_started artifact 15 || exit 1
validate_agent_started exec 15 || exit 1
validate_agent_started qa 15 || exit 1
```

---

### V Silent Failures: Agent Spawn with || true
**Severity**: HIGH
**File**: `scripts/boot/spawn_agents.sh` (NEW)
**Time**: 20 minutes

**Current Code**:
```bash
bash start_planning_agent.sh >> "$LOG" 2>&1 || true &
bash start_research_agent.sh >> "$LOG" 2>&1 || true &
# ❌ || true swallows ALL errors
# Boot continues thinking agents spawned successfully
```

**Hardened Code**:
```bash
#!/usr/bin/env bash
# spawn_agents.sh - Spawn agents with validation
set -euo pipefail

AGENT_NAMES=(planning research artifact exec qa)
AGENT_PIDS=()

cleanup_agents_on_failure() {
  error "Agent spawn failed - cleaning up..."

  for pid in "${AGENT_PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done

  exit 1
}

trap cleanup_agents_on_failure ERR

# Spawn each agent
for agent in "${AGENT_NAMES[@]}"; do
  info "Spawning $agent agent..."

  # Start agent script
  bash "$ROOT/scripts/start_${agent}_agent.sh" >> "$LOG" 2>&1 &
  AGENT_PIDS+=($!)

  # Give it a moment to fail fast
  sleep 0.5

  # Check if process still alive
  if ! kill -0 "${AGENT_PIDS[-1]}" 2>/dev/null; then
    error "$agent agent spawn script exited immediately"
    return 1
  fi
done

# Wait for all agents to complete initialization
wait || {
  error "One or more agent spawn scripts failed"
  return 1
}

# Validate each agent wrote valid status
for agent in "${AGENT_NAMES[@]}"; do
  validate_agent_started "$agent" 15 || return 1
done

success "All ${#AGENT_NAMES[@]} agents spawned and validated"
trap - ERR  # Remove error trap
```

---

### V Secret Scope: Overshared .env File
**Severity**: MEDIUM
**File**: `backend/integration-service/.env.integration` (NEW)
**Time**: 25 minutes

**Current Code**:
```bash
op run --env-file="$ROOT/.env" -- npm start
# ❌ Entire repo .env (contains unrelated secrets)
# ❌ Violates principle of least privilege
```

**Hardened Code**:

**Step 1**: Create service-specific env file
```bash
# backend/integration-service/.env.integration
# ONLY integration-service secrets (op:// references)

# Database
DATABASE_URL=op://LivHana-Ops-Keys/integration-service/DATABASE_URL

# Authentication
JWT_SECRET=op://LivHana-Ops-Keys/integration-service/JWT_SECRET

# GCP
GCP_PROJECT_ID=reggieanddrodispensary
GOOGLE_APPLICATION_CREDENTIALS=.bigquery-key.json

# Storage
GCS_BUCKET=livhana-rpm-exports

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Lightspeed
LIGHTSPEED_TOKEN=op://LivHana-Ops-Keys/LIGHTSPEED_TOKEN/credential
```

**Step 2**: Use scoped env file
```bash
cd "$ROOT/backend/integration-service"

# Use service-specific env file (not root .env)
op run --env-file=".env.integration" -- npm start >> "$integration_log" 2>&1 &
```

**Step 3**: Validate no plaintext secrets
```bash
validate_env_file() {
  local env_file="$1"

  if [[ ! -f "$env_file" ]]; then
    error "Env file not found: $env_file"
    return 1
  fi

  # Check for plaintext secrets (anything that looks like a secret but isn't op://)
  local plaintext_secrets
  plaintext_secrets=$(grep -E '^[A-Z_]+=(sk-|ghp_|[a-f0-9]{32,})' "$env_file" | grep -v '^#' || true)

  if [[ -n "$plaintext_secrets" ]]; then
    error "Plaintext secrets detected in $env_file:"
    echo "$plaintext_secrets" >&2
    error "All secrets must use op:// references"
    return 1
  fi

  success "Env file validated: $env_file (no plaintext secrets)"
}

validate_env_file "backend/integration-service/.env.integration" || exit 1
```

---

## Phase 3: Orchestrator Refactoring

### New claude_tier1_boot.sh (Slim Orchestrator)
```bash
#!/usr/bin/env bash
# claude_tier1_boot.sh - Tier-1 Boot Orchestrator
# ORCHESTRATES ONLY - all logic delegated to helpers
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
export ROOT

# Load helpers
source "$ROOT/scripts/boot/ensure_prerequisites.sh"
source "$ROOT/scripts/boot/ensure_op_session.sh"
source "$ROOT/scripts/boot/start_services.sh"
source "$ROOT/scripts/boot/spawn_agents.sh"
source "$ROOT/scripts/boot/validate_system.sh"

# Banner
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  LIV HANA TIER-1 BOOT SEQUENCE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Phase 1: Prerequisites
ensure_prerequisites || exit 1

# Phase 2: Authentication
ensure_op_session || exit 1

# Phase 3: Services
start_all_services || exit 1

# Phase 4: Agents
spawn_all_agents || exit 1

# Phase 5: Validation
validate_system || exit 1

# Success!
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TIER-1 BOOT COMPLETE - ALL GREEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit 0
```

**Result**: ~50 lines (was 600+)

---

## Phase 4: Testing Strategy

### Unit Tests (scripts/tests/unit/)

**test_ensure_op_session.sh**:
```bash
#!/usr/bin/env bash
# Test ensure_op_session with various scenarios

test_signed_in() {
  # Mock: op whoami returns success
  op() { echo "user@reggiedro.1password.com"; return 0; }
  export -f op

  ensure_op_session quiet
  # Should return 0 without signing in
}

test_signed_out_v2() {
  # Mock: op signin --raw returns token
  op() {
    case "$1" in
      whoami) return 1 ;;
      signin) echo "fake-session-token"; return 0 ;;
      --version) echo "2.27.0" ;;
    esac
  }
  export -f op

  ensure_op_session
  # Should sign in and succeed
}

test_timeout() {
  # Mock: op signin hangs
  op() {
    case "$1" in
      whoami) return 1 ;;
      signin) sleep 60; return 0 ;;
    esac
  }
  export -f op

  ensure_op_session
  # Should timeout after 30s
}

# Run tests
test_signed_in
test_signed_out_v2
test_timeout
```

**test_wait_for_service.sh**:
```bash
# Test retry logic, timeouts, etc.
```

**test_validate_json.sh**:
```bash
# Test JSON schema validation
```

---

### Integration Tests (scripts/tests/integration/)

**test_full_boot.sh**:
```bash
#!/usr/bin/env bash
# Test complete boot sequence from clean state

# Setup: Sign out, kill all services
op signout
pkill -f "integration-service|voice-service|reasoning-gateway" || true

# Execute boot
bash scripts/claude_tier1_boot.sh

# Validate results
assert_service_running integration-service 3005
assert_service_running voice-service 8080
assert_service_running reasoning-gateway 4002

assert_agent_running planning
assert_agent_running research
assert_agent_running artifact
assert_agent_running exec
assert_agent_running qa

assert_no_secrets_in_logs

echo "✅ Full boot test PASSED"
```

---

### Chaos Tests (scripts/tests/chaos/)

**test_failure_modes.sh**:
```bash
#!/usr/bin/env bash
# Test resilience to various failures

test_kill_service_mid_boot() {
  # Start boot in background
  bash scripts/claude_tier1_boot.sh &
  BOOT_PID=$!

  # Wait for integration-service to start
  sleep 10

  # Kill integration-service
  pkill -f integration-service

  # Boot should detect failure and rollback
  wait $BOOT_PID
  [[ $? -ne 0 ]] || fail "Boot should have failed"

  # Verify all services stopped (rollback)
  assert_no_services_running
}

test_disk_full() {
  # Fill disk to trigger V9
  # Boot should fail with clear error
}

test_port_collision() {
  # Start dummy service on 3005
  # Boot should detect collision and fail
}

test_stale_pid_files() {
  # Create fake PID files
  # Boot should clean and proceed
}
```

---

## Phase 5: Documentation

### Failure Mode Runbook
**File**: `docs/TIER1_FAILURE_MODES.md`

For each failure scenario:
- Symptoms
- Root cause
- Detection method
- Remediation steps
- Prevention

Example:
```markdown
### Failure: integration-service won't start

**Symptoms:**
- Boot hangs at "Waiting for integration-service..."
- Timeout after 30s
- Error: "integration-service failed to become healthy"

**Root Causes:**
1. Port 3005 already in use
2. Database connection failed
3. Missing secrets in 1Password vault

**Detection:**
```bash
# Check port
lsof -i :3005

# Check logs
tail -50 logs/integration-service.log

# Check secrets
op item get integration-service --vault LivHana-Ops-Keys
```

**Remediation:**
```bash
# If port in use:
kill $(lsof -ti :3005)

# If database down:
# Start Postgres...

# If secrets missing:
op item create --category="API Credential" \
  --vault="LivHana-Ops-Keys" \
  --title="integration-service" \
  DATABASE_URL="postgres://..." \
  JWT_SECRET="..."
```

**Prevention:**
- Pre-flight port collision check (already implemented)
- Database readiness probe before service start
- Validate vault items exist before boot
```

---

## Timeline & Phases

### Phase 1: File Structure (Day 1, 2 hours)
- [ ] Create directory structure
- [ ] Extract helpers to individual files
- [ ] Update imports in main boot script
- [ ] Test that boot still works

### Phase 2: Core Vulnerabilities (Day 1-2, 4 hours)
- [ ] V1: Retry logic (30 min)
- [ ] V3: PID validation (20 min)
- [ ] V4: Rollback (45 min)
- [ ] V10: Secret scrubbing (45 min)
- [ ] V12: Agent validation (30 min)
- [ ] V Silent: Fix || true (20 min)

### Phase 3: Secondary Vulnerabilities (Day 2, 2 hours)
- [ ] V5: Port configuration (15 min)
- [ ] V7: Version validation (15 min)
- [ ] V8: tmux namespacing (10 min)
- [ ] V9: Disk check (15 min)
- [ ] V11: tmux validation (15 min)
- [ ] V Secret Scope: Scoped env files (25 min)

### Phase 4: Testing (Day 2-3, 3 hours)
- [ ] Unit tests for helpers (1 hour)
- [ ] Integration test (1 hour)
- [ ] Chaos tests (1 hour)

### Phase 5: Documentation (Day 3, 1 hour)
- [ ] Failure mode runbook
- [ ] Security audit report
- [ ] Operator guide

---

## Acceptance Criteria

### Functional
- [ ] `claude-tier1` works from clean slate
- [ ] Idempotent (safe to run multiple times)
- [ ] Completes in <45s (was <30s, accounting for safety checks)
- [ ] All systems green on completion

### Security
- [ ] No secrets on disk (only via `op run`)
- [ ] No secrets in logs (scrubbed)
- [ ] No secrets in `ps aux`
- [ ] Log files have 600 permissions
- [ ] Vault items validated before use

### Reliability
- [ ] Retry logic on transient failures
- [ ] Timeout on all blocking operations (30s)
- [ ] PID file validation (stale detection)
- [ ] Port collision detection
- [ ] Rollback on partial failure
- [ ] Agent health validation

### Observability
- [ ] Every failure has actionable remediation
- [ ] Structured logs (timestamps, PIDs, exit codes)
- [ ] Detailed health check errors
- [ ] Machine-parseable status JSON

### Code Quality
- [ ] Each script <100 lines
- [ ] Clear single responsibility
- [ ] 80%+ test coverage
- [ ] No duplicate logic
- [ ] shellcheck passes on all scripts

---

## Risk Assessment

### Risks of NOT Hardening

| Risk | Likelihood | Impact | Total |
|------|------------|--------|-------|
| RCE exploitation | LOW (fixed) | CRITICAL | MEDIUM |
| Silent failures in production | HIGH | HIGH | CRITICAL |
| Secrets leaked in logs | MEDIUM | CRITICAL | HIGH |
| Port collisions causing downtime | MEDIUM | MEDIUM | MEDIUM |
| Race conditions on slow systems | HIGH | MEDIUM | MEDIUM |
| Partial boot leaving system broken | MEDIUM | HIGH | HIGH |

### Risks of Hardening

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking changes | LOW | HIGH | Comprehensive testing |
| Increased boot time | MEDIUM | LOW | Acceptable trade-off for safety |
| Complexity increase | LOW | MEDIUM | Clear documentation |

---

## Estimated Costs

### Time Investment
- **Development**: 8-10 hours (as estimated)
- **Testing**: 3 hours
- **Documentation**: 1 hour
- **Total**: ~12-14 hours

### Ongoing Maintenance
- **Per quarter**: ~2 hours (dependency updates, new edge cases)

### ROI
- **Time saved** debugging silent failures: 5-10 hours/month
- **Risk reduction**: CRITICAL vulnerabilities → ZERO
- **Payback period**: 1-2 months

---

## Next Steps

### Decision Required

**Option A**: Execute full hardening plan (~14 hours)
**Option B**: Execute quick wins only (V1, V10, V12, Silent - ~2 hours)
**Option C**: Ship current state and defer hardening

### Recommended: Option A (Full Hardening)

**Justification**:
- Critical vulnerabilities remain (V10, V12, Silent Failures)
- Principle of One refactoring pays dividends long-term
- Test coverage prevents future regressions
- Security posture meets production standards

---

## Conclusion

This plan provides a systematic path to eliminate all 12 vulnerabilities, refactor to Principle of One, and establish production-grade security/reliability.

**Status**: READY FOR APPROVAL
**Next Action**: Await decision on Option A/B/C

---

**Created by**: Claude Code (Red Team Analysis)
**Date**: 2025-10-23
**Version**: 1.0
