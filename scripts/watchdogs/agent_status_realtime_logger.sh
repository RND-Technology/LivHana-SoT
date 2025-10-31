#!/usr/bin/env bash
# Real-Time Agent Status Logger
# Continuously monitors and logs agent health status
# Created: 2025-10-28 by Liv Hana (Tier-1)
# Owner: Jesse CEO

set -euo pipefail

# Configuration
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)"
LOG_INTERVAL="${AGENT_LOG_INTERVAL:-10}"  # 10 seconds default
STATUS_DIR="$ROOT/tmp/agent_status"
LOG_FILE="$ROOT/logs/agent_status_realtime.log"
METRICS_FILE="$ROOT/tmp/agent_metrics.json"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1" | tee -a "$LOG_FILE"; }
warning() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️  $1" | tee -a "$LOG_FILE"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1" | tee -a "$LOG_FILE"; }
metric() { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} 📊 $1" | tee -a "$LOG_FILE"; }

# Initialize
mkdir -p "$(dirname "$LOG_FILE")" "$STATUS_DIR"

info "Real-time agent status logger started (PID $$)"
info "Monitoring interval: ${LOG_INTERVAL}s"

# Agent list
AGENTS=("planning" "research" "artifact" "execmon" "qa")

# Check agent health
check_agent_health() {
  local agent="$1"
  local status_file="$STATUS_DIR/${agent}.status.json"

  # Check if status file exists
  if [[ ! -f "$status_file" ]]; then
    echo "missing"
    return
  fi

  # Check file age (within last 5 minutes = active)
  local file_age=$(($(date +%s) - $(stat -f %m "$status_file" 2>/dev/null || echo 0)))
  if [[ $file_age -gt 300 ]]; then
    echo "stale"
    return
  fi

  # Check status field in JSON
  if grep -qE '"status"[[:space:]]*:[[:space:]]*"(active|running)"' "$status_file" 2>/dev/null; then
    echo "active"
  else
    echo "inactive"
  fi
}

# Get agent memory usage (if running)
get_agent_memory() {
  local agent="$1"

  # Find process by tmux session name
  if tmux has-session -t "$agent" 2>/dev/null; then
    local pids
    pids=$(tmux list-panes -t "$agent" -F "#{pane_pid}" 2>/dev/null)
    if [[ -n "$pids" ]]; then
      local mem_kb
      mem_kb=$(ps -o rss= -p "$pids" 2>/dev/null | awk '{sum+=$1} END {print sum}')
      if [[ -n "$mem_kb" ]]; then
        echo "$((mem_kb / 1024))"  # Convert to MB
        return
      fi
    fi
  fi

  echo "0"
}

# Generate metrics JSON (atomic write to prevent corruption)
generate_metrics() {
  local timestamp
  timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  local active_count=0
  local total_memory=0

  # Write to temp file first for atomic update
  if ! cat > "$METRICS_FILE.tmp" <<EOF
{
  "timestamp": "$timestamp",
  "agents": {
EOF
  then
    warning "Failed to write metrics file (disk full or permissions issue)"
    rm -f "$METRICS_FILE.tmp"
    echo "0:0"
    return 1
  fi

  local first=true
  for agent in "${AGENTS[@]}"; do
    local health
    health=$(check_agent_health "$agent")
    local memory
    memory=$(get_agent_memory "$agent")

    [[ "$health" == "active" ]] && active_count=$((active_count + 1))
    total_memory=$((total_memory + memory))

    if [[ "$first" == true ]]; then
      first=false
    else
      echo "," >> "$METRICS_FILE.tmp"
    fi

    cat >> "$METRICS_FILE.tmp" <<EOF
    "$agent": {
      "health": "$health",
      "memory_mb": $memory,
      "last_check": "$timestamp"
    }
EOF
  done

  cat >> "$METRICS_FILE.tmp" <<EOF

  },
  "summary": {
    "total_agents": ${#AGENTS[@]},
    "active_agents": $active_count,
    "total_memory_mb": $total_memory,
    "health_score": $((active_count * 20))
  }
}
EOF

  # Atomic move into place
  if ! mv "$METRICS_FILE.tmp" "$METRICS_FILE" 2>/dev/null; then
    warning "Failed to move metrics file into place (permissions issue?)"
    rm -f "$METRICS_FILE.tmp"
    echo "0:0"
    return 1
  fi

  echo "$active_count:$total_memory"
}

# Main monitoring loop
monitor_loop() {
  local iteration=0

  while true; do
    iteration=$((iteration + 1))

    # Generate metrics
    local metrics
    metrics=$(generate_metrics)
    local active_count
    active_count=$(echo "$metrics" | cut -d: -f1)
    local total_memory
    total_memory=$(echo "$metrics" | cut -d: -f2)

    # Log status
    if [[ $active_count -eq 5 ]]; then
      success "All agents active (5/5) | Memory: ${total_memory}MB"
    elif [[ $active_count -ge 3 ]]; then
      warning "Partial agents active ($active_count/5) | Memory: ${total_memory}MB"
    else
      error "Critical: Only $active_count/5 agents active | Memory: ${total_memory}MB"
    fi

    # Detailed status every 6 iterations (1 minute at 10s interval)
    if [[ $((iteration % 6)) -eq 0 ]]; then
      info "━━━ Agent Status Detail ━━━"
      for agent in "${AGENTS[@]}"; do
        local health
        health=$(check_agent_health "$agent")
        local memory
        memory=$(get_agent_memory "$agent")

        case "$health" in
          active)
            metric "$agent: ACTIVE | ${memory}MB"
            ;;
          inactive)
            warning "$agent: INACTIVE | ${memory}MB"
            ;;
          stale)
            warning "$agent: STALE (>5min since update)"
            ;;
          missing)
            error "$agent: MISSING (no status file)"
            ;;
        esac
      done
      info "━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi

    # Alert if memory exceeds threshold (500MB per agent = 2.5GB total)
    if [[ $total_memory -gt 2500 ]]; then
      warning "High memory usage: ${total_memory}MB (threshold: 2500MB)"
      warning "Consider restarting agents to free memory"
    fi

    sleep "$LOG_INTERVAL"
  done
}

# Cleanup on exit - preserve actual exit code
cleanup() {
  local exit_code=${1:-0}
  info "Real-time agent logger shutting down (PID $$)"
  # No lock file to remove for this watchdog
  exit "$exit_code"
}

# Trap signals for graceful shutdown with proper exit code preservation
trap 'cleanup $?' EXIT
trap 'cleanup 130' SIGINT   # Ctrl+C
trap 'cleanup 143' SIGTERM  # kill command
trap 'cleanup 131' SIGQUIT  # Ctrl+\ or kill -QUIT
trap 'cleanup 129' SIGHUP   # Terminal hangup (SSH disconnects)

success "Agent status monitoring ready"
info "Will log status every ${LOG_INTERVAL}s"
echo ""

monitor_loop
