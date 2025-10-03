#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail


# Monitoring Integration Test Script
# Tests all monitoring endpoints and functionality

set -e

echo "======================================"
echo "LivHana Monitoring Integration Tests"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
INTEGRATION_SERVICE_URL="${INTEGRATION_SERVICE_URL:-http://localhost:3005}"
REASONING_GATEWAY_URL="${REASONING_GATEWAY_URL:-http://localhost:4002}"
VOICE_SERVICE_URL="${VOICE_SERVICE_URL:-http://localhost:4001}"

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_endpoint() {
  local service=$1
  local url=$2
  local expected_status=$3
  local description=$4

  TESTS_RUN=$((TESTS_RUN + 1))
  echo -n "Testing [$service]: $description ... "

  response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
  status_code=$(echo "$response" | tail -n 1)

  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($status_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (expected $expected_status, got $status_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Test JSON response
test_json_response() {
  local service=$1
  local url=$2
  local json_key=$3
  local description=$4

  TESTS_RUN=$((TESTS_RUN + 1))
  echo -n "Testing [$service]: $description ... "

  response=$(curl -s "$url" 2>/dev/null || echo "{}")

  if echo "$response" | jq -e ".$json_key" > /dev/null 2>&1; then
    local value
    value=$(echo "$response" | jq -r ".$json_key")
    echo -e "${GREEN}✓ PASS${NC} (value: $value)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (key not found: $json_key)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Test prometheus metrics
test_prometheus_metrics() {
  local service=$1
  local url=$2
  local description=$3

  TESTS_RUN=$((TESTS_RUN + 1))
  echo -n "Testing [$service]: $description ... "

  local response
  response=$(curl -s "$url" 2>/dev/null || echo "")

  if echo "$response" | grep -q "# HELP"; then
    metric_count=$(echo "$response" | grep -c "# HELP")
    echo -e "${GREEN}✓ PASS${NC} ($metric_count metrics)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (no prometheus metrics found)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

echo "Prerequisites Check"
echo "-------------------"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo -e "${YELLOW}Warning: jq not installed. JSON validation tests will be skipped.${NC}"
  echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
  echo ""
fi

# Check if curl is installed
if ! command -v curl &> /dev/null; then
  echo -e "${RED}Error: curl not installed${NC}"
  exit 1
fi

echo ""
echo "Testing Integration Service ($INTEGRATION_SERVICE_URL)"
echo "-------------------------------------------------------"

# Basic health check
test_endpoint "integration-service" "$INTEGRATION_SERVICE_URL/health" "200" "Basic health check"

# Kubernetes health check
test_endpoint "integration-service" "$INTEGRATION_SERVICE_URL/healthz" "200" "Kubernetes liveness"

# Readiness check
test_endpoint "integration-service" "$INTEGRATION_SERVICE_URL/ready" "200" "Readiness with dependencies"

# Metrics endpoint
test_prometheus_metrics "integration-service" "$INTEGRATION_SERVICE_URL/metrics" "Prometheus metrics"

# JSON response validation
if command -v jq &> /dev/null; then
  test_json_response "integration-service" "$INTEGRATION_SERVICE_URL/health" "status" "Health status field"
  test_json_response "integration-service" "$INTEGRATION_SERVICE_URL/health" "service" "Service name field"
  test_json_response "integration-service" "$INTEGRATION_SERVICE_URL/health" "timestamp" "Timestamp field"
  test_json_response "integration-service" "$INTEGRATION_SERVICE_URL/ready" "checks" "Dependency checks field"
fi

echo ""
echo "Testing Reasoning Gateway ($REASONING_GATEWAY_URL)"
echo "---------------------------------------------------"

# Basic health check
test_endpoint "reasoning-gateway" "$REASONING_GATEWAY_URL/health" "200" "Basic health check"

# Kubernetes health check
test_endpoint "reasoning-gateway" "$REASONING_GATEWAY_URL/healthz" "200" "Kubernetes liveness"

# Readiness check
test_endpoint "reasoning-gateway" "$REASONING_GATEWAY_URL/ready" "200" "Readiness with dependencies"

# Metrics endpoint
test_prometheus_metrics "reasoning-gateway" "$REASONING_GATEWAY_URL/metrics" "Prometheus metrics"

# JSON response validation
if command -v jq &> /dev/null; then
  test_json_response "reasoning-gateway" "$REASONING_GATEWAY_URL/health" "status" "Health status field"
  test_json_response "reasoning-gateway" "$REASONING_GATEWAY_URL/health" "service" "Service name field"
  test_json_response "reasoning-gateway" "$REASONING_GATEWAY_URL/ready" "checks" "Dependency checks field"
fi

echo ""
echo "Testing Voice Service ($VOICE_SERVICE_URL)"
echo "-------------------------------------------"

# Basic health check
test_endpoint "voice-service" "$VOICE_SERVICE_URL/health" "200" "Basic health check" || true

# Voice mode health
test_endpoint "voice-service" "$VOICE_SERVICE_URL/health/voice-mode" "200" "Voice mode health" || true

echo ""
echo "Performance Test"
echo "----------------"

# Generate some load for metrics
echo -n "Generating load (100 requests) ... "
for _ in {1..100}; do
  curl -s "$INTEGRATION_SERVICE_URL/health" > /dev/null 2>&1 &
done
wait
echo -e "${GREEN}✓ Done${NC}"

# Wait a bit for metrics to update
sleep 2

# Check if metrics updated
echo -n "Verifying metrics updated ... "
metrics_response=$(curl -s "$INTEGRATION_SERVICE_URL/metrics" 2>/dev/null || echo "")
if echo "$metrics_response" | grep -q "http_requests_total"; then
  echo -e "${GREEN}✓ PASS${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "Request ID Correlation Test"
echo "----------------------------"

# Test request ID in response header
echo -n "Testing request ID correlation ... "
request_id=$(curl -s -D - "$INTEGRATION_SERVICE_URL/health" 2>/dev/null | grep -i "x-request-id" | awk '{print $2}' | tr -d '\r')
if [ ! -z "$request_id" ]; then
  echo -e "${GREEN}✓ PASS${NC} (ID: ${request_id:0:8}...)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${YELLOW}⚠ WARN${NC} (header not found - may not be implemented yet)"
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Test custom request ID
echo -n "Testing custom request ID ... "
custom_id="test-$(date +%s)"
response_id=$(curl -s -H "x-request-id: $custom_id" -D - "$INTEGRATION_SERVICE_URL/health" 2>/dev/null | grep -i "x-request-id" | awk '{print $2}' | tr -d '\r')
if [ "$response_id" = "$custom_id" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${YELLOW}⚠ WARN${NC} (custom ID not preserved)"
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"
echo "Total Tests: $TESTS_RUN"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $TESTS_FAILED${NC}"
fi
echo ""

# Calculate success rate
success_rate=$((TESTS_PASSED * 100 / TESTS_RUN))

if [ $success_rate -ge 90 ]; then
  echo -e "${GREEN}✓ Monitoring is working well! ($success_rate% success rate)${NC}"
  exit 0
elif [ $success_rate -ge 70 ]; then
  echo -e "${YELLOW}⚠ Some monitoring features need attention ($success_rate% success rate)${NC}"
  exit 0
else
  echo -e "${RED}✗ Monitoring has significant issues ($success_rate% success rate)${NC}"
  exit 1
fi

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
