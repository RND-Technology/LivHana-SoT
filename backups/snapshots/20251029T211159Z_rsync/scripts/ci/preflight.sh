#!/usr/bin/env bash
# CI Preflight Checks - Hard-locked validation before any operations
# Ensures all critical dependencies are met before proceeding

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

OP_ACCOUNT_SLUG="${OP_ACCOUNT_SLUG:-reggiedro.1password.com}"
ENV_FILE="$ROOT/backend/integration-service/.env.op"

echo "🔍 TIER-1 CI PREFLIGHT CHECKS"
echo "=============================="
echo ""

# Check 1: 1Password authentication
echo "✓ Checking 1Password authentication..."
if ! op whoami >/dev/null 2>&1; then
  echo "❌ FAIL: 1Password not authenticated"
  echo "   Run: op signin --account $OP_ACCOUNT_SLUG"
  exit 1
fi
ACCOUNT=$(op whoami 2>/dev/null | grep Email | cut -d: -f2 | xargs)
echo "✅ 1Password authenticated: $ACCOUNT"
echo ""

# Check 2: Environment file exists
echo "✓ Checking environment file..."
if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ FAIL: Environment file not found: $ENV_FILE"
  exit 1
fi
echo "✅ Environment file found: $ENV_FILE"
echo ""

# Check 3: Secrets accessible
echo "✓ Checking secret accessibility..."
if ! op run --account "$OP_ACCOUNT_SLUG" --env-file "$ENV_FILE" -- \
  sh -c 'test -n "${DATABASE_URL:-}" && test -n "${JWT_SECRET:-}" && test -n "${LIGHTSPEED_TOKEN:-}"' >/dev/null 2>&1; then
  echo "❌ FAIL: Required secrets not accessible"
  echo "   Check vault permissions for: DATABASE_URL, JWT_SECRET, LIGHTSPEED_TOKEN"
  exit 1
fi
echo "✅ All required secrets accessible"
echo ""

# Check 4: Integration service health
echo "✓ Checking integration service health..."
if ! curl -sf http://localhost:3005/health >/dev/null 2>&1; then
  echo "⚠️  WARN: Integration service not responding on port 3005"
  echo "   Service may not be running - this is acceptable for CI"
else
  echo "✅ Integration service responding"
fi
echo ""

# Check 5: Secret scrubbing (if logs exist)
echo "✓ Checking log scrubbing..."
if [[ -f "$ROOT/logs/integration-service.log" ]]; then
  if grep -Ei "(key=|token=|authorization:|Bearer )" -n "$ROOT/logs/integration-service.log | grep -v 'concealed by 1Password'" >/dev/null 2>&1; then
    echo "❌ FAIL: Raw secrets found in logs"
    echo "   Secret scrubbing is not working correctly"
    exit 1
  fi
  echo "✅ No raw secrets in logs"
else
  echo "⚠️  No log file found (service may not have started yet)"
fi
echo ""

echo "=============================="
echo "✅ PREFLIGHT CHECKS PASSED"
echo "=============================="
echo ""
echo "All critical dependencies validated."
echo "Proceeding with CI operations..."

exit 0

