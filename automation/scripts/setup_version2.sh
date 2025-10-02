#!/bin/bash
echo "🚀 Setting up the Liv Hana Monorepo environment..."

# Load environment variables if .env file exists
if [ -f .env ]; then
    export $(cat .env | xargs)
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
