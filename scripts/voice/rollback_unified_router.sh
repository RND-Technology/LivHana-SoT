#!/usr/bin/env bash
set -euo pipefail

# LivHana Tier‑1 Unified Voice Router Rollback

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

restore_file_from_git() {
  local path="$1"
  if [[ -f "$path" ]]; then
    echo "[rollback] Keeping existing $path"
    return 0
  fi
  local commit
  if commit=$(git rev-list -n 1 HEAD -- "$path" 2>/dev/null); then
    if [[ -n "$commit" ]]; then
      echo "[rollback] Restoring $path from $commit"
      git checkout "$commit" -- "$path"
      return 0
    fi
  fi
  echo "[rollback] ⚠️ No history to restore for $path" >&2
  return 1
}

echo "[rollback] Restoring legacy routers from git history (if available)"
restore_file_from_git backend/voice-service/src/routers/custom-voice-router.js || true
restore_file_from_git backend/voice-service/src/routers/multimodel-voice-router.js || true
restore_file_from_git backend/voice-service/src/routers/openai-voice-router.js || true
restore_file_from_git backend/voice-service/src/routers/websocket-voice-handler.js || true

echo "[rollback] Rebuilding/restarting voice-service"
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose -f docker-compose.yml build voice-service
  docker-compose -f docker-compose.yml up -d voice-service
else
  echo "[rollback] Docker Compose not found; restarting node process"
  pids=$(lsof -ti tcp:"${PORT-8080}" || true)
  if [[ -n "${pids}" ]]; then kill ${pids} || true; fi
  nohup npm --prefix backend/voice-service run start >/tmp/voice-service.out 2>&1 &
  echo $! > /tmp/voice-service.pid
fi

echo "[rollback] Git status summary:"
git status -s || true

echo "[rollback] ✅ Rollback procedure executed"
#!/usr/bin/env bash
# Rollback unified router deployment - restore legacy routers

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ROUTER_DIR="$REPO_ROOT/backend/voice-service/src/routers"
ARCHIVE_DIR="$ROUTER_DIR/archive"

echo -e "${YELLOW}🔄 Rolling back unified voice router...${NC}"

if [[ ! -d "$ARCHIVE_DIR" ]]; then
    echo -e "${RED}❌ No archive directory found - nothing to rollback${NC}"
    exit 1
fi

# Stop voice service
echo "Stopping voice service..."
pkill -f "voice-service.*index.js" || true
sleep 2

# Restore archived routers
echo "Restoring legacy routers..."
RESTORED=0
for router in custom-voice-router.js multimodel-voice-router.js openai-voice-router.js websocket-voice-handler.js; do
    if [[ -f "$ARCHIVE_DIR/$router" ]]; then
        mv "$ARCHIVE_DIR/$router" "$ROUTER_DIR/"
        echo -e "${GREEN}  ✓ Restored $router${NC}"
        RESTORED=$((RESTORED + 1))
    fi
done

if [[ $RESTORED -eq 0 ]]; then
    echo -e "${RED}❌ No archived routers found${NC}"
    exit 1
fi

# Archive unified router
if [[ -f "$ROUTER_DIR/unified-voice-router.js" ]]; then
    mv "$ROUTER_DIR/unified-voice-router.js" "$ARCHIVE_DIR/"
    echo -e "${GREEN}  ✓ Archived unified-voice-router.js${NC}"
fi

# Update index.js to remove unified router import
echo "Restoring index.js imports..."
cd "$ROUTER_DIR/.."
git checkout src/index.js || echo -e "${YELLOW}⚠ Could not restore index.js via git${NC}"

echo ""
echo -e "${GREEN}✅ Rollback complete${NC}"
echo "Restart voice service manually to use legacy routers"

