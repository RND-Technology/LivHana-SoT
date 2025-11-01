#!/usr/bin/env bash
# Start Whisper Transcription Service
set -euo pipefail

echo "🎤 Starting Whisper Transcription Service..."

# Configuration
WHISPER_PORT="${WHISPER_PORT:-9000}"
WHISPER_MODEL="${WHISPER_MODEL:-base.en}"
WHISPER_DEVICE="${WHISPER_DEVICE:-auto}"
WHISPER_THREADS="${WHISPER_THREADS:-4}"

# Check if already running
if lsof -i :"$WHISPER_PORT" >/dev/null 2>&1; then
  echo "  ℹ️  Whisper service already running on port $WHISPER_PORT"
  exit 0
fi

# Navigate to service directory
cd "$(dirname "${BASH_SOURCE[0]}")/../../backend/voice-service/services"

# Export environment variables
export WHISPER_PORT
export WHISPER_MODEL
export WHISPER_DEVICE
export WHISPER_THREADS
export WHISPER_USE_CPP="${WHISPER_USE_CPP:-false}"
export NODE_ENV="${NODE_ENV:-production}"

# Start in tmux session
tmux new-session -d -s whisper-service \
  "node whisper-service.js"

# Wait for service to start
sleep 3

# Health check
for i in {1..10}; do
  if curl -s "http://localhost:$WHISPER_PORT/health" >/dev/null 2>&1; then
    echo "✅ Whisper service started on port $WHISPER_PORT"
    echo "   Model: $WHISPER_MODEL"
    echo "   Device: $WHISPER_DEVICE"
    echo "   Health: http://localhost:$WHISPER_PORT/health"
    exit 0
  fi
  sleep 1
done

echo "❌ Whisper service failed to start"
tmux kill-session -t whisper-service 2>/dev/null || true
exit 1
