#!/usr/bin/env bash
# scripts/master-verification.sh
# Runs full verification suite (VS Code + services).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

STEPS=(
  "VS Code quarantine|$ROOT/scripts/verify-quarantine-removal.sh"
  "VS Code path|$ROOT/scripts/verify-clean-paths.sh"
  "Service health|$ROOT/scripts/verify-service-health.sh"
)

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

status=0
for step in "${STEPS[@]}"; do
  IFS='|' read -r label script <<< "$step"
  if [[ ! -x "$script" ]]; then
    log "❌ Missing executable: $script"
    status=1
    continue
  fi
  log "▶️  Running: $label"
  if bash "$script"; then
    log "✅ $label passed"
  else
    log "❌ $label failed"
    status=1
  fi
done

if (( status == 0 )); then
  log "🎉 Master verification suite PASSED"
else
  log "❗ Master verification suite completed with failures"
fi

exit "$status"
