#!/usr/bin/env bash
# Voice services self-heal watchdog
# Runs every 30s via LaunchAgent; probes /health; restarts on failure
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$HOME/Library/Logs/LivHana"
mkdir -p "$LOG_DIR"

jlog() {
  printf '{"timestamp":"%s","severity":"%s","service":"voice-watchdog","message":"%s","port":%s}\n' \
    "$(date -u +%FT%TZ)" "$1" "$2" "${3:-null}" >> "$LOG_DIR/voice-watch.out.log"
}

probe() {
  local port="$1"
  timeout 5 curl -sf "http://127.0.0.1:${port}/health" >/dev/null 2>&1
}

restart() {
  local label="$1"
  local port="$2"
  
  jlog WARN "Health check failed for ${label}" "$port"
  
  # Try kickstart (reload)
  if launchctl kickstart -k "gui/$UID/${label}" 2>/dev/null; then
    jlog INFO "Kickstarted ${label}" "$port"
    return 0
  fi
  
  # Fallback: load plist
  local plist="$HOME/Library/LaunchAgents/${label}.plist"
  if [[ -f "$plist" ]]; then
    launchctl unload "$plist" 2>/dev/null || true
    sleep 2
    launchctl load -w "$plist" 2>/dev/null || true
    jlog INFO "Reloaded ${label} from plist" "$port"
  else
    jlog ERROR "Plist not found for ${label}" "$port"
  fi
}

# Check STT (2022)
if ! probe 2022; then
  restart "com.livhana.voice.stt" 2022
  sleep 5
  if ! probe 2022; then
    jlog ERROR "STT still unhealthy after restart" 2022
  fi
fi

# Check TTS (8880)
if ! probe 8880; then
  restart "com.livhana.voice.tts" 8880
  sleep 5
  if ! probe 8880; then
    jlog ERROR "TTS still unhealthy after restart" 8880
  fi
fi

jlog INFO "Watchdog cycle complete" 0
