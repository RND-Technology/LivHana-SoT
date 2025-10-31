#!/usr/bin/env bash
# scripts/voice-health-monitor.sh
# Monitors STT/TTS health endpoints and records latency + status.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_JSON="${LOG_JSON:-$ROOT/logs/voice-health.jsonl}"
INTERVAL="${INTERVAL:-30}"
MODE="${1:---daemon}"

mkdir -p "$(dirname "$LOG_JSON")"
touch "$LOG_JSON"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

probe() {
  local name="$1" url="$2" expect_field="$3"
  local code elapsed body tmp
  tmp="$(mktemp)"
  if ! command -v curl >/dev/null 2>&1; then
    echo '{"status":"missing_curl"}'
    rm -f "$tmp"
    return
  fi
  local metrics
  if ! metrics=$(curl -sS -o "$tmp" -w "%{http_code} %{time_total}" -m 5 "$url" 2>/dev/null); then
    metrics='000 0'
    : > "$tmp"
  fi
  read -r code elapsed <<< "$metrics"
  body="$(<"$tmp")"
  rm -f "$tmp"

  local health
  health="unknown"
  if [[ "$code" == "200" ]]; then
    if [[ -n "$expect_field" ]] && echo "$body" | grep -q "$expect_field"; then
      health="ok"
    else
      health="warning"
    fi
  else
    health="down"
  fi

  SERVICE_NAME="$name" \
  SERVICE_URL="$url" \
  HTTP_CODE="$code" \
  LATENCY="$elapsed" \
  SERVICE_STATUS="$health" \
  EXPECTATION="$expect_field" \
  BODY_CONTENT="$body" \
  python3 - <<'PY'
import json, os, sys

body = os.environ.get("BODY_CONTENT", "")
entry = {
    "timestamp": os.environ.get("TIMESTAMP"),
    "service": os.environ.get("SERVICE_NAME"),
    "url": os.environ.get("SERVICE_URL"),
    "httpCode": int(os.environ.get("HTTP_CODE") or 0),
    "latencySeconds": float(os.environ.get("LATENCY") or 0.0),
    "status": os.environ.get("SERVICE_STATUS"),
    "expectation": os.environ.get("EXPECTATION"),
    "bodySample": body if len(body) <= 250 else body[:247] + "..."
}
print(json.dumps(entry, ensure_ascii=True))
PY
}

record_once() {
  local stt tts ts
  ts="$(timestamp)"
  export TIMESTAMP="$ts"
  stt="$(probe "whisper-stt" "http://localhost:2022/health" "ok")"
  export TIMESTAMP="$ts"
  tts="$(probe "kokoro-tts" "http://localhost:8880/health" "healthy")"
  {
    printf '%s\n' "$stt"
    printf '%s\n' "$tts"
  } >> "$LOG_JSON"
}

run_once() {
  record_once
}

run_daemon() {
  while true; do
    record_once
    sleep "$INTERVAL"
  done
}

case "$MODE" in
  --once)
    run_once
    ;;
  --daemon)
    run_daemon
    ;;
  *)
    echo "Usage: $0 [--daemon|--once]" >&2
    exit 1
    ;;
esac
