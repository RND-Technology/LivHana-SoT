#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

# ============================================
# LIVHANA EMPIRE - ONE COMMAND STARTUP
# ============================================
# Usage: ./START.sh [mode]
# Modes: dev (default), full, voice, test
# ============================================

MODE="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting LivHana Empire - Mode: $MODE"

# Run Tier-1 boot first (handles preflight, agents, voice orchestrator)
echo "🎼 Running Tier-1 boot sequence..."
if [ -f "$SCRIPT_DIR/scripts/claude_tier1_boot.sh" ]; then
  bash "$SCRIPT_DIR/scripts/claude_tier1_boot.sh"
else
  echo "⚠️  Tier-1 boot script not found, proceeding with basic preflight..."
fi

# Preflight checks (legacy - most now handled by tier1 boot)
echo "🔍 Running preflight checks..."

# Check Claude CLI
if ! command -v claude >/dev/null 2>&1; then
  echo "❌ Claude CLI not found. Install via: brew install claude"
  exit 1
fi

# Check Homebrew path
if [[ ":$PATH:" != *":/opt/homebrew/bin:"* ]]; then
  echo "⚠️  Homebrew path not in PATH. Add to ~/.zshrc:"
  echo "   export PATH=\"/opt/homebrew/bin:\$PATH\""
fi

# Load nvm if available and use Node 20
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 20 >/dev/null 2>&1 || nvm install 20
fi

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null || echo "not installed")
if [[ "$NODE_VERSION" == "not installed" ]]; then
  echo "❌ Node.js not found. Install via: nvm install 20"
  exit 1
fi

# Extract major version (e.g., v20.1.0 -> 20)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')

# STRICT: Require Node 20.x for Tier-1
if [[ "$NODE_VERSION" =~ v20 ]]; then
  echo "✅ Node 20.x detected ($NODE_VERSION)"
else
  echo "❌ Node 20.x REQUIRED for Tier-1. Current: $NODE_VERSION"
  echo "   Install via: nvm install 20 && nvm use 20"
  exit 1
fi

# Check Redis
if ! command -v redis-cli >/dev/null 2>&1; then
  echo "❌ Redis CLI required. Install via: brew install redis"
  exit 1
fi

# Check Redis connectivity
if ! redis-cli ping >/dev/null 2>&1; then
  echo "⚠️  Redis not running. Starting Redis..."
  redis-server --daemonize yes
fi

# Check JWT secret
if [ -z "${JWT_SECRET:-}" ]; then
  echo "⚠️  JWT_SECRET not set. Loading from 1Password..."
  export JWT_SECRET=$(op run --env-file=.env op item get jwt-secret --fields password 2>/dev/null || echo "")
fi

echo "✅ Preflight checks passed"

# Start Redis if not running
if ! redis-cli ping >/dev/null 2>&1; then
    echo "🔄 Starting Redis..."
    redis-server --daemonize yes
fi

# Start services based on mode
case $MODE in
    dev)
        echo "🔧 DEV MODE: Core services only"
        cd "$SCRIPT_DIR/backend/integration-service" && npm start &
        cd "$SCRIPT_DIR/backend/reasoning-gateway" && npm start &
        cd "$SCRIPT_DIR/frontend/vibe-cockpit" && npm run dev &
        ;;
    voice)
        echo "🎙️ VOICE MODE: Full AI stack"
        cd "$SCRIPT_DIR/backend/integration-service" && npm start &
        cd "$SCRIPT_DIR/backend/reasoning-gateway" && npm start &
        cd "$SCRIPT_DIR/backend/voice-service" && npm start &
        cd "$SCRIPT_DIR/frontend/vibe-cockpit" && npm run dev &
        ;;
    full)
        echo "🔥 FULL MODE: All services"
        docker-compose up -d
        ;;
    test)
        echo "🧪 TEST MODE: Run all tests"
        npm test --workspaces
        exit 0
        ;;
    *)
        echo "❌ Unknown mode: $MODE"
        exit 1
        ;;
esac

echo "
✅ LivHana Empire Started!

🌐 Services:
- Vibe Cockpit: http://localhost:5173
- API Gateway:  http://localhost:3005/health
- Reasoning AI: http://localhost:4002/health
- Voice Mode:   http://localhost:4001/health

📊 Quick Health Check:
curl http://localhost:3005/health
curl http://localhost:4002/health

🛑 To stop: pkill -f 'node.*livhana' or docker-compose down
"

# Wait for services
sleep 5
curl -sf http://localhost:3005/health >/dev/null && echo "✅ Integration Service: UP" || echo "⚠️ Integration Service: Starting..."
curl -sf http://localhost:4002/health >/dev/null && echo "✅ Reasoning Gateway: UP" || echo "⚠️ Reasoning Gateway: Starting..."

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
