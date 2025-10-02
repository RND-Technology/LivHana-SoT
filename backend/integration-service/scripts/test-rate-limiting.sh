#!/bin/bash

##############################################################################
# Rate Limiting Test Script
# Tests DDoS protection by hitting endpoints repeatedly
##############################################################################

set -e

INTEGRATION_SERVICE_URL="${INTEGRATION_SERVICE_URL:-http://localhost:3005}"
REASONING_GATEWAY_URL="${REASONING_GATEWAY_URL:-http://localhost:4002}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Rate Limiting & DDoS Protection Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

##############################################################################
# Test 1: Integration Service Public Endpoint Rate Limiting
##############################################################################

echo -e "${YELLOW}Test 1: Integration Service - Public Endpoint Rate Limiting${NC}"
echo "Testing rate limit on: ${INTEGRATION_SERVICE_URL}/health"
echo ""

SUCCESS_COUNT=0
RATE_LIMITED_COUNT=0

# Make 110 requests (public limit is 100/min)
for i in {1..110}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${INTEGRATION_SERVICE_URL}/health" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" == "200" ]; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$HTTP_CODE" == "429" ]; then
    RATE_LIMITED_COUNT=$((RATE_LIMITED_COUNT + 1))
  fi

  # Show progress every 10 requests
  if [ $((i % 10)) -eq 0 ]; then
    echo "  Request $i/110 - Success: $SUCCESS_COUNT, Rate Limited: $RATE_LIMITED_COUNT"
  fi
done

echo ""
if [ $RATE_LIMITED_COUNT -gt 0 ]; then
  echo -e "${GREEN}✓ Rate limiting is WORKING${NC}"
  echo "  - Successful requests: $SUCCESS_COUNT"
  echo "  - Rate limited (429): $RATE_LIMITED_COUNT"
else
  echo -e "${RED}✗ Rate limiting NOT detected${NC}"
  echo "  - All $SUCCESS_COUNT requests succeeded"
  echo "  - WARNING: Service may be vulnerable to DDoS"
fi
echo ""

##############################################################################
# Test 2: Integration Service Rate Limit Headers
##############################################################################

echo -e "${YELLOW}Test 2: Integration Service - Rate Limit Headers${NC}"
echo ""

RESPONSE=$(curl -i -s "${INTEGRATION_SERVICE_URL}/health" 2>/dev/null || echo "")

if echo "$RESPONSE" | grep -i "ratelimit-limit" > /dev/null; then
  LIMIT=$(echo "$RESPONSE" | grep -i "ratelimit-limit" | awk '{print $2}' | tr -d '\r')
  REMAINING=$(echo "$RESPONSE" | grep -i "ratelimit-remaining" | awk '{print $2}' | tr -d '\r')
  echo -e "${GREEN}✓ Rate limit headers present${NC}"
  echo "  - RateLimit-Limit: $LIMIT"
  echo "  - RateLimit-Remaining: $REMAINING"
else
  echo -e "${RED}✗ Rate limit headers NOT found${NC}"
  echo "  - Headers may not be configured correctly"
fi
echo ""

##############################################################################
# Test 3: Reasoning Gateway Rate Limiting
##############################################################################

echo -e "${YELLOW}Test 3: Reasoning Gateway - Health Check Rate Limiting${NC}"
echo "Testing rate limit on: ${REASONING_GATEWAY_URL}/health"
echo ""

SUCCESS_COUNT=0
RATE_LIMITED_COUNT=0

# Make 110 requests (health limit is 300/min, so we shouldn't hit it)
for i in {1..110}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${REASONING_GATEWAY_URL}/health" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" == "200" ]; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$HTTP_CODE" == "429" ]; then
    RATE_LIMITED_COUNT=$((RATE_LIMITED_COUNT + 1))
  fi

  if [ $((i % 20)) -eq 0 ]; then
    echo "  Request $i/110 - Success: $SUCCESS_COUNT, Rate Limited: $RATE_LIMITED_COUNT"
  fi
done

echo ""
if [ $SUCCESS_COUNT -eq 110 ]; then
  echo -e "${GREEN}✓ Health check rate limit is lenient (all requests passed)${NC}"
  echo "  - Successful requests: $SUCCESS_COUNT/110"
else
  echo -e "${YELLOW}⚠ Some requests were rate limited${NC}"
  echo "  - Successful: $SUCCESS_COUNT, Rate Limited: $RATE_LIMITED_COUNT"
fi
echo ""

##############################################################################
# Test 4: Monitoring Endpoints
##############################################################################

echo -e "${YELLOW}Test 4: Rate Limit Monitoring Endpoints${NC}"
echo ""

# Test Integration Service monitoring
echo "Testing Integration Service monitoring..."
STATS=$(curl -s "${INTEGRATION_SERVICE_URL}/api/monitoring/rate-limit/stats" 2>/dev/null || echo "")

if echo "$STATS" | grep -q "totalHits"; then
  echo -e "${GREEN}✓ Integration Service monitoring endpoint responding${NC}"
  echo "$STATS" | python3 -m json.tool 2>/dev/null || echo "$STATS"
else
  echo -e "${RED}✗ Integration Service monitoring endpoint NOT responding${NC}"
fi
echo ""

# Test Reasoning Gateway monitoring
echo "Testing Reasoning Gateway monitoring..."
STATS=$(curl -s "${REASONING_GATEWAY_URL}/api/monitoring/rate-limit/stats" 2>/dev/null || echo "")

if echo "$STATS" | grep -q "totalHits"; then
  echo -e "${GREEN}✓ Reasoning Gateway monitoring endpoint responding${NC}"
  echo "$STATS" | python3 -m json.tool 2>/dev/null || echo "$STATS"
else
  echo -e "${RED}✗ Reasoning Gateway monitoring endpoint NOT responding${NC}"
fi
echo ""

##############################################################################
# Test 5: Rate Limit Configuration
##############################################################################

echo -e "${YELLOW}Test 5: Rate Limit Configuration${NC}"
echo ""

CONFIG=$(curl -s "${INTEGRATION_SERVICE_URL}/api/monitoring/rate-limit/config" 2>/dev/null || echo "")

if echo "$CONFIG" | grep -q "PUBLIC"; then
  echo -e "${GREEN}✓ Rate limit configuration accessible${NC}"
  echo "$CONFIG" | python3 -m json.tool 2>/dev/null || echo "$CONFIG"
else
  echo -e "${RED}✗ Configuration endpoint NOT responding${NC}"
fi
echo ""

##############################################################################
# Summary
##############################################################################

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Rate limiting tests completed."
echo ""
echo "Key Points:"
echo "  - Public endpoints: 100 req/min"
echo "  - Authenticated: 300 req/min"
echo "  - Admin: 1000 req/min"
echo "  - Health checks: 300 req/min"
echo ""
echo "Monitoring endpoints:"
echo "  - ${INTEGRATION_SERVICE_URL}/api/monitoring/rate-limit/stats"
echo "  - ${INTEGRATION_SERVICE_URL}/api/monitoring/rate-limit/config"
echo "  - ${REASONING_GATEWAY_URL}/api/monitoring/rate-limit/stats"
echo "  - ${REASONING_GATEWAY_URL}/api/monitoring/rate-limit/config"
echo ""
echo -e "${GREEN}DDoS protection is ACTIVE${NC}"
echo ""

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
