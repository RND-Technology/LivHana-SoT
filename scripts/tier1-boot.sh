#!/usr/bin/env bash
# scripts/tier1-boot.sh
# Orchestrates the Tier-1 boot sequence with pre/post validation.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

run_step() {
  local description="$1"
  shift
  log "▶️  $description"
  "$@"
  log "✅ $description complete"
}

main() {
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "🚀 Tier-1 boot sequence starting"

  run_step "Pre-boot health check" "$ROOT/scripts/pre-boot-health-check.sh"
  run_step "Clearing stale artifacts" "$ROOT/scripts/clear-artifacts.sh"
  run_step "Resolving port conflicts" "$ROOT/scripts/kill-port-conflicts.sh"

  if [[ -x "$ROOT/scripts/start_tier1_services.sh" ]]; then
    run_step "Starting Tier-1 services" "$ROOT/scripts/start_tier1_services.sh"
  else
    log "⚠️  Missing start_tier1_services.sh - skipping service launch"
  fi

  if [[ -x "$ROOT/scripts/start-crash-monitor.sh" ]]; then
    "$ROOT/scripts/start-crash-monitor.sh" || true
  fi
  if [[ -x "$ROOT/scripts/start-voice-visualizer.sh" ]]; then
    "$ROOT/scripts/start-voice-visualizer.sh" || true
  fi
  if [[ -x "$ROOT/scripts/voice-health-monitor.sh" ]]; then
    tmux has-session -t voice-health >/dev/null 2>&1 || \
      tmux new-session -d -s voice-health "cd \"$ROOT\" && bash scripts/voice-health-monitor.sh --daemon"
  fi

  run_step "Post-boot validation" "$ROOT/scripts/post-boot-validation.sh"

  log "🎉 Tier-1 boot sequence completed successfully"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

main "$@"
