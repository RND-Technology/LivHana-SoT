#!/usr/bin/env bash
# Auto-Launch Voice Mode - Continuous Voice Orchestration
# Runs at startup, greets Jesse, stays in continuous listen mode

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_FILE="$ROOT_DIR/logs/voice_auto_launch.log"

mkdir -p "$ROOT_DIR/logs"

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"
}

log "🎤 Voice Auto-Launch Starting..."

# Check if voice services are running
if ! lsof -i :2022 >/dev/null 2>&1; then
  log "❌ Whisper STT not running on port 2022"
  exit 1
fi

if ! lsof -i :8880 >/dev/null 2>&1; then
  log "❌ Kokoro TTS not running on port 8880"
  exit 1
fi

log "✅ Voice services healthy (STT:2022, TTS:8880)"

# Initial greeting
log "🎤 Sending greeting to Jesse..."

# Use Claude to send voice greeting
# This will be called from within a Claude Code session via MCP
cat > "$ROOT_DIR/tmp/voice_greeting_prompt.txt" << 'EOF'
Send voice greeting to Jesse using mcp__voicemode__converse:

Message: "Hey Jesse, Liv Hana here. Voice mode auto-launched. System ready. What's the mission?"

Parameters:
- wait_for_response: true
- listen_duration_max: 300
- vad_aggressiveness: 2

Then stay in continuous voice mode, listening for Jesse's instructions.
EOF

log "✅ Voice greeting prompt ready at tmp/voice_greeting_prompt.txt"
log "✅ Voice auto-launch complete - ready for Claude session"

# Keep script running to maintain tmux session
while true; do
  sleep 60
  log "🎤 Voice auto-launch heartbeat - still running"
done
