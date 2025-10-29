#!/usr/bin/env bash
# Dual Tier-1 Coordination Loop
# Manages inter-agent communication between Liv Hana (Claude Code CLI) and CODEX (Cursor)

set -euo pipefail
shopt -s nullglob  # Handle empty glob patterns gracefully

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TASK_DIR="$ROOT/tmp/agent_status/codex_tasks"
STATUS_DIR="$ROOT/tmp/agent_status/livhana_status"
HEARTBEAT_FILE="$STATUS_DIR/heartbeat.json"
LOG_FILE="$ROOT/tmp/agent_status/shared/coordination_log.jsonl"

AGENT_NAME="livhana-layer1.1"
HEARTBEAT_INTERVAL=30
LOCK_TTL=180  # 3 minutes
POLL_INTERVAL=5

# Track uptime
START_TIME=$(date +%s)

# Cleanup on exit
trap cleanup EXIT INT TERM

cleanup() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Shutting down dual tier-1 loop..." >&2
  exit 0
}

# Update heartbeat
heartbeat() {
  local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local uptime=$(($(date +%s) - START_TIME))
  
  # Get active tasks
  local active_tasks=()
  if [[ -d "$TASK_DIR" ]]; then
    while IFS= read -r -d '' file; do
      local task_id=$(basename "$file" | sed 's/task_//' | sed 's/.request.json//')
      local result_file="$TASK_DIR/task_${task_id}.result.json"
      if [[ ! -f "$result_file" ]]; then
        active_tasks+=("\"$task_id\"")
      fi
    done < <(find "$TASK_DIR" -name "task_*.request.json" -print0 2>/dev/null || true)
  fi
  
  local active_tasks_json=""
  if [[ ${#active_tasks[@]} -gt 0 ]]; then
    active_tasks_json=$(printf '%s\n' "${active_tasks[@]}" | paste -sd ',' -)
  fi
  
  cat > "$HEARTBEAT_FILE" <<EOF
{
  "agent_name": "$AGENT_NAME",
  "status": "active",
  "last_heartbeat": "$now",
  "uptime_seconds": $uptime,
  "current_capacity": 1.0,
  "active_tasks": [$active_tasks_json],
  "health": {
    "cpu_ok": true,
    "memory_ok": true,
    "disk_ok": true,
    "last_error": null
  }
}
EOF
}

# Clean stale locks (TTL exceeded)
stale_lock_clean() {
  local now=$(date +%s)
  
  if [[ ! -d "$TASK_DIR" ]]; then
    return
  fi
  
  while IFS= read -r -d '' file; do
    local mtime=$(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file" 2>/dev/null || echo "0")
    local age=$((now - mtime))
    
    if [[ $age -gt $LOCK_TTL ]]; then
      echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Cleaning stale lock: $file (age: ${age}s)" >&2
      rm -f "$file"
    fi
  done < <(find "$TASK_DIR" -name "*.lock" -print0 2>/dev/null || true)
}

# Process tasks from CODEX
process_tasks() {
  if [[ ! -d "$TASK_DIR" ]]; then
    return
  fi
  
  while IFS= read -r -d '' file; do
    local task_id=$(basename "$file" | sed 's/task_//' | sed 's/.result.json//')
    local request_file="$TASK_DIR/task_${task_id}.request.json"
    
    # Skip if request doesn't exist
    if [[ ! -f "$request_file" ]]; then
      continue
    fi
    
    # Read result
    local result=$(cat "$file")
    local status=$(echo "$result" | jq -r '.status // "unknown"')
    
    # Log completion
    local log_entry=$(cat <<EOF
{"timestamp":"$(date -u +"%Y-%m-%dT%H:%M:%SZ")","event_type":"task_completed","task_id":"$task_id","source_agent":"codex-cursor","target_agent":"$AGENT_NAME","message":"Task completed with status: $status"}
EOF
)
    echo "$log_entry" >> "$LOG_FILE"
    
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Task $task_id completed: $status" >&2
    
    # Archive processed tasks (move to .processed subdir)
    mkdir -p "$TASK_DIR/.processed"
    mv "$request_file" "$TASK_DIR/.processed/" 2>/dev/null || true
    mv "$file" "$TASK_DIR/.processed/" 2>/dev/null || true
  done < <(find "$TASK_DIR" -maxdepth 1 -name "task_*.result.json" -print0 2>/dev/null || true)
}

# Main loop
main() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting dual tier-1 coordination loop..."
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Agent: $AGENT_NAME"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Task Dir: $TASK_DIR"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Heartbeat: ${HEARTBEAT_INTERVAL}s"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Poll: ${POLL_INTERVAL}s"
  
  # Initialize directories
  mkdir -p "$TASK_DIR"
  mkdir -p "$STATUS_DIR"
  mkdir -p "$(dirname "$LOG_FILE")"
  
  # Log startup
  echo '{"timestamp":"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'","event_type":"loop_start","source_agent":"'$AGENT_NAME'","message":"Dual tier-1 coordination loop started"}' >> "$LOG_FILE"
  
  local last_heartbeat=0
  local iteration=0
  
  while true; do
    iteration=$((iteration + 1))
    local now=$(date +%s)
    
    # Heartbeat update (every 30s)
    if [[ $((now - last_heartbeat)) -ge $HEARTBEAT_INTERVAL ]]; then
      heartbeat
      last_heartbeat=$now
    fi
    
    # Clean stale locks (every iteration)
    stale_lock_clean
    
    # Process completed tasks
    process_tasks
    
    # Sleep
    sleep "$POLL_INTERVAL"
  done
}

main "$@"
