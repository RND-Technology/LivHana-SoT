#!/bin/bash
# Housekeeping Queue - Tier-1 Validation & Status Tracking
# Ensures prototype scripts exist, tracks operations, summarizes git status

set -euo pipefail

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib_common.sh" 2>/dev/null || true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Workspace root
WORKSPACE_ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$WORKSPACE_ROOT"

echo "═══════════════════════════════════════════════════════════════"
echo "          Liv Hana Tier-1 Housekeeping Queue Check"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Validate critical prototype scripts exist
echo "📋 Validating Prototype Scripts..."
SCRIPTS_TO_CHECK=(
    "automation/scripts/check_service_health.sh"
    "automation/scripts/check_router_health.sh"
    "automation/scripts/check_memory_snapshot.sh"
    "infra/scripts/start_voice_mode_stack.sh"
    "infra/scripts/stop_voice_mode_stack.sh"
)

for script in "${SCRIPTS_TO_CHECK[@]}"; do
    if [[ -f "$WORKSPACE_ROOT/$script" ]]; then
        echo -e "  ${GREEN}✓${NC} $script exists"
    else
        echo -e "  ${RED}✗${NC} $script missing (prototype)"
    fi
done
echo ""

# 2. Check service readiness
echo "🔧 Service Readiness..."
SERVICES=("voice-service" "reasoning-gateway" "product-service")
for service in "${SERVICES[@]}"; do
    SERVICE_PATH="$WORKSPACE_ROOT/backend/$service"
    if [[ -d "$SERVICE_PATH" ]]; then
        if [[ -f "$SERVICE_PATH/package.json" ]]; then
            echo -e "  ${GREEN}✓${NC} $service: package.json found"
        else
            echo -e "  ${YELLOW}⚠${NC} $service: missing package.json"
        fi
        if [[ -f "$SERVICE_PATH/Dockerfile" ]]; then
            echo -e "  ${GREEN}✓${NC} $service: Dockerfile found"
        else
            echo -e "  ${YELLOW}⚠${NC} $service: missing Dockerfile"
        fi
    else
        echo -e "  ${RED}✗${NC} $service: directory not found"
    fi
done
echo ""

# 3. Check Docker stack status
echo "🐳 Docker Stack Status..."
if command -v docker &> /dev/null; then
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(voice-service|reasoning-gateway|redis)" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Voice Mode containers detected"
        docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(voice-service|reasoning-gateway|redis)" | sed 's/^/    /'
    else
        echo -e "  ${YELLOW}⚠${NC} Voice Mode stack not running"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Docker not available"
fi
echo ""

# 4. Check test coverage
echo "🧪 Test Coverage..."
if [[ -d "$WORKSPACE_ROOT/automation/tests/playwright" ]]; then
    TEST_COUNT=$(find "$WORKSPACE_ROOT/automation/tests/playwright" -name "*.spec.ts" -o -name "*.test.ts" | wc -l | tr -d ' ')
    echo -e "  ${GREEN}✓${NC} Playwright tests found: $TEST_COUNT test files"
else
    echo -e "  ${RED}✗${NC} Playwright tests directory missing"
fi
echo ""

# 5. Check documentation status
echo "📚 Documentation Status..."
DOCS_TO_CHECK=(
    "docs/voice/ElevenLabs_v3_upgrade.md"
    "docs/reasoning/deepseek_33b_local.md"
    "CURRENT_STATUS.md"
    "E2E_MISSION.md"
)

for doc in "${DOCS_TO_CHECK[@]}"; do
    if [[ -f "$WORKSPACE_ROOT/$doc" ]]; then
        LAST_MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$WORKSPACE_ROOT/$doc" 2>/dev/null || echo "unknown")
        echo -e "  ${GREEN}✓${NC} $doc (modified: $LAST_MODIFIED)"
    else
        echo -e "  ${RED}✗${NC} $doc missing"
    fi
done
echo ""

# 6. Check for untracked files
echo "🗂️ Untracked Files..."
UNTRACKED_COUNT=$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')
if [[ "$UNTRACKED_COUNT" -gt 0 ]]; then
    echo -e "  ${YELLOW}⚠${NC} $UNTRACKED_COUNT untracked files found"
    git ls-files --others --exclude-standard | head -5 | sed 's/^/    - /'
    if [[ "$UNTRACKED_COUNT" -gt 5 ]]; then
        echo "    ... and $((UNTRACKED_COUNT - 5)) more"
    fi
else
    echo -e "  ${GREEN}✓${NC} No untracked files"
fi
echo ""

# 7. Git Status Summary
echo "═══════════════════════════════════════════════════════════════"
echo "                    📊 Git Status Summary"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Branch info
CURRENT_BRANCH=$(git branch --show-current)
echo "Branch: $CURRENT_BRANCH"

# Check if branch is up to date
git fetch origin "$CURRENT_BRANCH" --quiet 2>/dev/null || true
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/"$CURRENT_BRANCH" 2>/dev/null || echo "")

if [[ "$LOCAL_COMMIT" == "$REMOTE_COMMIT" ]]; then
    echo -e "Status: ${GREEN}✓${NC} Up to date with origin"
else
    AHEAD=$(git rev-list --count origin/"$CURRENT_BRANCH"..HEAD 2>/dev/null || echo "0")
    BEHIND=$(git rev-list --count HEAD..origin/"$CURRENT_BRANCH" 2>/dev/null || echo "0")
    if [[ "$AHEAD" -gt 0 ]]; then
        echo -e "Status: ${YELLOW}⚠${NC} Ahead by $AHEAD commits"
    fi
    if [[ "$BEHIND" -gt 0 ]]; then
        echo -e "Status: ${YELLOW}⚠${NC} Behind by $BEHIND commits"
    fi
fi

# Modified files
MODIFIED_COUNT=$(git status --porcelain | grep -E "^ M" | wc -l | tr -d ' ')
if [[ "$MODIFIED_COUNT" -gt 0 ]]; then
    echo -e "Modified: ${YELLOW}$MODIFIED_COUNT files${NC}"
    git status --porcelain | grep -E "^ M" | head -3 | sed 's/^ M /  - /'
fi

# Staged files
STAGED_COUNT=$(git status --porcelain | grep -E "^[AM]" | wc -l | tr -d ' ')
if [[ "$STAGED_COUNT" -gt 0 ]]; then
    echo -e "Staged: ${GREEN}$STAGED_COUNT files${NC}"
fi

# Working tree status
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "\nWorking Tree: ${GREEN}✓ Clean${NC}"
else
    echo -e "\nWorking Tree: ${YELLOW}⚠ Has changes${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Run 'git status' for full details"
echo "═══════════════════════════════════════════════════════════════"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

# Optimized: 2025-10-02
