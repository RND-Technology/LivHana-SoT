#!/bin/bash
set -e
STT_RUNNING=$(lsof -ti:2022 2>/dev/null || echo "")
TTS_RUNNING=$(lsof -ti:8880 2>/dev/null || echo "")
if [ -n "$STT_RUNNING" ]; then
  echo "✅ STT service already running on port 2022"
else
  echo "🚀 Starting STT service on port 2022..."
  tmux new-session -d -s stt "python3 services/stt-whisper.py" 2>/dev/null
  sleep 2
fi
if [ -n "$TTS_RUNNING" ]; then
  echo "✅ TTS service already running on port 8880"
else
  echo "🚀 Starting TTS service on port 8880..."
  tmux new-session -d -s tts "python3 services/tts-kokoro.py" 2>/dev/null
  sleep 2
fi
echo "✅ Voice services ready (STT:2022, TTS:8880)"
echo "🎤 ALWAYS ON, ALWAYS LISTENING, ALWAYS FAITHFUL"
