#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATUS_DIR="$ROOT/tmp/agent_status"
LOG_DIR="$ROOT/logs/agents"
mkdir -p "$STATUS_DIR" "$LOG_DIR"

AGENT="qa"
SESSION="qa"
STATUS_FILE="$STATUS_DIR/${AGENT}.status.json"
LOG_FILE="$LOG_DIR/${AGENT}_$(date +%Y%m%d_%H%M%S).log"

write_status() {
  local status="$1"; shift || true
  local notes="$*"
  cat <<JSON | bash "$ROOT/scripts/guards/atomic_write.sh" "$STATUS_FILE"
{
  "agent": "${AGENT}",
  "phase": "startup",
  "status": "${status}",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "finished_at": "",
  "artifacts": ["${LOG_FILE}"],
  "notes": "${notes}"
}
JSON
}

write_status "starting" "initializing ${AGENT}"

if ! command -v tmux >/dev/null 2>&1; then
  write_status "blocked" "tmux missing; brew install tmux"
  exit 0
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  write_status "running" "existing tmux session"
  exit 0
fi

tmux new-session -d -s "$SESSION" -n console "bash -lc 'echo [$(date -u +%FT%TZ)] ${AGENT} agent started >> \"$LOG_FILE\"; tail -f \"$LOG_FILE\"'" >/dev/null 2>&1 || {
  write_status "blocked" "failed to start tmux session"
  exit 0
}

write_status "running" "tmux session created"
echo "QA agent started (tmux session: ${SESSION}). Logs: $LOG_FILE"
exit 0

