#!/usr/bin/env bash
# Auto-Save Watchdog - Local Repo Only
# Saves changes every 60 seconds with clean commits

set -euo pipefail

INTERVAL=60
LOCK_FILE="tmp/auto_save_local.lock"
LOG_FILE="logs/auto_save_local.log"

mkdir -p "$(dirname "$LOCK_FILE")" "$(dirname "$LOG_FILE")"

# Stale lock detection and cleanup (handles SIGKILL orphans)
check_stale_lock() {
  local lock_file=$1
  local max_age_seconds=$((INTERVAL * 2))  # 2x interval = stale

  if [[ ! -f "$lock_file" ]]; then
    return 0  # No lock file = not stale
  fi

  # Check if lock file has a PID
  local lock_pid=$(cat "$lock_file" 2>/dev/null)
  if [[ -z "$lock_pid" ]]; then
    echo "WARNING: Lock file $lock_file has no PID, removing stale lock"
    rm -f "$lock_file"
    return 0
  fi

  # Check if process is still running
  if ! ps -p "$lock_pid" > /dev/null 2>&1; then
    echo "WARNING: Lock PID $lock_pid is dead, removing stale lock: $lock_file"
    rm -f "$lock_file"
    return 0
  fi

  # Check lock file age
  if [[ $(uname) == "Darwin" ]]; then
    # macOS stat
    local lock_age=$(( $(date +%s) - $(stat -f %m "$lock_file" 2>/dev/null || echo 0) ))
  else
    # Linux stat
    local lock_age=$(( $(date +%s) - $(stat -c %Y "$lock_file" 2>/dev/null || echo 0) ))
  fi

  if [[ $lock_age -gt $max_age_seconds ]]; then
    echo "WARNING: Lock file $lock_file is stale (${lock_age}s old, PID $lock_pid still running but unresponsive)"
    # Don't auto-remove if process is running - might be legitimately slow
    return 1
  fi

  return 0
}

# Clean stale locks before attempting lock acquisition
check_stale_lock "$LOCK_FILE"

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
# Capture exit code at trap invocation, not inside handler
cleanup() {
  local exit_code=${1:-0}
  rm -f "$LOCK_FILE"
  exit $exit_code
}
trap 'cleanup $?' EXIT
trap 'cleanup 130' INT
trap 'cleanup 143' TERM
trap 'cleanup 131' QUIT  # Ctrl+\ or kill -QUIT
trap 'cleanup 129' HUP   # Terminal hangup (SSH disconnects)

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
    git add START.sh package*.json scripts/watchdogs/ scripts/boot/ scripts/guards/ 2>/dev/null || true

    # CRITICAL: git add -u re-stages previously tracked files in config/
    # Explicitly unstage config/ to prevent credential leaks
    git reset config/ 2>/dev/null || true

    # Create clean commit
    CHANGES=$(git diff --cached --name-only | wc -l | tr -d ' ')

    if [[ $CHANGES -gt 0 ]]; then
      if git commit -m "auto-save: $CHANGES files updated at $TIMESTAMP"; then
        log "Saved $CHANGES files locally"
      else
        log "ERROR: Commit failed (check git identity, permissions, or repo health)"
        git reset --quiet 2>/dev/null || true  # Unstage on failure
      fi
    fi
  fi

  sleep "$INTERVAL"
done
