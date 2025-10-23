#!/usr/bin/env bash
# Supervises the Liv Voice tmux session, launches Claude voice mode,
# and maintains status JSON so the watcher can detect readiness.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATUS_FILE="${VOICE_STATUS_FILE:-$ROOT/tmp/agent_status/voice.status.json}"
LOG_FILE="${VOICE_LOG_FILE:-$ROOT/logs/voice/liv_voice_$(date +%Y%m%d_%H%M%S).log}"
PROMPT_FILE="${VOICE_PROMPT_FILE:-$ROOT/tmp/claude_tier1_prompt.txt}"
SESSION_NAME="${VOICE_SESSION_NAME:-liv-voice}"
MODEL="${VOICE_MODEL:-sonnet}"

mkdir -p "$(dirname "$STATUS_FILE")" "$(dirname "$LOG_FILE")"

write_status() {
  local status="$1"
  local notes="$2"
  local now
  now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  cat > "$STATUS_FILE" <<EOF
{
  "agent": "liv-voice",
  "phase": "voice-orchestration",
  "status": "$status",
  "started_at": "$now",
  "finished_at": "",
  "tmux_session": "$SESSION_NAME",
  "log_file": "$LOG_FILE",
  "notes": "$notes"
}
EOF
}

log() {
  local timestamp
  timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf "[%s] %s\n" "$timestamp" "$1" >>"$LOG_FILE"
}

abort_with() {
  write_status "blocked" "$1"
  log "ERROR: $1"
  exit 1
}

[[ -f "$PROMPT_FILE" ]] || abort_with "Prompt not rendered (expected at $PROMPT_FILE)"
command -v claude >/dev/null 2>&1 || abort_with "claude CLI not in PATH"

write_status "starting" "Launching Claude voice mode (model=$MODEL)"
log "Launching Claude voice session using prompt $PROMPT_FILE"

if ! command -v claude >/dev/null 2>&1; then
  abort_with "claude CLI unavailable"
fi

if ! command -v lsof >/dev/null 2>&1; then
  log "WARN: lsof unavailable; voice port checks skipped"
else
  if ! lsof -i :2022 2>/dev/null | grep -q LISTEN; then
    log "WARN: Whisper (port 2022) not detected; STT may be unavailable"
  fi
  if ! lsof -i :8880 2>/dev/null | grep -q LISTEN; then
    log "WARN: Kokoro (port 8880) not detected; TTS may be unavailable"
  fi
fi

attempt_voice() {
  # Claude CLI currently requires interactive shell; run via env bash -lc.
  local exit_code
  log "Starting claude chat (model=$MODEL)"
  write_status "listening" "Voice session active; greetings should trigger immediately"

  # shellcheck disable=SC2086
  CLAUDE_SESSION_LOG="$LOG_FILE" \
  NO_UPDATE_NOTIFIER=1 \
  CI=1 \
  bash -lc "cd \"$ROOT\" && claude chat --model $MODEL --system-prompt \"\$(cat \"$PROMPT_FILE\")\"" >>"$LOG_FILE" 2>&1
  exit_code=$?

  if [[ $exit_code -eq 0 ]]; then
    log "Claude voice session ended cleanly (exit 0)"
    write_status "ended" "Voice session ended cleanly"
  else
    log "Claude voice session exited with code $exit_code"
    write_status "blocked" "Voice session exited unexpectedly (code $exit_code)"
  fi

  return $exit_code
}

# Attempt once; caller (tmux) keeps session for manual inspection if it exits.
attempt_voice || exit $?
