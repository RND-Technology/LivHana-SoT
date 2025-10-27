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

set -e

MODE="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting LivHana Empire - Mode: $MODE"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required"; exit 1; }
command -v redis-cli >/dev/null 2>&1 || { echo "❌ Redis CLI required"; exit 1; }

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

# Keep the session running interactively
exec "$SHELL"
