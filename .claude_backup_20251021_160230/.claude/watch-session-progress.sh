#!/usr/bin/env bash
set -euo pipefail
LOG_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/SESSION_PROGRESS.md"
THRESHOLD_SECONDS=${1:-300}
INTERVAL=${2:-60}

if [[ ! -f "$LOG_FILE" ]]; then
  echo "[watch-session-progress] ERROR: session log not found at $LOG_FILE" >&2
  exit 1
fi

echo "[watch-session-progress] Monitoring $LOG_FILE (threshold ${THRESHOLD_SECONDS}s, check every ${INTERVAL}s)"

while true; do
  now=$(date +%s)
  modified=$(stat -f %m "$LOG_FILE")
  delta=$(( now - modified ))

  if (( delta > THRESHOLD_SECONDS )); then
    human=$(date -r "$modified" '+%Y-%m-%d %H:%M:%S %Z')
    echo "[watch-session-progress][ALERT] Log stale: last update $delta s ago (modified $human)." >&2
  fi

  sleep "$INTERVAL"
done
