#!/usr/bin/env bash
set -euo pipefail

# LivHana Tier‑1 Unified Voice Router Deployment

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

VOICE_PORT="${PORT-8080}"
STATS_URL="http://localhost:${VOICE_PORT}/api/voice/stats"

echo "[deploy] Repo root: $REPO_ROOT"
echo "[deploy] Verifying prerequisites..."
"$REPO_ROOT/scripts/voice/verify_services.sh"

if [[ ! -f backend/voice-service/src/routers/unified-voice-router.js ]]; then
  echo "[deploy] ❌ Missing unified router: backend/voice-service/src/routers/unified-voice-router.js" >&2
  exit 1
fi

if command -v docker-compose >/dev/null 2>&1; then
  echo "[deploy] Using Docker Compose to (re)build and start voice-service"
  docker-compose -f docker-compose.yml build voice-service
  docker-compose -f docker-compose.yml up -d voice-service
else
  echo "[deploy] Docker Compose not found; falling back to direct Node process"
  # best-effort stop running process on :8080
  if command -v lsof >/dev/null 2>&1 && lsof -i ":$VOICE_PORT" | grep -q LISTEN; then
    echo "[deploy] ⚠️ Port $VOICE_PORT in use; attempting to stop existing node process"
    pids=$(lsof -ti tcp:"$VOICE_PORT" || true)
    if [[ -n "${pids}" ]]; then
      kill ${pids} || true
      sleep 1
    fi
  fi
  echo "[deploy] Starting backend/voice-service via npm (background)"
  nohup npm --prefix backend/voice-service run start >/tmp/voice-service.out 2>&1 &
  echo $! > /tmp/voice-service.pid
fi

echo "[deploy] Waiting for voice-service health at: $STATS_URL"
attempts=0
until curl -fsS "$STATS_URL" >/dev/null 2>&1; do
  attempts=$((attempts+1))
  if [[ $attempts -gt 30 ]]; then
    echo "[deploy] ❌ voice-service did not become healthy in time" >&2
    exit 1
  fi
  sleep 1
done
echo "[deploy] ✅ voice-service is responding"

echo "[deploy] Stats snapshot:"
curl -fsS "$STATS_URL" | jq . 2>/dev/null || curl -fsS "$STATS_URL" || true

echo "[deploy] Git status summary:"
git status -s || true

echo "[deploy] ✅ Unified router deployed"
#!/usr/bin/env bash
# Deploy unified voice router with zero-downtime
# Creates archive of old routers, restarts voice-service

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ROUTER_DIR="$REPO_ROOT/backend/voice-service/src/routers"
ARCHIVE_DIR="$ROUTER_DIR/archive"

echo -e "${BLUE}🚀 Unified Voice Router Deployment${NC}"
echo "=================================================="

# 1. Verify services
echo ""
echo "Phase 1: Pre-flight checks..."
if ! "$SCRIPT_DIR/verify_services.sh"; then
    echo -e "${RED}❌ Service verification failed - aborting deployment${NC}"
    exit 1
fi

# 2. Check unified router exists
echo ""
echo "Phase 2: Verifying unified router..."
if [[ ! -f "$ROUTER_DIR/unified-voice-router.js" ]]; then
    echo -e "${RED}❌ unified-voice-router.js not found at $ROUTER_DIR${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Unified router found${NC}"

# 3. Create archive if not exists
if [[ ! -d "$ARCHIVE_DIR" ]]; then
    echo ""
    echo "Phase 3: Creating archive directory..."
    mkdir -p "$ARCHIVE_DIR"
    echo -e "${GREEN}✓ Archive directory created${NC}"
fi

# 4. Move old routers to archive (if still present and not already archived)
echo ""
echo "Phase 4: Archiving legacy routers..."
ARCHIVED=0
for router in custom-voice-router.js multimodel-voice-router.js openai-voice-router.js websocket-voice-handler.js; do
    if [[ -f "$ROUTER_DIR/$router" ]]; then
        mv "$ROUTER_DIR/$router" "$ARCHIVE_DIR/"
        echo -e "${GREEN}  ✓ Archived $router${NC}"
        ARCHIVED=$((ARCHIVED + 1))
    fi
done

if [[ $ARCHIVED -eq 0 ]]; then
    echo -e "${YELLOW}  ⚠ No legacy routers found (already archived)${NC}"
else
    echo -e "${GREEN}  ✓ Archived $ARCHIVED legacy routers${NC}"
fi

# 5. Check if voice-service is running
echo ""
echo "Phase 5: Checking voice service..."
VOICE_PID=""
if pgrep -f "voice-service.*index.js" > /dev/null; then
    VOICE_PID=$(pgrep -f "voice-service.*index.js" | head -1)
    echo -e "${YELLOW}⚠ Voice service running (PID: $VOICE_PID)${NC}"
else
    echo -e "${YELLOW}⚠ Voice service not running${NC}"
fi

# 6. Restart voice service
echo ""
echo "Phase 6: Restarting voice service..."
if [[ -n "$VOICE_PID" ]]; then
    echo "  Stopping current service (PID: $VOICE_PID)..."
    kill "$VOICE_PID" 2>/dev/null || true
    sleep 2
fi

cd "$REPO_ROOT/backend/voice-service"
echo "  Starting unified router..."

# Start in background and capture PID
nohup node src/index.js > "$REPO_ROOT/logs/voice-service.log" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$REPO_ROOT/backend/voice-service/voice-service.pid"

echo -e "${GREEN}  ✓ Voice service started (PID: $NEW_PID)${NC}"

# 7. Wait for service to be ready
echo ""
echo "Phase 7: Waiting for service to be ready..."
for i in {1..10}; do
    sleep 1
    if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Service is ready!${NC}"
        break
    fi
    echo -n "."
    if [[ $i -eq 10 ]]; then
        echo ""
        echo -e "${RED}  ✗ Service did not start within 10 seconds${NC}"
        echo "  Check logs: tail -f $REPO_ROOT/logs/voice-service.log"
        exit 1
    fi
done

# 8. Verify stats endpoint
echo ""
echo "Phase 8: Verifying stats endpoint..."
STATS=$(curl -s http://localhost:8080/api/voice/stats)
if echo "$STATS" | jq -e '.health' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Stats endpoint responding${NC}"
    echo ""
    echo "Health status:"
    echo "$STATS" | jq '.health'
else
    echo -e "${RED}✗ Stats endpoint not responding correctly${NC}"
    exit 1
fi

# Success
echo ""
echo "=================================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
echo ""
echo "Next steps:"
echo "  1. Test REST endpoint:     curl http://localhost:8080/api/voice/stats | jq"
echo "  2. Test WebSocket:         wscat -c ws://localhost:8080/api/voice/ws"
echo "  3. Run E2E tests:          npm test tests/voice/unified-voice-e2e.test.js"
echo "  4. Monitor logs:           tail -f logs/voice-service.log"
echo ""
echo "Rollback: ./scripts/voice/rollback_unified_router.sh"
echo "=================================================="

