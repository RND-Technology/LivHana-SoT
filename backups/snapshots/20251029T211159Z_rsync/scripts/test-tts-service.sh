#!/usr/bin/env bash
# scripts/test-tts-service.sh
# Sends a sample phrase to the local Kokoro TTS endpoint.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEXT_INPUT="${1:-Voice mode health check}"
OUTPUT_WAV="${OUTPUT_WAV:-$ROOT/tmp/tts-response.wav}"
ENDPOINT="${ENDPOINT:-http://localhost:8880/v1/audio/speech}"

mkdir -p "$ROOT/tmp"

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

payload=$(python3 - <<PY
import json
print(json.dumps({"text": "$TEXT_INPUT"}, ensure_ascii=True))
PY
)

log "Requesting TTS audio from $ENDPOINT"
http_code=$(curl -sS -m 15 -o "$OUTPUT_WAV" -w "%{http_code}" \
  -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$payload" || echo "000")

if [[ "$http_code" != "200" ]]; then
  log "❌ TTS service returned HTTP $http_code"
  exit 1
fi

size=$(stat -f%z "$OUTPUT_WAV" 2>/dev/null || echo 0)
if [[ "$size" -lt 1024 ]]; then
  log "⚠️  TTS output size suspiciously small (${size} bytes)"
else
  log "✅ TTS audio stored at $OUTPUT_WAV (${size} bytes)"
fi

log "✅ TTS test completed"
