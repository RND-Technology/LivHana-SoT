#!/usr/bin/env bash
# Start Vocode TTS Service
set -euo pipefail

echo "🗣️  Starting Vocode TTS Service..."

# Configuration
VOCODE_PORT="${VOCODE_PORT:-9001}"
VOCODE_PROVIDER="${VOCODE_PROVIDER:-elevenlabs}"
VOCODE_VOICE_ID="${VOCODE_VOICE_ID:-default}"
ELEVENLABS_API_KEY="${ELEVENLABS_API_KEY:-}"

# Check if already running
if lsof -i :"$VOCODE_PORT" >/dev/null 2>&1; then
  echo "  ℹ️  Vocode service already running on port $VOCODE_PORT"
  exit 0
fi

# Validate required env vars
if [[ "$VOCODE_PROVIDER" == "elevenlabs" && -z "$ELEVENLABS_API_KEY" ]]; then
  echo "❌ ELEVENLABS_API_KEY required for ElevenLabs provider"
  exit 1
fi

# Navigate to service directory
cd "$(dirname "${BASH_SOURCE[0]}")/../../backend/voice-service/services"

# Export environment variables
export VOCODE_PORT
export VOCODE_PROVIDER
export VOCODE_VOICE_ID
export ELEVENLABS_API_KEY
export VOCODE_MODEL="${VOCODE_MODEL:-eleven_turbo_v2}"
export VOCODE_STREAMING_LATENCY="${VOCODE_STREAMING_LATENCY:-3}"
export NODE_ENV="${NODE_ENV:-production}"

# Start in tmux session
tmux new-session -d -s vocode-service \
  "node vocode-service.js"

# Wait for service to start
sleep 3

# Health check
for i in {1..10}; do
  if curl -s "http://localhost:$VOCODE_PORT/health" >/dev/null 2>&1; then
    echo "✅ Vocode service started on port $VOCODE_PORT"
    echo "   Provider: $VOCODE_PROVIDER"
    echo "   Voice: $VOCODE_VOICE_ID"
    echo "   Health: http://localhost:$VOCODE_PORT/health"
    exit 0
  fi
  sleep 1
done

echo "❌ Vocode service failed to start"
tmux kill-session -t vocode-service 2>/dev/null || true
exit 1
