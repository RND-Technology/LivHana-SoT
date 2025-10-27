#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATUS_DIR="$ROOT/tmp/agent_status"
LOG_DIR="$ROOT/logs/agents"
mkdir -p "$STATUS_DIR" "$LOG_DIR"

AGENT="execmon"
SESSION="execmon"
STATUS_FILE="$STATUS_DIR/${AGENT}.status.json"
LOG_FILE="$LOG_DIR/${AGENT}_monitor_$(date +%Y%m%d_%H%M%S).log"

STARTED_AT=""

write_status() {
  local status="$1"; shift || true
  local notes="$*"

  # Preserve original started_at if already set
  if [[ -z "$STARTED_AT" ]] && [[ -f "$STATUS_FILE" ]]; then
    STARTED_AT=$(grep -o '"started_at":"[^"]*"' "$STATUS_FILE" | cut -d'"' -f4 || true)
  fi

  [[ -z "$STARTED_AT" ]] && STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  local json_content
  json_content=$(cat <<JSON
{
  "agent": "${AGENT}",
  "phase": "monitor",
  "status": "${status}",
  "started_at": "${STARTED_AT}",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "finished_at": "",
  "artifacts": ["${LOG_FILE}"],
  "notes": "${notes}"
}
JSON
)
  if [[ -f "$ROOT/scripts/guards/atomic_write.sh" ]]; then
    echo "$json_content" | bash "$ROOT/scripts/guards/atomic_write.sh" "$STATUS_FILE"
  else
    echo "$json_content" > "$STATUS_FILE"
  fi
}

write_status "starting" "initializing ${AGENT} monitor"

if ! command -v tmux >/dev/null 2>&1; then
  write_status "blocked" "tmux missing; brew install tmux"
  exit 0
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  write_status "running" "existing tmux session"
  exit 0
fi

tmux new-session -d -s "$SESSION" -n console bash -lc "
set -euo pipefail
echo \"[\$(date -u +%FT%TZ)] ${AGENT} monitor started\" >> \"${LOG_FILE}\"

# Read started_at from status file once at startup
STARTED_AT=\"${STARTED_AT}\"
if [[ -z \"\$STARTED_AT\" ]] && [[ -f \"${STATUS_FILE}\" ]]; then
  STARTED_AT=\$(grep -o '\"started_at\":\"[^\"]*\"' \"${STATUS_FILE}\" | cut -d'\"' -f4 || echo \"\")
fi
[[ -z \"\$STARTED_AT\" ]] && STARTED_AT=\"\$(date -u +%Y-%m-%dT%H:%M:%SZ)\"

# Heartbeat loop - updates status every 60 seconds
while true; do
  UPDATED_AT=\"\$(date -u +%Y-%m-%dT%H:%M:%SZ)\"

  # Write heartbeat to status file using printf to avoid heredoc issues
  if [[ -f \"${ROOT}/scripts/guards/atomic_write.sh\" ]]; then
    printf '{\"agent\":\"%s\",\"phase\":\"monitor\",\"status\":\"running\",\"started_at\":\"%s\",\"updated_at\":\"%s\",\"finished_at\":\"\",\"artifacts\":[\"%s\"],\"notes\":\"heartbeat active\"}' \"${AGENT}\" \"\$STARTED_AT\" \"\$UPDATED_AT\" \"${LOG_FILE}\" | bash \"${ROOT}/scripts/guards/atomic_write.sh\" \"${STATUS_FILE}\"
  fi

  # Log heartbeat
  echo \"[\$(date -u +%FT%TZ)] Heartbeat\" >> \"${LOG_FILE}\"

  # Sleep for 60 seconds
  sleep 60
done
" >/dev/null 2>&1 || {
  write_status "blocked" "failed to start tmux session"
  exit 0
}

write_status "running" "tmux session created with heartbeat"
echo "Execution monitor started (tmux session: ${SESSION}). Logs: $LOG_FILE"
exit 0

