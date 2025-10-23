#!/usr/bin/env bash
# 1Password Secret Guard - Monitors secret availability
# Fixes: 1Password session timeout causing boot failures

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

export OP_ACCOUNT_SLUG="${OP_ACCOUNT_SLUG:-reggiedro.1password.com}"
ENV_FILE="$ROOT/backend/integration-service/.env.op"
CHECK_INTERVAL="${OP_WATCHDOG_INTERVAL_SEC:-900}"  # Default: 15 minutes

# Validate env file exists
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[$(date '+%Y-%m-%dT%H:%M:%S')] ERROR: Env file not found: $ENV_FILE" >&2
  exit 1
fi

# Main watchdog loop
while true; do
  timestamp=$(date '+%Y-%m-%dT%H:%M:%S')
  
  # Check 1Password session
  if ! op whoami >/dev/null 2>&1; then
    echo "[$timestamp] CRITICAL: 1Password session expired – run: op signin --account $OP_ACCOUNT_SLUG" >&2
    sleep "$CHECK_INTERVAL"
    continue
  fi
  
  # Check secret availability
  if op run --account "$OP_ACCOUNT_SLUG" --env-file "$ENV_FILE" -- \
     sh -c 'test -n "${DATABASE_URL:-}" && test -n "${JWT_SECRET:-}" && test -n "${LIGHTSPEED_TOKEN:-}"' >/dev/null 2>&1; then
    echo "[$timestamp] ✅ 1Password secrets accessible"
  else
    echo "[$timestamp] ⚠️  1Password secrets lookup FAILED – check vault permissions" >&2
  fi
  
  sleep "$CHECK_INTERVAL"
done

