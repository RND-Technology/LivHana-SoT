#!/bin/bash
###############################################################################
# MCP Broker Quick Connection Test
# Alternative test that uses environment variable or prompts for token
###############################################################################

set -euo pipefail

# Configuration
MCP_BROKER_URL="https://mcp-broker-prod-9809f04432sl.us-central1.run.app"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  MCP BROKER QUICK CONNECTION TEST"
echo "═══════════════════════════════════════════════════════════════"
echo ""

###############################################################################
# Get Bearer Token
###############################################################################
if [[ -z "${MCP_BROKER_TOKEN:-}" ]]; then
    echo -e "${YELLOW}ℹ INFO${NC}: MCP_BROKER_TOKEN environment variable not set"
    echo ""
    echo "To set the token, choose ONE of these methods:"
    echo ""
    echo "Method 1: Environment Variable (Quick Test)"
    echo "  export MCP_BROKER_TOKEN='op_YOUR_TOKEN_HERE'"
    echo "  ./scripts/test-mcp-broker-quick.sh"
    echo ""
    echo "Method 2: 1Password CLI (Secure)"
    echo "  op signin"
    echo "  export MCP_BROKER_TOKEN=\$(op read 'op://YOUR_VAULT/YOUR_ITEM/credential')"
    echo "  ./scripts/test-mcp-broker-quick.sh"
    echo ""
    echo "Method 3: Find Token in 1Password GUI"
    echo "  1. Open 1Password app"
    echo "  2. Search for 'MCP' or 'broker' or 'OpenAI Agent'"
    echo "  3. Copy the token (should start with 'op_')"
    echo "  4. Run: export MCP_BROKER_TOKEN='<paste token here>'"
    echo "  5. Run: ./scripts/test-mcp-broker-quick.sh"
    echo ""
    exit 1
fi

BEARER_TOKEN="$MCP_BROKER_TOKEN"

# Validate token format (ops_ for OpenAI Platform Service tokens)
if [[ ! "$BEARER_TOKEN" =~ ^ops_ ]]; then
    echo -e "${YELLOW}⚠ WARNING${NC}: Token does not start with 'ops_' prefix"
    echo "   Expected format: ops_XXXXXXXX (OpenAI Platform Service token)"
    echo "   Actual prefix: ${BEARER_TOKEN:0:10}..."
    echo ""
    echo "   Note: 'ops' prefix = OpenAI Platform Service"
    echo "         NOT to be confused with OPS Layer (One Plant Solution)"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Bearer token loaded (prefix: ${BEARER_TOKEN:0:5}...)"
echo ""

###############################################################################
# Test 1: MCP Broker Health Check
###############################################################################
echo -e "${BLUE}[TEST 1]${NC} Testing MCP Broker health endpoint..."
echo "   URL: $MCP_BROKER_URL/health"
echo ""

HTTP_CODE=$(curl -s -o /tmp/mcp-health.json -w "%{http_code}" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    "$MCP_BROKER_URL/health" 2>&1)

if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✓ PASS${NC}: MCP Broker is healthy (HTTP $HTTP_CODE)"
    if [[ -f /tmp/mcp-health.json ]]; then
        echo "   Response:"
        cat /tmp/mcp-health.json | jq '.' 2>/dev/null || cat /tmp/mcp-health.json | head -20
    fi
elif [[ "$HTTP_CODE" == "401" ]] || [[ "$HTTP_CODE" == "403" ]]; then
    echo -e "${RED}✗ FAIL${NC}: Authentication failed (HTTP $HTTP_CODE)"
    echo "   Your bearer token may be incorrect or expired"
    echo "   Check the token in 1Password and try again"
    exit 1
else
    echo -e "${RED}✗ FAIL${NC}: MCP Broker health check failed (HTTP $HTTP_CODE)"
    if [[ -f /tmp/mcp-health.json ]]; then
        echo "   Response:"
        cat /tmp/mcp-health.json | head -20
    fi
    exit 1
fi
echo ""

###############################################################################
# Test 2: List Available Tools
###############################################################################
echo -e "${BLUE}[TEST 2]${NC} Listing available MCP tools..."
echo "   URL: $MCP_BROKER_URL/tools"
echo ""

HTTP_CODE=$(curl -s -o /tmp/mcp-tools.json -w "%{http_code}" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    -H "Content-Type: application/json" \
    "$MCP_BROKER_URL/tools" 2>&1)

if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✓ PASS${NC}: MCP tools retrieved (HTTP $HTTP_CODE)"
    echo "   Available tools:"
    cat /tmp/mcp-tools.json | jq -r '.tools[]? | "   - \(.name): \(.description)"' 2>/dev/null || \
    cat /tmp/mcp-tools.json | jq -r '.[]? | "   - \(.name): \(.description)"' 2>/dev/null || \
    cat /tmp/mcp-tools.json | jq '.' 2>/dev/null || \
    cat /tmp/mcp-tools.json | head -50
elif [[ "$HTTP_CODE" == "404" ]]; then
    echo -e "${YELLOW}⚠ INFO${NC}: /tools endpoint not found (HTTP $HTTP_CODE)"
    echo "   This is OK - MCP broker may use different endpoint"
    echo "   Try: $MCP_BROKER_URL/mcp/tools"
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Could not list tools (HTTP $HTTP_CODE)"
    if [[ -f /tmp/mcp-tools.json ]]; then
        echo "   Response:"
        cat /tmp/mcp-tools.json | head -20
    fi
fi
echo ""

###############################################################################
# Test 3: Alternative Endpoints
###############################################################################
echo -e "${BLUE}[TEST 3]${NC} Checking alternative MCP endpoints..."

# Try /mcp/invoke endpoint
echo "   Trying: $MCP_BROKER_URL/mcp/invoke"
HTTP_CODE=$(curl -s -o /tmp/mcp-invoke.json -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"method": "tools/list"}' \
    "$MCP_BROKER_URL/mcp/invoke" 2>&1)

if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✓ PASS${NC}: /mcp/invoke endpoint responsive (HTTP $HTTP_CODE)"
    if [[ -f /tmp/mcp-invoke.json ]]; then
        echo "   Response:"
        cat /tmp/mcp-invoke.json | jq '.' 2>/dev/null || cat /tmp/mcp-invoke.json | head -20
    fi
else
    echo -e "${YELLOW}⚠ INFO${NC}: /mcp/invoke returned HTTP $HTTP_CODE"
fi
echo ""

###############################################################################
# Summary
###############################################################################
echo "═══════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ MCP BROKER CONNECTION TEST COMPLETE${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Configuration Status:"
echo "  MCP Broker URL: $MCP_BROKER_URL"
echo "  Bearer Token:   ${BEARER_TOKEN:0:10}... (${#BEARER_TOKEN} chars)"
echo ""
echo "Next Steps:"
echo "1. If health check passed, your MCP broker is accessible"
echo "2. In OpenAI Agent Builder, configure:"
echo "   - Endpoint: $MCP_BROKER_URL/mcp/invoke"
echo "   - Bearer Token: (use the same token from MCP_BROKER_TOKEN)"
echo "3. Test with a simple query:"
echo "   'List available MCP tools'"
echo ""
echo "For more comprehensive tests, configure 1Password CLI and run:"
echo "  ./scripts/test-mcp-broker.sh"
echo ""

# Cleanup
rm -f /tmp/mcp-health.json /tmp/mcp-tools.json /tmp/mcp-invoke.json
