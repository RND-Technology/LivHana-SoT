#!/bin/bash

# Test script for Claude Autonomous Agent API
# This script demonstrates all endpoints and workflows

set -e

BASE_URL="http://localhost:4002"
ADMIN_TOKEN="${ADMIN_JWT_TOKEN:-your-admin-token-here}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_test() {
  echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}→ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Check if server is running
print_test "Checking if reasoning-gateway is running"
if curl -s "${BASE_URL}/healthz" > /dev/null; then
  print_success "Server is running"
else
  print_error "Server is not running at ${BASE_URL}"
  exit 1
fi

# Test 1: Get Capabilities
print_test "Test 1: Get Agent Capabilities"
CAPABILITIES=$(curl -s "${BASE_URL}/api/autonomous/capabilities" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")
echo "$CAPABILITIES" | jq '.'
print_success "Retrieved agent capabilities"

# Test 2: Execute a simple task
print_test "Test 2: Execute Autonomous Task"
TASK_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/autonomous/execute" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Create a simple hello world test function",
    "context": {
      "language": "javascript",
      "testFramework": "jest"
    },
    "requireApproval": false
  }')

TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.taskId')

if [ "$TASK_ID" != "null" ] && [ -n "$TASK_ID" ]; then
  print_success "Task created with ID: $TASK_ID"
  echo "$TASK_RESPONSE" | jq '.'
else
  print_error "Failed to create task"
  echo "$TASK_RESPONSE"
  exit 1
fi

# Test 3: Monitor task status
print_test "Test 3: Monitor Task Status"
print_info "Polling task status every 2 seconds..."

MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  TASK_STATUS=$(curl -s "${BASE_URL}/api/autonomous/tasks/${TASK_ID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}")

  STATUS=$(echo "$TASK_STATUS" | jq -r '.status')
  PROGRESS=$(echo "$TASK_STATUS" | jq -r '.progress')
  CURRENT_STEP=$(echo "$TASK_STATUS" | jq -r '.currentStep')

  print_info "Status: $STATUS | Progress: ${PROGRESS}% | Step: $CURRENT_STEP"

  # Check if task is finished
  if [[ "$STATUS" == "completed" ]] || [[ "$STATUS" == "failed" ]] || [[ "$STATUS" == "pending_approval" ]]; then
    echo
    echo "$TASK_STATUS" | jq '.'
    print_success "Task finished with status: $STATUS"
    break
  fi

  ATTEMPT=$((ATTEMPT + 1))
  sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  print_error "Task did not complete within timeout"
fi

# Test 4: Get task details
print_test "Test 4: Get Full Task Details"
TASK_DETAILS=$(curl -s "${BASE_URL}/api/autonomous/tasks/${TASK_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")
echo "$TASK_DETAILS" | jq '.'

# Test 5: List all tasks
print_test "Test 5: List All Tasks"
ALL_TASKS=$(curl -s "${BASE_URL}/api/autonomous/tasks?limit=10" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")
echo "$ALL_TASKS" | jq '.'
TASK_COUNT=$(echo "$ALL_TASKS" | jq '.pagination.total')
print_success "Found $TASK_COUNT total tasks"

# Test 6: Get learnings
print_test "Test 6: Get Agent Learnings"
LEARNINGS=$(curl -s "${BASE_URL}/api/autonomous/learnings?limit=5" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")
echo "$LEARNINGS" | jq '.'
LEARNING_COUNT=$(echo "$LEARNINGS" | jq '.total')
print_success "Found $LEARNING_COUNT learnings"

# Test 7: Health check
print_test "Test 7: Autonomous Agent Health Check"
HEALTH=$(curl -s "${BASE_URL}/api/autonomous/health" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")
echo "$HEALTH" | jq '.'
HEALTH_STATUS=$(echo "$HEALTH" | jq -r '.status')
print_success "Health status: $HEALTH_STATUS"

# Test 8: Test approval workflow (with a new task)
print_test "Test 8: Test Approval Workflow"
APPROVAL_TASK=$(curl -s -X POST "${BASE_URL}/api/autonomous/execute" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add a comment to document the code",
    "context": {
      "file": "example.js"
    },
    "requireApproval": true
  }')

APPROVAL_TASK_ID=$(echo "$APPROVAL_TASK" | jq -r '.taskId')
print_info "Created approval task: $APPROVAL_TASK_ID"

# Wait a bit for task to reach pending_approval state
print_info "Waiting for task to complete execution..."
sleep 5

# Check if task needs approval
APPROVAL_STATUS=$(curl -s "${BASE_URL}/api/autonomous/tasks/${APPROVAL_TASK_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")
APPROVAL_STATE=$(echo "$APPROVAL_STATUS" | jq -r '.status')

if [ "$APPROVAL_STATE" == "pending_approval" ]; then
  print_info "Task is pending approval, approving..."

  APPROVE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/autonomous/approve/${APPROVAL_TASK_ID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "approved": true,
      "reason": "Test approval from automated test script"
    }')

  echo "$APPROVE_RESPONSE" | jq '.'
  print_success "Task approved"
else
  print_info "Task status is: $APPROVAL_STATE (not pending approval)"
fi

# Test 9: Test error handling (invalid request)
print_test "Test 9: Test Error Handling"
ERROR_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/autonomous/execute" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"task": ""}')

if echo "$ERROR_RESPONSE" | grep -q "error"; then
  print_success "Error handling works correctly"
  echo "$ERROR_RESPONSE" | jq '.'
else
  print_error "Error handling not working as expected"
fi

# Test 10: Filter tasks by status
print_test "Test 10: Filter Tasks by Status"
COMPLETED_TASKS=$(curl -s "${BASE_URL}/api/autonomous/tasks?status=completed&limit=5" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")
COMPLETED_COUNT=$(echo "$COMPLETED_TASKS" | jq '.tasks | length')
print_success "Found $COMPLETED_COUNT completed tasks"
echo "$COMPLETED_TASKS" | jq '.tasks[] | {id, task, status, createdAt}'

# Summary
echo
print_test "Test Summary"
print_success "All tests completed successfully!"
echo
print_info "Task IDs created during test:"
print_info "  - Main task: $TASK_ID"
print_info "  - Approval task: $APPROVAL_TASK_ID"
echo
print_info "You can view these tasks at:"
print_info "  ${BASE_URL}/api/autonomous/tasks/${TASK_ID}"
print_info "  ${BASE_URL}/api/autonomous/tasks/${APPROVAL_TASK_ID}"
echo
print_info "To monitor real-time progress, use SSE endpoint:"
print_info "  curl -N ${BASE_URL}/api/autonomous/stream/TASK_ID -H 'Authorization: Bearer \$ADMIN_TOKEN'"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
