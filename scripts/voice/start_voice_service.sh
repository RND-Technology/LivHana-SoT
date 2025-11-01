#!/usr/bin/env bash
# Start Voice Service (Port 8080)
# Main voice orchestrator for VS Code extension WebSocket + Liv's Voice Mode
set -euo pipefail

echo "🎙️  Starting Voice Service..."

# Configuration
VOICE_PORT="${PORT:-8080}"
SERVICE_DIR="$(dirname "${BASH_SOURCE[0]}")/../../backend/voice-service"

# Check if already running
if lsof -i :"$VOICE_PORT" >/dev/null 2>&1; then
  echo "  ℹ️  Voice service already running on port $VOICE_PORT"
  exit 0
fi

# Check tmux session
if tmux has-session -t voice-service 2>/dev/null; then
  echo "  ℹ️  Voice service tmux session exists"
  exit 0
fi

# Navigate to service directory
cd "$SERVICE_DIR"

# Export environment (ELEVENLABS_API_KEY loaded by setup_environment)
export PORT="$VOICE_PORT"
export NODE_ENV="${NODE_ENV:-production}"

# Start in tmux session
tmux new-session -d -s voice-service \
  "npm start"

# Wait for health check
sleep 3
for i in {1..15}; do
  if curl -s "http://localhost:$VOICE_PORT/health" >/dev/null 2>&1; then
    echo "✅ Voice service started on port $VOICE_PORT"
    echo "   Health: http://localhost:$VOICE_PORT/health"
    echo "   WebSocket: ws://localhost:$VOICE_PORT/api/voice/ws"
    echo "   Liv's Voice: ws://localhost:$VOICE_PORT/ws/livvoice"
    exit 0
  fi
  sleep 1
done

echo "❌ Voice service failed to start"
tmux kill-session -t voice-service 2>/dev/null || true
exit 1

