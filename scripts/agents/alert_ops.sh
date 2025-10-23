#!/usr/bin/env bash
# Notify Grasshopper Master CODEX about Ops events.

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <event> <message>" >&2
  exit 64
fi

EVENT="$1"
shift
MESSAGE="$*"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ALERT_LOG_DIR="$ROOT/logs/ops"
ALERT_LOG="$ALERT_LOG_DIR/alerts.log"

mkdir -p "$ALERT_LOG_DIR"

timestamp="$(date '+%Y-%m-%d %H:%M:%S %Z')"
printf "[$timestamp] 🔔 [%s] %s\n" "$EVENT" "$MESSAGE" | tee -a "$ALERT_LOG"
