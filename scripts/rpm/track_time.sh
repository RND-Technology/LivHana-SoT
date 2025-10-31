#!/usr/bin/env bash
# Time Tracking Script - Log estimate vs actual for tasks
# Usage: ./track_time.sh [start|complete|list] [task_name] [estimate_minutes]

set -euo pipefail

DB_FILE=".claude/data/time-tracking-database.json"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# Ensure database exists
if [[ ! -f "$DB_FILE" ]]; then
  echo "Error: Time tracking database not found at $DB_FILE"
  exit 1
fi

# Generate task ID
generate_task_id() {
  local count=$(jq '.tasks | length' "$DB_FILE")
  printf "TRACK-%03d" $((count + 1))
}

# Get current ISO8601 timestamp
get_timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Start tracking a new task
start_task() {
  local task_name="$1"
  local estimate_minutes="$2"
  local task_type="${3:-exploratory}"
  local agent="${4:-claude-code}"

  local task_id=$(generate_task_id)
  local started_at=$(get_timestamp)

  # Create new task object
  local new_task=$(cat <<EOF
{
  "task_id": "$task_id",
  "task_name": "$task_name",
  "task_type": "$task_type",
  "estimate_minutes": $estimate_minutes,
  "actual_minutes": null,
  "variance_ratio": null,
  "speed_multiplier": null,
  "started_at": "$started_at",
  "completed_at": null,
  "status": "in_progress",
  "agent": "$agent",
  "files_modified": [],
  "notes": ""
}
EOF
)

  # Add task to database
  jq ".tasks += [$new_task] | .summary.total_tasks += 1 | .summary.pending_tasks += 1" "$DB_FILE" > "$DB_FILE.tmp"
  mv "$DB_FILE.tmp" "$DB_FILE"

  echo "✅ Started tracking task: $task_id"
  echo "   Name: $task_name"
  echo "   Estimate: $estimate_minutes minutes"
  echo "   Started: $started_at"
  echo ""
  echo "To complete: ./track_time.sh complete $task_id <actual_minutes>"
}

# Complete a task and calculate metrics
complete_task() {
  local task_id="$1"
  local actual_minutes="$2"
  local notes="${3:-}"

  local completed_at=$(get_timestamp)

  # Update task in database
  jq "
    .tasks |= map(
      if .task_id == \"$task_id\" then
        .actual_minutes = $actual_minutes |
        .completed_at = \"$completed_at\" |
        .status = \"completed\" |
        .variance_ratio = (.actual_minutes / .estimate_minutes) |
        .speed_multiplier = (.estimate_minutes / .actual_minutes) |
        .notes = \"$notes\"
      else . end
    ) |
    .summary.completed_tasks += 1 |
    .summary.pending_tasks -= 1
  " "$DB_FILE" > "$DB_FILE.tmp"
  mv "$DB_FILE.tmp" "$DB_FILE"

  # Get updated task for display
  local task=$(jq ".tasks[] | select(.task_id == \"$task_id\")" "$DB_FILE")
  local estimate=$(echo "$task" | jq -r '.estimate_minutes')
  local variance=$(echo "$task" | jq -r '.variance_ratio')
  local multiplier=$(echo "$task" | jq -r '.speed_multiplier')

  echo "✅ Completed task: $task_id"
  echo "   Estimate: $estimate minutes"
  echo "   Actual: $actual_minutes minutes"
  echo "   Variance: ${variance}x ($(awk "BEGIN {print ($actual_minutes - $estimate)}")min difference)"
  echo "   Speed Multiplier: ${multiplier}x $(if (( $(echo "$multiplier > 1" | bc -l) )); then echo "FASTER ⚡"; else echo "slower"; fi)"
}

# List all tasks
list_tasks() {
  echo "📊 Time Tracking Database"
  echo "=========================="
  echo ""

  # Summary stats
  local total=$(jq '.summary.total_tasks' "$DB_FILE")
  local completed=$(jq '.summary.completed_tasks' "$DB_FILE")
  local pending=$(jq '.summary.pending_tasks' "$DB_FILE")

  echo "Total Tasks: $total"
  echo "Completed: $completed"
  echo "Pending: $pending"
  echo ""

  # Show recent tasks
  echo "Recent Tasks:"
  jq -r '.tasks[-10:] | reverse | .[] |
    "[\(.status)] \(.task_id) - \(.task_name)\n" +
    "  Est: \(.estimate_minutes)min | Act: \(.actual_minutes // "N/A")min | " +
    "Multiplier: \(.speed_multiplier // "N/A")x"
  ' "$DB_FILE"

  # Calculate average multiplier for completed tasks
  local avg_multiplier=$(jq '[.tasks[] | select(.status == "completed") | .speed_multiplier] | add / length' "$DB_FILE" 2>/dev/null || echo "null")

  if [[ "$avg_multiplier" != "null" ]] && [[ "$avg_multiplier" != "0" ]]; then
    echo ""
    echo "Average Speed Multiplier: ${avg_multiplier}x"
  fi
}

# Main command router
case "${1:-list}" in
  start)
    if [[ $# -lt 3 ]]; then
      echo "Usage: $0 start <task_name> <estimate_minutes> [task_type] [agent]"
      echo "Example: $0 start \"Build RPM agent\" 90 surgical claude-code"
      exit 1
    fi
    start_task "$2" "$3" "${4:-exploratory}" "${5:-claude-code}"
    ;;
  complete)
    if [[ $# -lt 3 ]]; then
      echo "Usage: $0 complete <task_id> <actual_minutes> [notes]"
      echo "Example: $0 complete TRACK-001 15 \"Completed faster than expected\""
      exit 1
    fi
    complete_task "$2" "$3" "${4:-}"
    ;;
  list)
    list_tasks
    ;;
  *)
    echo "Usage: $0 [start|complete|list]"
    echo ""
    echo "Commands:"
    echo "  start <task_name> <estimate_minutes> [type] [agent]"
    echo "  complete <task_id> <actual_minutes> [notes]"
    echo "  list"
    exit 1
    ;;
esac
