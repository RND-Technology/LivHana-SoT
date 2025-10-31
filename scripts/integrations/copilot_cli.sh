#!/usr/bin/env bash
# GitHub Copilot CLI Integration - Tier 1
# Expert community best practices as of 2025-10-30
# Provides command suggestion and explanation via gh copilot

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TASKS_DIR="$ROOT/tmp/agent_status/tasks"
LOG_FILE="$ROOT/logs/copilot_cli.log"

mkdir -p "$TASKS_DIR" "$(dirname "$LOG_FILE")"

# Logging
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"
}

log_error() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: $*" | tee -a "$LOG_FILE" >&2
}

# Check dependencies
check_deps() {
  if ! command -v gh >/dev/null 2>&1; then
    log_error "GitHub CLI not installed"
    return 1
  fi

  if ! gh copilot --help >/dev/null 2>&1; then
    log_error "GitHub Copilot extension not installed"
    log_error "Install with: gh extension install github/gh-copilot"
    return 1
  fi

  return 0
}

# Suggest command
copilot_suggest() {
  local prompt="$1"
  local output_file="$2"

  log "Copilot suggest: $prompt"

  if gh copilot suggest "$prompt" 2>&1 | tee "$output_file"; then
    log "Copilot suggest completed"
    return 0
  else
    log_error "Copilot suggest failed"
    return 1
  fi
}

# Explain command
copilot_explain() {
  local command="$1"
  local output_file="$2"

  log "Copilot explain: $command"

  if gh copilot explain "$command" 2>&1 | tee "$output_file"; then
    log "Copilot explain completed"
    return 0
  else
    log_error "Copilot explain failed"
    return 1
  fi
}

# Process task file
process_task() {
  local task_file="$1"
  local task_id=$(basename "$task_file" .request.json)

  log "Processing task: $task_id"

  # Read task type and payload
  local task_type=$(jq -r '.type // "suggest"' "$task_file")
  local payload=$(jq -r '.payload' "$task_file")

  # Create output file
  local output_file="$TASKS_DIR/$task_id.output.txt"
  local result_file="$TASKS_DIR/$task_id.result.json"

  # Execute based on type
  local status="completed"
  local exit_code=0

  case "$task_type" in
    suggest)
      if ! copilot_suggest "$payload" "$output_file"; then
        status="failed"
        exit_code=1
      fi
      ;;
    explain)
      if ! copilot_explain "$payload" "$output_file"; then
        status="failed"
        exit_code=1
      fi
      ;;
    *)
      log_error "Unknown task type: $task_type"
      status="failed"
      exit_code=1
      ;;
  esac

  # Create result JSON
  cat > "$result_file" <<EOF
{
  "task_id": "$task_id",
  "type": "$task_type",
  "status": "$status",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "output_file": "$output_file",
  "exit_code": $exit_code
}
EOF

  # Remove request file
  rm -f "$task_file"

  log "Task $task_id completed with status: $status"
  return $exit_code
}

# Main: process one task or run as daemon
main() {
  if ! check_deps; then
    log_error "Dependencies not met"
    exit 1
  fi

  log "Copilot CLI integration started"

  # Single task mode
  if [[ $# -gt 0 && "$1" == "--task" ]]; then
    if [[ -f "$2" ]]; then
      process_task "$2"
      exit $?
    else
      log_error "Task file not found: $2"
      exit 1
    fi
  fi

  # Daemon mode: watch for *.copilot.request.json files
  log "Watching for Copilot tasks in $TASKS_DIR"

  while true; do
    for task_file in "$TASKS_DIR"/*.copilot.request.json; do
      [[ -f "$task_file" ]] || continue
      process_task "$task_file" || log_error "Failed to process $task_file"
    done
    sleep 5
  done
}

main "$@"
