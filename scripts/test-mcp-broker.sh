#!/bin/bash
###############################################################################
# MCP Broker Connection Test
# Tests OpenAI Agent Builder → MCP Broker → LivHana-SoT integration
###############################################################################

set -euo pipefail

# Configuration
MCP_BROKER_URL="https://mcp-broker-prod-9809f04432sl.us-central1.run.app"
TOKEN_PATH="op://LivHana-Ops-Keys/MCP_BROKER_TOKEN/credential"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  MCP BROKER CONNECTION TEST"
echo "  OpenAI Agent Builder → MCP Broker → LivHana-SoT"
echo "═══════════════════════════════════════════════════════════════"
echo ""

###############################################################################
# Test 1: 1Password CLI Check
###############################################################################
echo -e "${BLUE}[TEST 1]${NC} Checking 1Password CLI..."
if ! command -v op &> /dev/null; then
    echo -e "${RED}✗ FAIL${NC}: 1Password CLI not found"
    echo "   Install: brew install --cask 1password-cli"
    exit 1
fi
echo -e "${GREEN}✓ PASS${NC}: 1Password CLI found"

###############################################################################
# Test 2: Bearer Token Retrieval
###############################################################################
echo -e "${BLUE}[TEST 2]${NC} Retrieving MCP Broker bearer token from 1Password..."
if ! BEARER_TOKEN=$(op read "$TOKEN_PATH" 2>/dev/null); then
    echo -e "${RED}✗ FAIL${NC}: Could not retrieve token from 1Password"
    echo "   Path: $TOKEN_PATH"
    echo "   Ensure you're signed into 1Password CLI: op signin"
    exit 1
fi

# Validate token format (should start with 'op_')
if [[ ! "$BEARER_TOKEN" =~ ^op_ ]]; then
    echo -e "${YELLOW}⚠ WARNING${NC}: Token does not start with 'op_' prefix"
    echo "   Expected format: op_XXXXXXXX"
    echo "   Actual prefix: ${BEARER_TOKEN:0:5}..."
fi

echo -e "${GREEN}✓ PASS${NC}: Bearer token retrieved (prefix: ${BEARER_TOKEN:0:5}...)"

###############################################################################
# Test 3: MCP Broker Health Check
###############################################################################
echo -e "${BLUE}[TEST 3]${NC} Testing MCP Broker health endpoint..."
HTTP_CODE=$(curl -s -o /tmp/mcp-health.json -w "%{http_code}" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    "$MCP_BROKER_URL/health")

if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✓ PASS${NC}: MCP Broker is healthy (HTTP $HTTP_CODE)"
    if [[ -f /tmp/mcp-health.json ]]; then
        echo "   Response:"
        cat /tmp/mcp-health.json | jq '.' 2>/dev/null || cat /tmp/mcp-health.json
    fi
else
    echo -e "${RED}✗ FAIL${NC}: MCP Broker health check failed (HTTP $HTTP_CODE)"
    if [[ -f /tmp/mcp-health.json ]]; then
        echo "   Response:"
        cat /tmp/mcp-health.json
    fi
    exit 1
fi

###############################################################################
# Test 4: List Available Tools
###############################################################################
echo -e "${BLUE}[TEST 4]${NC} Listing available MCP tools..."
HTTP_CODE=$(curl -s -o /tmp/mcp-tools.json -w "%{http_code}" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    "$MCP_BROKER_URL/tools")

if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✓ PASS${NC}: MCP tools retrieved (HTTP $HTTP_CODE)"
    echo "   Available tools:"
    cat /tmp/mcp-tools.json | jq -r '.tools[]? | "   - \(.name): \(.description)"' 2>/dev/null || \
    cat /tmp/mcp-tools.json | jq '.' 2>/dev/null || \
    cat /tmp/mcp-tools.json
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Could not list tools (HTTP $HTTP_CODE)"
    echo "   This may be expected if /tools endpoint doesn't exist"
    if [[ -f /tmp/mcp-tools.json ]]; then
        echo "   Response:"
        cat /tmp/mcp-tools.json
    fi
fi

###############################################################################
# Test 5: LivHana-SoT Repository Access
###############################################################################
echo -e "${BLUE}[TEST 5]${NC} Verifying LivHana-SoT repository access..."

# Check git remote
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$REMOTE" == "git@github.com:RND-Technology/LivHana-SoT.git" ]]; then
    echo -e "${GREEN}✓ PASS${NC}: Git remote correctly configured"
    echo "   Remote: $REMOTE"
else
    echo -e "${RED}✗ FAIL${NC}: Git remote mismatch"
    echo "   Expected: git@github.com:RND-Technology/LivHana-SoT.git"
    echo "   Actual: $REMOTE"
    exit 1
fi

# Check for canonical directories
REQUIRED_DIRS=("backend" "frontend" "automation" "empire" "docs" ".evidence" "scripts" "infra")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        echo -e "${GREEN}✓${NC} $dir/ exists"
    else
        echo -e "${RED}✗${NC} $dir/ missing"
    fi
done

###############################################################################
# Test 6: Critical File Paths
###############################################################################
echo -e "${BLUE}[TEST 6]${NC} Checking critical file paths for MCP access..."

CRITICAL_FILES=(
    "docs/INDEX.md"
    "docs/RPM_WEEKLY_PLAN_OCT4-12_2025.md"
    "empire/content-engine"
    ".evidence"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [[ -e "$file" ]]; then
        if [[ -d "$file" ]]; then
            FILE_COUNT=$(find "$file" -type f | wc -l | tr -d ' ')
            echo -e "${GREEN}✓${NC} $file/ exists ($FILE_COUNT files)"
        else
            FILE_SIZE=$(wc -c < "$file" | tr -d ' ')
            echo -e "${GREEN}✓${NC} $file exists (${FILE_SIZE} bytes)"
        fi
    else
        echo -e "${YELLOW}⚠${NC} $file not found"
    fi
done

###############################################################################
# Summary
###############################################################################
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ MCP BROKER CONNECTION TEST COMPLETE${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo "1. If all tests passed, your MCP broker is ready"
echo "2. Test in OpenAI Agent Builder with a simple query:"
echo "   'Read docs/INDEX.md and summarize the documentation structure'"
echo "3. Monitor MCP broker logs in GCP Cloud Run console"
echo "4. Try an RPM planning test case (see docs/)"
echo ""

# Cleanup
rm -f /tmp/mcp-health.json /tmp/mcp-tools.json
