#!/usr/bin/env bash
# Start Kokoro TTS service on port 8880
set -euo pipefail

PORT="${PORT:-8880}"
HOST="${HOST:-127.0.0.1}"

jlog() {
  printf '{"timestamp":"%s","severity":"%s","service":"kokoro-tts","message":"%s"}\n' \
    "$(date -u +%FT%TZ)" "$1" "$2"
}

jlog INFO "Starting Kokoro TTS on ${HOST}:${PORT}"

# TODO: Replace with actual Kokoro TTS start command
# Example: exec python3 -m kokoro_tts --port "$PORT" --host "$HOST"
if ! command -v kokoro_tts >/dev/null 2>&1; then
  jlog ERROR "kokoro_tts binary not found in PATH"
  exit 1
fi

exec kokoro_tts --port "$PORT" --host "$HOST"

