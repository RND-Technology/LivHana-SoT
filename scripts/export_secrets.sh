#!/usr/bin/env bash
# Export secrets from .env to environment
# Source this file: source scripts/export_secrets.sh

set -a
source "$(git rev-parse --show-toplevel)/.env"
set +a

echo "✓ Secrets exported to environment"
echo ""
echo "Verifying critical secrets:"
for key in DEEPSEEK_API_KEY JWT_SECRET1 JWT_SECRET_REASONING JWT_SECRET_VOICE; do
  if [[ -n "${!key}" ]]; then
    echo "  ✓ $key"
  else
    echo "  ✗ $key MISSING"
  fi
done
