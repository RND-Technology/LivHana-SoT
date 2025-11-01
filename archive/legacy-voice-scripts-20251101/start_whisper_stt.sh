#!/usr/bin/env bash
# Start Whisper STT service on port 2022
set -euo pipefail

PORT="${PORT:-2022}"
HOST="${HOST:-127.0.0.1}"

# Structured logging helper
jlog() {
  printf '{"timestamp":"%s","severity":"%s","service":"whisper-stt","message":"%s"}\n' \
    "$(date -u +%FT%TZ)" "$1" "$2"
}

jlog INFO "Starting Whisper STT on ${HOST}:${PORT}"

# TODO: Replace with actual Whisper STT start command
# Example: exec python3 -m whisper_server --port "$PORT" --host "$HOST"
if ! command -v whisper_server >/dev/null 2>&1; then
  jlog ERROR "whisper_server binary not found in PATH"
  exit 1
fi

exec whisper_server --port "$PORT" --host "$HOST"

