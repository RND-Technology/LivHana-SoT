#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

echo "🔍 Validating Liv Hana Monorepo setup..."

# Load environment variables
if [ -f .env ]; then
    # shellcheck disable=SC2046
    export $(cat .env | xargs)
else
    echo "❌ .env file not found. Please copy .env.example to .env and fill in your keys."
    exit 1
fi

# Check for API keys
if [ -z "$GITHUB_TOKEN" ]; then echo "❌ GITHUB_TOKEN not set in .env"; else echo "✅ GITHUB_TOKEN found"; fi
if [ -z "$OPENAI_API_KEY" ]; then echo "❌ OPENAI_API_KEY not set in .env"; else echo "✅ OPENAI_API_KEY found"; fi

# Check for core directories
[ -d "packages/liv-hana-sot" ] && echo "✅ Core package directory found" || echo "❌ Core package directory missing"
[ -d ".github/workflows" ] && echo "✅ Workflows directory found" || echo "❌ Workflows directory missing"

echo "🎯 Validation complete."
# Last updated: 2025-10-02

# Last optimized: 2025-10-02
