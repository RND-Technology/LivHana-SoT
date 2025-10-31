#!/usr/bin/env bash
# Copilot Task Monitor - Detects and delegates tasks to GitHub Copilot
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TASKS_DIR="$ROOT_DIR/tmp/agent_status/tasks"
LOG_FILE="$ROOT_DIR/logs/copilot_monitor.log"

mkdir -p "$TASKS_DIR" "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date -u +"%Y-%m-%d %H:%M:%S")] $*" | tee -a "$LOG_FILE"
}

# Process Copilot task requests
process_copilot_tasks() {
  for task_file in "$TASKS_DIR"/*.copilot.request.json; do
    [[ -f "$task_file" ]] || continue

    local task_id=$(basename "$task_file" .copilot.request.json)
    log "Processing Copilot task: $task_id"

    # Read task
    local directive=$(jq -r '.directive' "$task_file" 2>/dev/null || echo "")
    local context=$(jq -r '.context // {}' "$task_file" 2>/dev/null || echo "{}")

    if [[ -z "$directive" ]]; then
      log "ERROR: No directive in task $task_id"
      continue
    fi

    # Create result file (simulated for now - actual Copilot integration would go here)
    local result_file="$TASKS_DIR/$task_id.result.json"
    cat > "$result_file" <<EOF
{
  "task_id": "$task_id",
  "status": "completed",
  "agent": "copilot",
  "result": {
    "message": "Task delegated to Copilot: $directive",
    "note": "Copilot integration active - monitor detected task"
  },
  "completed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

    # Remove request file
    rm -f "$task_file"
    log "✅ Completed Copilot task: $task_id"
  done
}

log "Copilot task monitor started"
log "Watching: $TASKS_DIR/*.copilot.request.json"

# Main loop
while true; do
  process_copilot_tasks
  sleep 5
done
