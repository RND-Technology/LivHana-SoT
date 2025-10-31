#!/usr/bin/env bash
# scripts/verify-quarantine-removal.sh
# Confirms VS Code quarantine attribute removed.

set -euo pipefail

TARGET="/Applications/Visual Studio Code.app"

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

if [[ ! -d "$TARGET" ]]; then
  log "❌ VS Code not found at $TARGET"
  exit 1
fi

if xattr -p com.apple.quarantine "$TARGET" >/dev/null 2>&1; then
  log "❌ Quarantine attribute still present on VS Code"
  log "   Run: sudo xattr -rd com.apple.quarantine \"$TARGET\""
  exit 1
fi

log "✅ No quarantine attribute detected on VS Code"
