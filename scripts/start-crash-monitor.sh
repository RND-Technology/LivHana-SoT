#!/usr/bin/env bash
# scripts/start-crash-monitor.sh
# Launches the health monitor in a persistent tmux session.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SESSION_NAME="${SESSION_NAME:-crash-monitor}"
MONITOR_SCRIPT="${MONITOR_SCRIPT:-$ROOT/scripts/system-health-monitor.sh}"
RESTART="${RESTART:-false}"

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is required to run the crash monitor" >&2
  exit 1
fi

if [[ ! -x "$MONITOR_SCRIPT" ]]; then
  echo "Monitor script not executable: $MONITOR_SCRIPT" >&2
  exit 1
fi

if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  if [[ "$RESTART" == "true" ]]; then
    tmux kill-session -t "$SESSION_NAME"
  else
    echo "Session '$SESSION_NAME' already running"
    exit 0
  fi
fi

tmux new-session -d -s "$SESSION_NAME" "cd \"$ROOT\" && bash \"$MONITOR_SCRIPT\" --daemon"
echo "✅ Crash monitor session '$SESSION_NAME' started"
echo "   Attach with: tmux attach -t $SESSION_NAME"
