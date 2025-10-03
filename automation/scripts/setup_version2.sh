#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

echo "🚀 Setting up the Liv Hana Monorepo environment..."

# Load environment variables if .env file exists
if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091,SC1094
    source .env
    set +a
fi

# Install dependencies for the core application
if [ -f "packages/liv-hana-sot/requirements.txt" ]; then
    pip install -r packages/liv-hana-sot/requirements.txt
fi

if [ -f "packages/liv-hana-sot/package.json" ]; then
    npm install --prefix packages/liv-hana-sot
fi

echo "✅ Environment setup complete. Run 'bash scripts/validate.sh' to verify."
# Last updated: 2025-10-02

# Last optimized: 2025-10-02
