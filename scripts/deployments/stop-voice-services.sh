#!/bin/bash
set -e
echo "🛑 Stopping voice services..."
tmux kill-session -t stt 2>/dev/null && echo "✅ STT service stopped" || echo "⚠️  STT not running"
tmux kill-session -t tts 2>/dev/null && echo "✅ TTS service stopped" || echo "⚠️  TTS not running"
echo "✅ Voice services stopped"
