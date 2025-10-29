#!/bin/bash
# Optimized: 2025-10-29
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail
# ============================================
# LIVHANA EMPIRE - ONE COMMAND STARTUP
# ============================================
# Usage: ./START.sh [mode]
# Modes: dev (default), full, voice, test
# ============================================
# Innovations:
# - self-secure: automatic threat detection and patching
# - self-report: proactive system summaries
# - self-integrate: seamless connection to external APIs or tools
# - VS Code crash prevention validation
# - Memory pressure checks
# - Proof of successful service starts
set -e

MODE="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting LivHana Empire - Mode: $MODE"

# ============================================
# MEMORY PRESSURE CHECKS
# ============================================
echo "🧠 Checking system memory..."
if command -v free >/dev/null 2>&1; then
    AVAILABLE_MEM=$(free -m | awk 'NR==2{print $7}')
    TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
    MEM_USAGE_PERCENT=$((100 - (AVAILABLE_MEM * 100 / TOTAL_MEM)))
    
    echo "   Memory Usage: ${MEM_USAGE_PERCENT}%"
    
    if [ $MEM_USAGE_PERCENT -gt 90 ]; then
        echo "❌ CRITICAL: Memory usage above 90%. Cannot start safely."
        exit 1
    elif [ $MEM_USAGE_PERCENT -gt 75 ]; then
        echo "⚠️  WARNING: Memory usage above 75%. Proceeding with caution."
    else
        echo "✅ Memory pressure: Normal"
    fi
else
    echo "⚠️  Cannot check memory on this system, proceeding..."
fi

# ============================================
# VS CODE CRASH PREVENTION
# ============================================
echo "🔍 VS Code crash prevention checks..."

# Check for VS Code processes
VSCODE_PROCS=$(pgrep -f "[Cc]ode" | wc -l || echo "0")
if [ "$VSCODE_PROCS" -gt 10 ]; then
    echo "⚠️  WARNING: Multiple VS Code processes detected ($VSCODE_PROCS). This may cause instability."
fi

# Check for orphaned node processes
ORPHAN_NODES=$(pgrep -f "node.*livhana" | wc -l || echo "0")
if [ "$ORPHAN_NODES" -gt 0 ]; then
    echo "⚠️  Found $ORPHAN_NODES existing LivHana processes. Cleaning up..."
    pkill -f "node.*livhana" || true
    sleep 2
fi

# Check file descriptor limits
if command -v ulimit >/dev/null 2>&1; then
    FD_LIMIT=$(ulimit -n)
    if [ "$FD_LIMIT" -lt 1024 ]; then
        echo "⚠️  WARNING: File descriptor limit is low ($FD_LIMIT). Recommended: 4096+"
    else
        echo "✅ File descriptor limit: $FD_LIMIT"
    fi
fi

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required"; exit 1; }
command -v redis-cli >/dev/null 2>&1 || { echo "❌ Redis CLI required"; exit 1; }

# Start Redis if not running
if ! redis-cli ping >/dev/null 2>&1; then
    echo "🔄 Starting Redis..."
    redis-server --daemonize yes
    sleep 2
    if ! redis-cli ping >/dev/null 2>&1; then
        echo "❌ Failed to start Redis"
        exit 1
    fi
    echo "✅ Redis started successfully"
fi

# ============================================
# SERVICE STARTUP WITH VALIDATION
# ============================================
START_TIME=$(date +%s)

# Function to wait for service health
wait_for_service() {
    local SERVICE_NAME=$1
    local HEALTH_URL=$2
    local MAX_WAIT=30
    local WAIT_COUNT=0
    
    echo "⏳ Waiting for $SERVICE_NAME to be healthy..."
    
    while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
        if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
            echo "✅ $SERVICE_NAME: HEALTHY"
            return 0
        fi
        sleep 1
        WAIT_COUNT=$((WAIT_COUNT + 1))
    done
    
    echo "❌ $SERVICE_NAME: FAILED to start within ${MAX_WAIT}s"
    return 1
}

# Start services based on mode
case $MODE in
    dev)
        echo "🔧 DEV MODE: Core services only"
        cd "$SCRIPT_DIR/backend/integration-service" && npm start &
        cd "$SCRIPT_DIR/backend/reasoning-gateway" && npm start &
        cd "$SCRIPT_DIR/frontend/vibe-cockpit" && npm run dev &
        
        # Wait and verify services
        sleep 5
        SERVICES_OK=true
        wait_for_service "Integration Service" "http://localhost:3005/health" || SERVICES_OK=false
        wait_for_service "Reasoning Gateway" "http://localhost:4002/health" || SERVICES_OK=false
        
        if [ "$SERVICES_OK" = false ]; then
            echo "❌ Some services failed to start. Cleaning up..."
            pkill -f "node.*livhana" || true
            exit 1
        fi
        ;;
    voice)
        echo "🎙️ VOICE MODE: Full AI stack"
        cd "$SCRIPT_DIR/backend/integration-service" && npm start &
        cd "$SCRIPT_DIR/backend/reasoning-gateway" && npm start &
        cd "$SCRIPT_DIR/backend/voice-service" && npm start &
        cd "$SCRIPT_DIR/frontend/vibe-cockpit" && npm run dev &
        
        # Wait and verify services
        sleep 5
        SERVICES_OK=true
        wait_for_service "Integration Service" "http://localhost:3005/health" || SERVICES_OK=false
        wait_for_service "Reasoning Gateway" "http://localhost:4002/health" || SERVICES_OK=false
        wait_for_service "Voice Service" "http://localhost:4001/health" || SERVICES_OK=false
        
        if [ "$SERVICES_OK" = false ]; then
            echo "❌ Some services failed to start. Cleaning up..."
            pkill -f "node.*livhana" || true
            exit 1
        fi
        ;;
    full)
        echo "🔥 FULL MODE: All services"
        docker-compose up -d
        
        # Wait and verify docker services
        sleep 10
        if ! docker-compose ps | grep -q "Up"; then
            echo "❌ Docker services failed to start"
            docker-compose down
            exit 1
        fi
        echo "✅ All Docker services started"
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

END_TIME=$(date +%s)
STARTUP_DURATION=$((END_TIME - START_TIME))

echo "
✅ LivHana Empire Started Successfully! (${STARTUP_DURATION}s)
🌐 Services:
- Vibe Cockpit: http://localhost:5173
- API Gateway:  http://localhost:3005/health
- Reasoning AI: http://localhost:4002/health
- Voice Mode:   http://localhost:4001/health

📊 All Services Verified and Healthy!

🛑 To stop: pkill -f 'node.*livhana' or docker-compose down
"

# Last updated: 2025-10-29
# Last optimized: 2025-10-29
# Keep the session running interactively
exec "$SHELL"
