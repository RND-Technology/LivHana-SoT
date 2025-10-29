#!/usr/bin/env bash
# scripts/post-boot-validation.sh
# Confirms Tier-1 services and monitors are healthy after boot.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SERVICES=(
  "integration-service|http://localhost:3005/health"
  "whisper-stt|http://localhost:2022/health"
  "kokoro-tts|http://localhost:8880/health"
)

TMUX_SESSIONS=(
  "crash-monitor"
  "voice-visualizer"
)

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

check_service() {
  local name url http_code
  IFS='|' read -r name url <<< "$1"
  if ! command -v curl >/dev/null 2>&1; then
    log "⚠️  curl missing; cannot verify $name"
    return 1
  fi
  http_code=$(curl -m 5 -sS -o /dev/null -w "%{http_code}" "$url" || echo "000")
  if [[ "$http_code" == "200" ]]; then
    log "✅ $name healthy ($url)"
    return 0
  fi
  log "❌ $name unhealthy (HTTP $http_code) - $url"
  return 1
}

check_tmux() {
  local session="$1"
  if ! command -v tmux >/dev/null 2>&1; then
    log "⚠️  tmux not installed; skipping session check for $session"
    return 0
  fi
  if tmux has-session -t "$session" 2>/dev/null; then
    log "✅ tmux session active: $session"
    return 0
  fi
  log "⚠️  tmux session missing: $session"
  return 1
}

main() {
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "🔎 Post-boot validation"
  local failures=0

  for svc in "${SERVICES[@]}"; do
    check_service "$svc" || ((failures++))
  done

  for session in "${TMUX_SESSIONS[@]}"; do
    check_tmux "$session" || true
  done

  if (( failures > 0 )); then
    log "❌ Post-boot validation FAILED ($failures service issue(s))"
    exit 1
  fi

  log "✅ All critical services healthy"
}

main "$@"
