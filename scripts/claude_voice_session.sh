#!/usr/bin/env bash
# 🎤 Liv Voice tmux supervisor (MAX_AUTO compatible)
# Ensures the voice session runs once per boot and exposes health status.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
SESSION_NAME="liv-voice"
STATUS_DIR="$ROOT/tmp/agent_status"
LOG_DIR="$ROOT/logs/voice"
PROMPT_FILE="$ROOT/tmp/claude_tier1_prompt.txt"
RUNNER="$ROOT/scripts/agents/voice_session_runner.sh"

STATUS_FILE="$STATUS_DIR/voice.status.json"
LOG_FILE="$LOG_DIR/voice_session_$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$STATUS_DIR" "$LOG_DIR"

write_blocked_status() {
  local note="$1"
  local now
  now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  cat <<EOF | bash "$ROOT/scripts/guards/atomic_write.sh" "$STATUS_FILE"
{
  "agent": "liv-voice",
  "phase": "voice-orchestration",
  "status": "blocked",
  "updated_at": "$now",
  "notes": "$note"
}
EOF
}

if ! command -v tmux >/dev/null 2>&1; then
  printf "❌ tmux not available – cannot autostart voice session\n"
  write_blocked_status "tmux unavailable – install tmux to enable MAX_AUTO voice"
  exit 1
fi

if [[ ! -f "$PROMPT_FILE" ]]; then
  printf "⚠️  Prompt not rendered (expected at %s); skipping voice launch\n" "$PROMPT_FILE"
  write_blocked_status "Prompt file missing – run claude_tier1_boot first"
  exit 1
fi

if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  printf "🎤 Liv Voice session already running (tmux:%s)\n" "$SESSION_NAME"
  exit 0
fi

VOICE_PROMPT_FILE="$PROMPT_FILE" \
VOICE_STATUS_FILE="$STATUS_FILE" \
VOICE_LOG_FILE="$LOG_FILE" \
VOICE_SESSION_NAME="$SESSION_NAME" \
tmux new-session -d -s "$SESSION_NAME" "cd \"$ROOT\" && bash \"$RUNNER\""

printf "🎤 Liv Voice launched in tmux session '%s'\n" "$SESSION_NAME"
printf "   Attach with: tmux attach -t %s\n" "$SESSION_NAME"
