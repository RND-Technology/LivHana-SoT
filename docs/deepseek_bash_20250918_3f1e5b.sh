#!/bin/bash
# Security hardening pre-commit and pre-deploy
set -e

echo "🔒 Running security audit..."

# Find and alert on any potential secret in code, excluding .env and known binaries
if grep -rni --exclude-dir=node_modules --exclude-dir=__pycache__ --exclude=.env --exclude=*.min.js "password\|token\|key\|secret" .; then
    echo "❌ WARNING: Potential secrets found in code. Aborting."
    exit 1
fi

# Ensure .env is in .gitignore
if ! grep -q "\.env" .gitignore; then
    echo ".env" >> .gitignore
    echo "✅ Added .env to .gitignore"
fi

# Set strict permissions on .env
chmod 600 .env 2>/dev/null || true

echo "✅ Security audit passed."