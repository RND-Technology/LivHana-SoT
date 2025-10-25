#!/usr/bin/env bash
# 🎙️ Voice Services Watchdog - Self-Healing with Exponential Backoff
# Tier-1 Production Pattern: Ensures STT/TTS stay UP 24/7
# Community Best Practice: Health checks + automated restart with backoff

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/../logs"
mkdir -p "$LOG_DIR"

STT_PORT=2022
TTS_PORT=8880
LOG_FILE="$LOG_DIR/voice_watchdog.$(date +%Y%m%d).log"
FAILURE_COUNT=0
MAX_FAILURES=5
BACKOFF_BASE=30  # seconds

log() {
  printf '[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$1" | tee -a "$LOG_FILE"
}

check_service() {
  local service=$1
  local port=$2
  
  if curl -sf "http://localhost:$port/health" >/dev/null 2>&1; then
    return 0
  else
    log "FAIL: $service (port $port) health check failed"
    return 1
  fi
}

restart_service() {
  local service=$1
  log "RESTART: Attempting to restart $service..."
  
  case $service in
    whisper)
      if command -v voicemode >/dev/null 2>&1; then
        voicemode whisper start || log "ERROR: Failed to start whisper"
      else
        log "ERROR: voicemode CLI not found"
      fi
      ;;
    kokoro)
      if command -v voicemode >/dev/null 2>&1; then
        voicemode kokoro start || log "ERROR: Failed to start kokoro"
      else
        log "ERROR: voicemode CLI not found"
      fi
      ;;
    *)
      log "ERROR: Unknown service $service"
      return 1
      ;;
  esac
  
  # Wait for service to start
  sleep 5
  
  if check_service "$service" "$(port_for_service $service)"; then
    log "SUCCESS: $service restarted and healthy"
    FAILURE_COUNT=0
    return 0
  else
    log "FAIL: $service restart unsuccessful"
    return 1
  fi
}

port_for_service() {
  case $1 in
    whisper) echo $STT_PORT ;;
    kokoro) echo $TTS_PORT ;;
    *) echo 0 ;;
  esac
}

check_and_heal() {
  local total_failures=0
  
  # Check STT
  if ! check_service "whisper" "$STT_PORT"; then
    total_failures=$((total_failures + 1))
    if ! restart_service "whisper"; then
      FAILURE_COUNT=$((FAILURE_COUNT + 1))
    fi
  fi
  
  # Check TTS
  if ! check_service "kokoro" "$TTS_PORT"; then
    total_failures=$((total_failures + 1))
    if ! restart_service "kokoro"; then
      FAILURE_COUNT=$((FAILURE_COUNT + 1))
    fi
  fi
  
  # Exponential backoff if failures exceed threshold
  if [ $FAILURE_COUNT -ge $MAX_FAILURES ]; then
    local backoff=$((BACKOFF_BASE * 2 ** FAILURE_COUNT))
    log "ALERT: Max failures reached. Backing off for ${backoff}s"
    sleep $backoff
  fi
  
  return $total_failures
}

main() {
  log "Starting voice services watchdog..."
  
  while true; do
    check_and_heal || true
    sleep 30  # Check every 30s
  done
}

main "$@"

