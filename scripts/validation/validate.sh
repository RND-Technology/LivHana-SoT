#!/usr/bin/env bash
# Master Validation Script - Consolidates 14 duplicate validators
# All-in-one validation for LivHana-SoT system health
set -euo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
FAILURES=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info() { echo "[INFO] $*"; }
success() { echo -e "${GREEN}✅ $*${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $*${NC}" >&2; }
error() { echo -e "${RED}❌ $*${NC}" >&2; }

#============================================================
# ENVIRONMENT VALIDATION
#============================================================
validate_env() {
  echo ""
  echo "=== ENVIRONMENT VALIDATION ==="
  echo ""

  # Node version check
  if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
    if [[ "$NODE_VER" -ge 20 ]]; then
      success "Node: v$(node -v) (>= 20)"
    else
      error "Node: v$(node -v) (< 20 required)"
      ((FAILURES++))
    fi
  else
    error "Node.js not installed"
    ((FAILURES++))
  fi

  # NODE_ENV check
  if [[ -n "${NODE_ENV:-}" ]]; then
    success "NODE_ENV: $NODE_ENV"
  else
    warning "NODE_ENV not set (defaulting to development)"
  fi

  # Claude CLI check
  if command -v claude >/dev/null 2>&1; then
    CLAUDE_VER=$(claude --version 2>&1 | head -1)
    success "Claude CLI: $CLAUDE_VER"
  else
    error "Claude CLI not found"
    ((FAILURES++))
  fi

  # 1Password CLI check
  if command -v op >/dev/null 2>&1; then
    if op account get >/dev/null 2>&1; then
      success "1Password: Signed in"
    else
      warning "1Password: Not signed in (run: eval \"\$(op signin)\")"
      ((FAILURES++))
    fi
  else
    error "1Password CLI not installed"
    ((FAILURES++))
  fi

  # Disk space check (500MB threshold)
  AVAILABLE_MB=$(df -P "$ROOT" | awk 'NR==2 {print int($4 / 1024)}')
  if (( AVAILABLE_MB >= 500 )); then
    success "Disk space: ${AVAILABLE_MB}MB available"
  else
    error "Disk space: Only ${AVAILABLE_MB}MB available (500MB required)"
    ((FAILURES++))
  fi
}

#============================================================
# SERVICE VALIDATION
#============================================================
validate_services() {
  echo ""
  echo "=== SERVICE VALIDATION ==="
  echo ""

  # Redis check
  if command -v redis-cli >/dev/null 2>&1; then
    if redis-cli PING 2>/dev/null | grep -q PONG; then
      success "Redis: Running"

      # Check housekeeping queue
      QUEUE_LEN=$(redis-cli LLEN "housekeeping:queue" 2>/dev/null || echo 0)
      info "Housekeeping queue length: $QUEUE_LEN"
    else
      warning "Redis: Not running (start with: redis-server --daemonize yes)"
      ((FAILURES++))
    fi
  else
    error "Redis CLI not installed"
    ((FAILURES++))
  fi

  # Check service ports
  for service in "integration-service:3005" "voice-service:8080" "reasoning-gateway:4002"; do
    NAME="${service%%:*}"
    PORT="${service##*:}"

    # Check if port is in use
    if lsof -ti ":$PORT" >/dev/null 2>&1; then
      # Port in use, check if service responds
      if curl -sf "http://localhost:$PORT/health" >/dev/null 2>&1; then
        success "$NAME: UP (port $PORT)"
      else
        warning "$NAME: Port $PORT in use but service not responding"
        ((FAILURES++))
      fi
    else
      warning "$NAME: DOWN (port $PORT not in use)"
      ((FAILURES++))
    fi
  done
}

#============================================================
# AGENT VALIDATION
#============================================================
validate_agents() {
  echo ""
  echo "=== AGENT VALIDATION ==="
  echo ""

  # Check tmux sessions
  if command -v tmux >/dev/null 2>&1; then
    SESSIONS=$(tmux ls 2>/dev/null | grep -E "(planning|research|artifact|execmon|qa)" | wc -l | tr -d ' ')
    if [[ "$SESSIONS" -ge 5 ]]; then
      success "All 5 agent sessions running"
      tmux ls 2>/dev/null | grep -E "(planning|research|artifact|execmon|qa)" | sed 's/^/  /'
    else
      warning "Only $SESSIONS/5 agent sessions running"
      tmux ls 2>/dev/null | sed 's/^/  /' || info "  (no sessions)"
      ((FAILURES++))
    fi
  else
    error "tmux not installed"
    ((FAILURES++))
  fi

  # Check agent status files
  echo ""
  info "Agent status files:"
  for agent in voice planning research artifact exec qa; do
    STATUS_FILE="$ROOT/tmp/agent_status/${agent}.status.json"
    if [[ -f "$STATUS_FILE" ]] && [[ -s "$STATUS_FILE" ]]; then
      if command -v jq >/dev/null 2>&1 && jq empty "$STATUS_FILE" 2>/dev/null; then
        STATUS=$(jq -r '.status // "unknown"' "$STATUS_FILE")
        PHASE=$(jq -r '.phase // "unknown"' "$STATUS_FILE")
        success "$agent: $STATUS ($PHASE)"
      else
        error "$agent: Invalid JSON in status file"
        ((FAILURES++))
      fi
    else
      warning "$agent: No status file or empty"
      ((FAILURES++))
    fi
  done

  # Check funnel ready marker
  echo ""
  if [[ -f "$ROOT/tmp/agent_status/funnel.ready" ]]; then
    success "Funnel: READY"
  else
    warning "Funnel: NOT READY (waiting for first loop)"
  fi
}

#============================================================
# PO1 STRUCTURE VALIDATION
#============================================================
validate_po1_structure() {
  echo ""
  echo "=== PO1 STRUCTURE VALIDATION ==="
  echo ""

  # Check required directories
  for dir in "tmp/agent_status" "logs/ci" "logs/research" "logs/qa" "logs/ops" "templates/agent_status"; do
    if [[ -d "$ROOT/$dir" ]]; then
      success "Directory exists: $dir"
    else
      error "Missing directory: $dir"
      ((FAILURES++))
    fi
  done

  # Check required files
  BLUEPRINT="$ROOT/docs/authority_startup_blueprint.md"
  FUNNEL="$ROOT/.claude/TIER1_FUNNEL_AUTHORITY.md"
  INDEX="$ROOT/docs/index.md"

  if [[ -f "$BLUEPRINT" ]]; then
    success "Blueprint exists: authority_startup_blueprint.md"
  else
    error "Missing: authority_startup_blueprint.md"
    ((FAILURES++))
  fi

  if [[ -f "$FUNNEL" ]]; then
    success "Funnel exists: TIER1_FUNNEL_AUTHORITY.md"
  else
    error "Missing: TIER1_FUNNEL_AUTHORITY.md"
    ((FAILURES++))
  fi

  if [[ -f "$INDEX" ]] && grep -q "authority_startup_blueprint.md" "$INDEX"; then
    success "Index links to blueprint"
  else
    error "docs/index.md missing or doesn't link to blueprint"
    ((FAILURES++))
  fi

  # Check codex_tasks.json
  CODEX_TASKS="$ROOT/tmp/agent_status/codex_tasks.json"
  if [[ -f "$CODEX_TASKS" ]] && [[ -s "$CODEX_TASKS" ]]; then
    if command -v jq >/dev/null 2>&1 && jq empty "$CODEX_TASKS" 2>/dev/null; then
      success "codex_tasks.json: Valid"
    else
      error "codex_tasks.json: Invalid JSON"
      ((FAILURES++))
    fi
  else
    warning "codex_tasks.json: Missing or empty"
  fi
}

#============================================================
# METRICS VALIDATION
#============================================================
validate_metrics() {
  echo ""
  echo "=== METRICS VALIDATION ==="
  echo ""

  METRICS_FILE="$ROOT/tmp/agent_status/system_metrics/metrics.json"
  HISTORY_FILE="$ROOT/tmp/agent_status/system_metrics/metrics_history.jsonl"

  # Check metrics file
  if [[ -f "$METRICS_FILE" ]]; then
    AGE=$(( $(date +%s) - $(stat -f %m "$METRICS_FILE" 2>/dev/null || stat -c %Y "$METRICS_FILE") ))

    if (( AGE < 60 )); then
      success "Metrics file: Current (${AGE}s old)"
    else
      warning "Metrics file: Stale (${AGE}s old)"
      ((FAILURES++))
    fi

    if command -v jq >/dev/null 2>&1 && jq empty "$METRICS_FILE" 2>/dev/null; then
      success "Metrics file: Valid JSON"
    else
      error "Metrics file: Invalid JSON"
      ((FAILURES++))
    fi
  else
    error "Metrics file not found"
    ((FAILURES++))
  fi

  # Check history file
  if [[ -f "$HISTORY_FILE" ]]; then
    LINE_COUNT=$(wc -l < "$HISTORY_FILE" | tr -d ' ')
    success "Metrics history: $LINE_COUNT entries"
  else
    warning "Metrics history: Not found"
  fi

  # Check monitor process
  MONITOR_PID_FILE="$ROOT/tmp/pids/system_monitor.pid"
  if [[ -f "$MONITOR_PID_FILE" ]]; then
    MONITOR_PID=$(cat "$MONITOR_PID_FILE")
    if ps -p "$MONITOR_PID" >/dev/null 2>&1; then
      success "System monitor: Running (PID $MONITOR_PID)"
    else
      warning "Monitor PID file exists but process not running"
      ((FAILURES++))
    fi
  else
    warning "Monitor PID file not found"
    ((FAILURES++))
  fi
}

#============================================================
# SYSTEM STABILITY VALIDATION
#============================================================
validate_stability() {
  echo ""
  echo "=== SYSTEM STABILITY ==="
  echo ""

  # Check crash monitor logs
  if [[ -f "$ROOT/logs/crash_monitor.log" ]]; then
    RECENT_CRASHES=$(tail -10 "$ROOT/logs/crash_monitor.log" | grep -i "crash\|error\|fail" | wc -l | tr -d ' ')
    if (( RECENT_CRASHES == 0 )); then
      success "No recent crashes detected"
    else
      warning "Found $RECENT_CRASHES recent crash events"
      ((FAILURES++))
    fi
  else
    info "Crash monitor log not found (may not be initialized)"
  fi

  # System load
  LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
  info "System load: $LOAD"

  # Memory pressure (macOS specific)
  if command -v vm_stat >/dev/null 2>&1; then
    FREE_PAGES=$(vm_stat | awk '/Pages free/ {print $3}' | tr -d '.')
    FREE_MB=$(( FREE_PAGES * 4096 / 1024 / 1024 ))
    info "Free memory: ${FREE_MB}MB"
  fi
}

#============================================================
# TRUTH OUTPUT VALIDATION
#============================================================
validate_truth_output() {
  echo ""
  echo "=== TRUTH OUTPUT VALIDATION ==="
  echo ""

  OUT="$ROOT/data/truth_outputs/truth_output.json"
  SCHEMA="$ROOT/schemas/truth_output.schema.json"

  if [[ ! -f "$OUT" ]] || [[ ! -s "$OUT" ]]; then
    error "truth_output.json missing or empty"
    ((FAILURES++))
    return
  fi

  if [[ ! -f "$SCHEMA" ]]; then
    error "truth_output.schema.json not found"
    ((FAILURES++))
    return
  fi

  if command -v python3 >/dev/null 2>&1; then
    if python3 - "$SCHEMA" "$OUT" <<'PYTHON' 2>/dev/null
import json, sys
from jsonschema import validate
schema = json.load(open(sys.argv[1]))
data = json.load(open(sys.argv[2]))
validate(instance=data, schema=schema)
PYTHON
    then
      success "truth_output.json: Schema validation passed"
    else
      error "truth_output.json: Schema validation failed"
      ((FAILURES++))
    fi
  else
    warning "Python3 not found, skipping schema validation"
  fi
}

#============================================================
# MAIN EXECUTION
#============================================================
main() {
  echo "========================================"
  echo "  LivHana-SoT Master Validation"
  echo "========================================"

  case "${1:-all}" in
    env)
      validate_env
      ;;
    services)
      validate_services
      ;;
    agents)
      validate_agents
      ;;
    po1)
      validate_po1_structure
      ;;
    metrics)
      validate_metrics
      ;;
    stability)
      validate_stability
      ;;
    truth)
      validate_truth_output
      ;;
    all)
      validate_env
      validate_services
      validate_agents
      validate_po1_structure
      validate_metrics
      validate_stability
      validate_truth_output
      ;;
    *)
      echo "Usage: $0 {env|services|agents|po1|metrics|stability|truth|all}"
      exit 1
      ;;
  esac

  # Summary
  echo ""
  echo "========================================"
  if [[ "$FAILURES" -eq 0 ]]; then
    success "ALL VALIDATIONS PASSED ✨"
    echo ""
    exit 0
  else
    error "$FAILURES VALIDATION FAILURES"
    echo ""
    exit 1
  fi
}

# Allow sourcing without execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
