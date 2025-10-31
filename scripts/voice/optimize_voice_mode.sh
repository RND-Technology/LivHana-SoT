#!/usr/bin/env bash
# Voice Mode Optimization - Set optimal parameters for lowest latency
# Based on: docs/VOICE_MODE_OPTIMIZATION_GUIDE.md

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "🎤 Optimizing Voice Mode Parameters..."

# Export optimal low-latency configuration
export VOICEMODE_TTS_AUDIO_FORMAT="pcm"  # Zero latency streaming
export VOICEMODE_STT_AUDIO_FORMAT="mp3"  # Best for uploads
export VOICEMODE_CHUNK_DURATION="0.02"   # 20ms frames (low latency)
export VOICEMODE_SILENCE_DURATION="0.5"  # Faster cutoff (down from 0.7)
export VOICEMODE_VAD_MODE="2"            # Balanced aggressiveness
export VOICEMODE_MIN_SPEECH_DURATION="0.3"
export VOICEMODE_SAMPLE_RATE="16000"     # 16kHz for speech
export VOICEMODE_CHANNELS="1"            # Mono
export VOICEMODE_AUDIO_FORMAT="pcm"      # Global format

# Local services (already running)
export STT_BASE_URL="http://localhost:2022"
export TTS_BASE_URL="http://localhost:8880"
export TTS_MODEL="tts-1"
export TTS_VOICE="af_sky"  # Kokoro voice

# Save to persistent config
cat > "$ROOT_DIR/.env.voice" << EOF
# Voice Mode Optimal Configuration - Generated $(date)
VOICEMODE_TTS_AUDIO_FORMAT=pcm
VOICEMODE_STT_AUDIO_FORMAT=mp3
VOICEMODE_CHUNK_DURATION=0.02
VOICEMODE_SILENCE_DURATION=0.5
VOICEMODE_VAD_MODE=2
VOICEMODE_MIN_SPEECH_DURATION=0.3
VOICEMODE_SAMPLE_RATE=16000
VOICEMODE_CHANNELS=1
VOICEMODE_AUDIO_FORMAT=pcm
STT_BASE_URL=http://localhost:2022
TTS_BASE_URL=http://localhost:8880
TTS_MODEL=tts-1
TTS_VOICE=af_sky
EOF

echo "✅ Voice parameters optimized and saved to .env.voice"
echo "📊 Expected latency: 50-150ms (local Whisper + Kokoro)"
echo "🎯 Target: < 200ms total (better than ChatGPT Advanced Voice)"

# Load into current shell
source "$ROOT_DIR/.env.voice"

echo ""
echo "Current configuration:"
env | grep -i voice | sort
