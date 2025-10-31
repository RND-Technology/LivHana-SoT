#!/usr/bin/env bash
# Always-on voice session manager (tmux keep-alive)
# Creates idempotent `liv-voice` tmux session that persists for easy attach/detach
# Usage: ./claude_voice_session.sh [start|attach|status]

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
SESSION="liv-voice"
LOG_FILE="$ROOT/logs/voice/session.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

start_session() {
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "✅ Voice session '$SESSION' already running"
    return 0
  fi
  
  # Create tmux session with keep-alive tail command
  tmux new-session -d -s "$SESSION" -n voice "bash -c '
    echo \"[$(date -u +%FT%TZ)] Liv Hana voice session initialized\" | tee -a \"$LOG_FILE\"
    echo \"Session ready for voice orchestration\" | tee -a \"$LOG_FILE\"
    echo \"\" | tee -a \"$LOG_FILE\"
    tail -F \"$LOG_FILE\"
  '" 2>/dev/null
  
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "✅ Voice session '$SESSION' started"
    echo "📎 Attach with: tmux attach -t $SESSION"
    return 0
  else
    echo "❌ Failed to start voice session"
    return 1
  fi
}

attach_session() {
  if ! tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "⚠️  Voice session not running, starting..."
    start_session
  fi
  
  echo "🔗 Attaching to voice session '$SESSION'..."
  tmux attach -t "$SESSION"
}

status_session() {
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "✅ Voice session '$SESSION' is running"
    echo "   Attach: tmux attach -t $SESSION"
    echo "   Detach: Press Ctrl+B then D"
    return 0
  else
    echo "⚠️  Voice session '$SESSION' not running"
    echo "   Start: $0 start"
    return 1
  fi
}

# Main command router
case "${1:-start}" in
  start)
    start_session
    ;;
  attach)
    attach_session
    ;;
  status)
    status_session
    ;;
  *)
    echo "Usage: $0 {start|attach|status}"
    echo "  start  - Create liv-voice session (idempotent)"
    echo "  attach - Attach to liv-voice session (auto-start if missing)"
    echo "  status - Check if liv-voice session is running"
    exit 1
    ;;
esac
