#!/usr/bin/env bash
# scripts/verify-service-health.sh
# Aggregates health checks across Tier-1 services.

set -euo pipefail

SERVICES=(
  "integration-service|http://localhost:3005/health"
  "whisper-stt|http://localhost:2022/health"
  "kokoro-tts|http://localhost:8880/health"
)

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

if ! command -v curl >/dev/null 2>&1; then
  log "❌ curl required for service verification"
  exit 1
fi

status=0
for entry in "${SERVICES[@]}"; do
  IFS='|' read -r name url <<< "$entry"
  http_code=$(curl -m 5 -sS -o /dev/null -w "%{http_code}" "$url" || echo "000")
  if [[ "$http_code" == 200 ]]; then
    log "✅ $name healthy ($url)"
  else
    log "❌ $name unhealthy (HTTP $http_code) ($url)"
    status=1
  fi
done

exit "$status"
