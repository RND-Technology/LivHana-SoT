#!/usr/bin/env bash
# Auto-Save Watchdog - Local Repo Only
# Saves changes every 60 seconds with clean commits

set -euo pipefail

INTERVAL=60
LOCK_FILE="tmp/auto_save_local.lock"
LOG_FILE="logs/auto_save_local.log"

mkdir -p "$(dirname "$LOCK_FILE")" "$(dirname "$LOG_FILE")"

# Single instance check
if [[ -f "$LOCK_FILE" ]]; then
  OLD_PID=$(cat "$LOCK_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Auto-save already running (PID: $OLD_PID)"
    exit 0
  fi
fi

echo $$ > "$LOCK_FILE"

# Cleanup on exit - preserve actual exit code
cleanup() {
  local exit_code=$?
  rm -f "$LOCK_FILE"
  exit $exit_code
}
trap cleanup INT TERM EXIT

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"
}

log "Auto-save started (interval: ${INTERVAL}s)"

while true; do
  # Check for changes
  if [[ -n $(git status --porcelain) ]]; then
    TIMESTAMP=$(date +%Y-%m-%d_%H:%M:%S)

    # Stage only tracked files + new critical files (EXCLUDE config/ to prevent credential leaks)
    git add -u  # Update tracked files
    git add START.sh package*.json scripts/watchdogs/ scripts/boot/ scripts/guards/ 2>/dev/null || true  # Critical new files

    # Create clean commit
    CHANGES=$(git diff --cached --name-only | wc -l | tr -d ' ')
    
    if [[ $CHANGES -gt 0 ]]; then
      git commit -m "auto-save: $CHANGES files updated at $TIMESTAMP" || true
      log "Saved $CHANGES files locally"
    fi
  fi

  sleep "$INTERVAL"
done
