#!/usr/bin/env bash
# Secret Preflight - Validate secrets accessible before boot
# Fixes: Prevent integration-service startup with missing secrets

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

OP_ACCOUNT_SLUG="${OP_ACCOUNT_SLUG:-reggiedro.1password.com}"
ENV_FILE="$ROOT/backend/integration-service/.env.op"

validate_secrets() {
  local missing=0
  
  # Check 1Password session
  if ! op whoami >/dev/null 2>&1; then
    echo "ERROR: 1Password not authenticated"
    echo "Run: op signin --account $OP_ACCOUNT_SLUG"
    return 1
  fi
  
  # Validate each required secret via op run
  local secrets=("DATABASE_URL" "JWT_SECRET" "LIGHTSPEED_TOKEN")
  
  for secret in "${secrets[@]}"; do
    if ! op run --account "$OP_ACCOUNT_SLUG" --env-file "$ENV_FILE" -- \
      sh -c "test -n \"\${${secret}:-}\"" >/dev/null 2>&1; then
      echo "ERROR: Secret $secret not accessible"
      missing=$((missing + 1))
    fi
  done
  
  if [[ $missing -gt 0 ]]; then
    echo "FAIL: $missing secrets missing"
    return 1
  fi
  
  echo "PASS: All secrets accessible"
  return 0
}

if [[ "${BASH_SOURCE[0]:-$0}" == "$0" ]]; then
  validate_secrets "$@"
fi

