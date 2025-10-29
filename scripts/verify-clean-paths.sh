#!/usr/bin/env bash
# scripts/verify-clean-paths.sh
# Ensures no AppTranslocation VS Code processes remain.

set -euo pipefail

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

matches=$(pgrep -fl "AppTranslocation/.*/Visual Studio Code" 2>/dev/null || true)

if [[ -z "$matches" ]]; then
  log "✅ No AppTranslocation VS Code processes detected"
  exit 0
fi

log "❌ Detected VS Code running from AppTranslocation:"
printf '%s\n' "$matches"
log "💡 Quit VS Code, then relaunch from /Applications/Visual Studio Code.app"
exit 1
