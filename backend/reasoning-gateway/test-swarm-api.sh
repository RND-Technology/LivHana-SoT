#!/bin/bash

# SWARM INTEGRATION API TEST SUITE
# Tests all endpoints and workflows

API_BASE="http://localhost:8080/api/swarm"
API_KEY="test"
AGENT_ID="test-orchestrator"

echo "========================================"
echo "SWARM INTEGRATION API TEST SUITE"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

test_case() {
  echo -e "${YELLOW}TEST: $1${NC}"
}

pass() {
  echo -e "${GREEN}✓ PASS${NC}"
  echo ""
  ((pass_count++))
}

fail() {
  echo -e "${RED}✗ FAIL: $1${NC}"
  echo ""
  ((fail_count++))
}

# Test 1: Health Check (no auth required)
test_case "Health Check"
response=$(curl -s "$API_BASE/health")
if echo "$response" | jq -e '.status == "healthy"' > /dev/null; then
  pass
else
  fail "Health check failed"
fi

# Test 2: Capabilities List
test_case "Get Capabilities"
response=$(curl -s -H "X-API-Key: $API_KEY" "$API_BASE/capabilities")
if echo "$response" | jq -e '.success == true and .capabilities.agents | length > 0' > /dev/null; then
  pass
else
  fail "Capabilities check failed"
fi

# Test 3: List Agents
test_case "List Agents"
response=$(curl -s -H "X-API-Key: $API_KEY" "$API_BASE/agents")
if echo "$response" | jq -e '.success == true and .total >= 3' > /dev/null; then
  pass
else
  fail "Agent list failed"
fi

# Test 4: Submit Task (deployment)
test_case "Submit Deployment Task"
response=$(curl -s -X POST "$API_BASE/tasks" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Agent-Id: $AGENT_ID" \
  -H "Content-Type: application/json" \
  -d '{"type":"deployment","description":"Test deployment","requiredCapabilities":["deployment"],"priority":"high"}')

TASK_ID=$(echo "$response" | jq -r '.task.id')
if [[ "$TASK_ID" != "null" && "$TASK_ID" != "" ]]; then
  echo "Task ID: $TASK_ID"
  pass
else
  fail "Task submission failed"
fi

# Test 5: Get Task Status
test_case "Get Task Status"
response=$(curl -s -H "X-API-Key: $API_KEY" "$API_BASE/status/$TASK_ID")
if echo "$response" | jq -e '.success == true and .status.id' > /dev/null; then
  pass
else
  fail "Get status failed"
fi

# Test 6: Start Task
test_case "Start Task"
response=$(curl -s -X POST "$API_BASE/tasks/$TASK_ID/start" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Agent-Id: claude-code-cli")
if echo "$response" | jq -e '.success == true and .task.status == "in_progress"' > /dev/null; then
  pass
else
  fail "Start task failed"
fi

# Test 7: Submit Results
test_case "Submit Task Results"
response=$(curl -s -X POST "$API_BASE/results" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Agent-Id: claude-code-cli" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":\"$TASK_ID\",\"success\":true,\"result\":{\"status\":\"deployed\"}}")
if echo "$response" | jq -e '.success == true and .task.status == "completed"' > /dev/null; then
  pass
else
  fail "Submit results failed"
fi

# Test 8: List Tasks
test_case "List All Tasks"
response=$(curl -s -H "X-API-Key: $API_KEY" "$API_BASE/tasks")
if echo "$response" | jq -e '.success == true and .tasks | length > 0' > /dev/null; then
  pass
else
  fail "List tasks failed"
fi

# Test 9: Filter Tasks by Status
test_case "Filter Tasks by Status (completed)"
response=$(curl -s -H "X-API-Key: $API_KEY" "$API_BASE/tasks?status=completed")
if echo "$response" | jq -e '.success == true' > /dev/null; then
  pass
else
  fail "Filter tasks failed"
fi

# Test 10: HNC Quick Start
test_case "HNC Quick Start Pipeline"
response=$(curl -s -X POST "$API_BASE/quick-start/hnc" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Agent-Id: $AGENT_ID")
if echo "$response" | jq -e '.success == true and .pipeline.tasks | length == 4' > /dev/null; then
  echo "Pipeline ID: $(echo "$response" | jq -r '.pipeline.pipelineId')"
  pass
else
  fail "HNC quick start failed"
fi

# Test 11: Error Handling - Missing Auth
test_case "Error Handling: Missing Auth"
response=$(curl -s "$API_BASE/tasks")
if echo "$response" | jq -e '.success == false and (.error | contains("Authentication"))' > /dev/null; then
  pass
else
  fail "Auth validation failed"
fi

# Test 12: Error Handling - Missing Required Fields
test_case "Error Handling: Missing Required Fields"
response=$(curl -s -X POST "$API_BASE/tasks" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Agent-Id: $AGENT_ID" \
  -H "Content-Type: application/json" \
  -d '{"description":"Missing type"}')
if echo "$response" | jq -e '.success == false' > /dev/null; then
  pass
else
  fail "Validation failed"
fi

# Test 13: Error Handling - Nonexistent Task
test_case "Error Handling: Nonexistent Task"
response=$(curl -s -H "X-API-Key: $API_KEY" "$API_BASE/status/nonexistent-task-id")
if echo "$response" | jq -e '.success == false and (.error | contains("not found"))' > /dev/null; then
  pass
else
  fail "404 handling failed"
fi

# Test 14: Agent Load Balancing
test_case "Agent Load Balancing"
# Submit multiple tasks with same capabilities
for i in {1..3}; do
  curl -s -X POST "$API_BASE/tasks" \
    -H "X-API-Key: $API_KEY" \
    -H "X-Agent-Id: $AGENT_ID" \
    -H "Content-Type: application/json" \
    -d '{"type":"deployment","description":"Test load balancing","requiredCapabilities":["deployment"],"priority":"medium"}' > /dev/null
done
response=$(curl -s -H "X-API-Key: $API_KEY" "$API_BASE/agents")
if echo "$response" | jq -e '.agents[0].currentTasks > 0 or .agents[2].currentTasks > 0' > /dev/null; then
  pass
else
  fail "Load balancing check failed"
fi

# Final Summary
echo "========================================"
echo "TEST SUMMARY"
echo "========================================"
echo -e "Total Tests: $((pass_count + fail_count))"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"

if [ $fail_count -eq 0 ]; then
  echo -e "\n${GREEN}ALL TESTS PASSED!${NC}"
  exit 0
else
  echo -e "\n${RED}SOME TESTS FAILED${NC}"
  exit 1
fi
