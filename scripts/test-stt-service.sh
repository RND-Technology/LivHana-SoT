#!/usr/bin/env bash
# scripts/test-stt-service.sh
# Sends a sample WAV file to the local Whisper STT endpoint.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AUDIO_PATH="${1:-$ROOT/tmp/test.wav}"
OUTPUT_JSON="${OUTPUT_JSON:-$ROOT/tmp/stt-response.json}"
ENDPOINT="${ENDPOINT:-http://localhost:2022/v1/audio/transcriptions}"

mkdir -p "$ROOT/tmp"

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

generate_audio() {
  log "Generating sample audio: $AUDIO_PATH"
  python3 - "$AUDIO_PATH" <<'PY'
import math, struct, wave, sys

duration = 1.5  # seconds
sample_rate = 16000
frequency = 440
amplitude = 16000

path = sys.argv[1]
with wave.open(path, "w") as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(sample_rate)
    for i in range(int(sample_rate * duration)):
        value = int(amplitude * math.sin(2 * math.pi * frequency * (i / sample_rate)))
        wav.writeframes(struct.pack("<h", value))
PY
}

if [[ ! -f "$AUDIO_PATH" ]]; then
  generate_audio
fi

if [[ ! -f "$AUDIO_PATH" ]]; then
  log "❌ Unable to create audio sample at $AUDIO_PATH"
  exit 1
fi

log "Posting audio to STT endpoint: $ENDPOINT"
http_code=$(curl -sS -m 15 -o "$OUTPUT_JSON" -w "%{http_code}" -X POST "$ENDPOINT" \
  -F "file=@$AUDIO_PATH" \
  -F "model=whisper-1" || echo "000")

if [[ "$http_code" != "200" ]]; then
  log "❌ STT service returned HTTP $http_code (see $OUTPUT_JSON)"
  exit 1
fi

response=$(<"$OUTPUT_JSON")
if command -v jq >/dev/null 2>&1; then
  transcript=$(printf '%s\n' "$response" | jq -r '.text // empty')
  if [[ -n "$transcript" ]]; then
    log "✅ STT response: \"$transcript\""
  else
    log "⚠️  STT response missing text"
  fi
else
  log "ℹ️  jq not installed; raw response saved to $OUTPUT_JSON"
fi

log "✅ STT test completed"
