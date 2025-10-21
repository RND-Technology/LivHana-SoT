#!/usr/bin/env bash
#
# Test Suite for Validation Scripts
# Tests all validation components to ensure they catch errors correctly
#
# Usage:
#   ./test_validation_suite.sh
#
# Tests:
#   1. Preflight checks (with simulated failures)
#   2. Runtime validation module
#   3. Agent coordination validator
#   4. Post-action validation
#   5. Integration with Tier-1 boot

set -euo pipefail

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Find repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Test output directory
TEST_OUTPUT_DIR="$REPO_ROOT/tmp/test_validation"
mkdir -p "$TEST_OUTPUT_DIR"

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
    ((TESTS_RUN++))
}

log_pass() {
    echo -e "${GREEN}  ✓ PASS${NC} $1"
    ((TESTS_PASSED++))
}

log_fail() {
    echo -e "${RED}  ✗ FAIL${NC} $1"
    ((TESTS_FAILED++))
}

log_info() {
    echo -e "${BLUE}  ℹ INFO${NC} $1"
}

banner() {
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}  $1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

#
# TEST SUITE 1: PREFLIGHT CHECKS
#
banner "Test Suite 1: Preflight Checks"

log_test "Preflight check script exists and is executable"
if [[ -x "$REPO_ROOT/scripts/preflight_checks.sh" ]]; then
    log_pass "Script found and executable"
else
    log_fail "Script not found or not executable"
fi

log_test "Preflight checks detect missing API keys"
# Temporarily unset API key
SAVED_KEY="${OPENAI_API_KEY:-}"
unset OPENAI_API_KEY 2>/dev/null || true

if bash "$REPO_ROOT/scripts/preflight_checks.sh" > "$TEST_OUTPUT_DIR/preflight_no_key.log" 2>&1; then
    log_fail "Should have failed with missing OPENAI_API_KEY"
else
    EXIT_CODE=$?
    if [[ $EXIT_CODE -eq 1 ]]; then
        log_pass "Correctly failed with exit code 1 (critical)"
    else
        log_fail "Failed but with wrong exit code: $EXIT_CODE"
    fi
fi

# Restore key
if [[ -n "$SAVED_KEY" ]]; then
    export OPENAI_API_KEY="$SAVED_KEY"
fi

log_test "Preflight checks pass with all requirements met"
# This assumes environment is properly configured
if bash "$REPO_ROOT/scripts/preflight_checks.sh" > "$TEST_OUTPUT_DIR/preflight_pass.log" 2>&1; then
    log_pass "Preflight checks passed"
else
    EXIT_CODE=$?
    if [[ $EXIT_CODE -eq 2 ]]; then
        log_pass "Passed with warnings (acceptable)"
    else
        log_fail "Failed when should have passed"
    fi
fi

#
# TEST SUITE 2: RUNTIME VALIDATION MODULE
#
banner "Test Suite 2: Runtime Validation Module"

log_test "Runtime validation module exists"
if [[ -f "$REPO_ROOT/scripts/runtime_validation.py" ]]; then
    log_pass "Module found"
else
    log_fail "Module not found"
fi

log_test "Runtime validation module imports successfully"
if python3 -c "import sys; sys.path.insert(0, '$REPO_ROOT/scripts'); import runtime_validation" 2>/dev/null; then
    log_pass "Module imports successfully"
else
    log_fail "Module import failed"
fi

log_test "TodoValidator catches multiple in_progress tasks"
TEST_RESULT=$(python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts')
from runtime_validation import TodoValidator

validator = TodoValidator()
invalid_todos = [
    {"content": "Task 1", "status": "in_progress", "activeForm": "Doing 1"},
    {"content": "Task 2", "status": "in_progress", "activeForm": "Doing 2"}
]

if not validator.validate_todo_list(invalid_todos):
    print("CAUGHT")
else:
    print("MISSED")
EOF
)

if [[ "$TEST_RESULT" == "CAUGHT" ]]; then
    log_pass "Caught multiple in_progress tasks"
else
    log_fail "Failed to catch multiple in_progress tasks"
fi

log_test "TodoValidator accepts valid todo list"
TEST_RESULT=$(python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts')
from runtime_validation import TodoValidator

validator = TodoValidator()
valid_todos = [
    {"content": "Task 1", "status": "pending", "activeForm": "Doing 1"},
    {"content": "Task 2", "status": "in_progress", "activeForm": "Doing 2"},
    {"content": "Task 3", "status": "completed", "activeForm": "Did 3"}
]

if validator.validate_todo_list(valid_todos):
    print("VALID")
else:
    print("INVALID")
EOF
)

if [[ "$TEST_RESULT" == "VALID" ]]; then
    log_pass "Accepted valid todo list"
else
    log_fail "Rejected valid todo list"
fi

log_test "TokenTracker tracks usage correctly"
TEST_RESULT=$(python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts')
from runtime_validation import TokenTracker

tracker = TokenTracker(budget=10000)
tracker.log_usage(3000, "test1")
tracker.log_usage(2000, "test2")

if tracker.cumulative_usage == 5000 and tracker.get_remaining() == 5000:
    print("CORRECT")
else:
    print("INCORRECT")
EOF
)

if [[ "$TEST_RESULT" == "CORRECT" ]]; then
    log_pass "Token tracking works correctly"
else
    log_fail "Token tracking incorrect"
fi

log_test "AgentCoordinator prevents parallel agents"
TEST_RESULT=$(python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts')
from runtime_validation import AgentCoordinator, ValidationError

coordinator = AgentCoordinator(max_parallel_agents=1)
coordinator.register_agent("agent1", "Task 1", expected_output="out1.txt")

try:
    coordinator.register_agent("agent2", "Task 2", expected_output="out2.txt")
    print("MISSED")
except ValidationError:
    print("CAUGHT")
EOF
)

if [[ "$TEST_RESULT" == "CAUGHT" ]]; then
    log_pass "Prevented second parallel agent"
else
    log_fail "Failed to prevent parallel agent"
fi

#
# TEST SUITE 3: AGENT COORDINATION VALIDATOR
#
banner "Test Suite 3: Agent Coordination Validator"

log_test "Agent coordination script exists and is executable"
if [[ -x "$REPO_ROOT/scripts/agent_coordination_check.sh" ]]; then
    log_pass "Script found and executable"
else
    log_fail "Script not found or not executable"
fi

log_test "Coordination validator rejects missing task"
if bash "$REPO_ROOT/scripts/agent_coordination_check.sh" \
    --output "test.txt" \
    --timeout 1800 \
    > "$TEST_OUTPUT_DIR/coord_no_task.log" 2>&1; then
    log_fail "Should have rejected missing task"
else
    log_pass "Correctly rejected missing task"
fi

log_test "Coordination validator rejects missing output"
if bash "$REPO_ROOT/scripts/agent_coordination_check.sh" \
    --task "Test task" \
    --timeout 1800 \
    > "$TEST_OUTPUT_DIR/coord_no_output.log" 2>&1; then
    log_fail "Should have rejected missing output"
else
    log_pass "Correctly rejected missing output"
fi

log_test "Coordination validator accepts valid agent spec"
# Clean up any existing tracking
rm -f "$REPO_ROOT/.claude/agent_tracking"/*.active 2>/dev/null || true

if bash "$REPO_ROOT/scripts/agent_coordination_check.sh" \
    --task "Test validation task" \
    --output "test_output.txt" \
    --timeout 1800 \
    --agent-id "test-agent-001" \
    > "$TEST_OUTPUT_DIR/coord_valid.log" 2>&1; then
    log_pass "Accepted valid agent specification"

    # Clean up tracking file
    rm -f "$REPO_ROOT/.claude/agent_tracking/test-agent-001.active"
else
    log_fail "Rejected valid agent specification"
fi

log_test "Coordination validator detects parallel agents"
# Create fake active agent
mkdir -p "$REPO_ROOT/.claude/agent_tracking"
cat > "$REPO_ROOT/.claude/agent_tracking/existing-agent.active" <<EOF
AGENT_ID: existing-agent
TASK: Existing task
OUTPUT: output.txt
STARTED: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

if bash "$REPO_ROOT/scripts/agent_coordination_check.sh" \
    --task "Second agent task" \
    --output "output2.txt" \
    --timeout 1800 \
    --agent-id "second-agent" \
    > "$TEST_OUTPUT_DIR/coord_parallel.log" 2>&1; then
    log_fail "Should have detected parallel agent"
else
    log_pass "Detected parallel agent conflict"
fi

# Clean up
rm -f "$REPO_ROOT/.claude/agent_tracking/existing-agent.active"

#
# TEST SUITE 4: POST-ACTION VALIDATION
#
banner "Test Suite 4: Post-Action Validation"

log_test "Post-action validation script exists and is executable"
if [[ -x "$REPO_ROOT/scripts/post_action_validate.sh" ]]; then
    log_pass "Script found and executable"
else
    log_fail "Script not found or not executable"
fi

log_test "Post-action validator detects missing output"
if bash "$REPO_ROOT/scripts/post_action_validate.sh" \
    --type agent \
    --output "nonexistent_file.txt" \
    > "$TEST_OUTPUT_DIR/postaction_missing.log" 2>&1; then
    log_fail "Should have detected missing output"
else
    log_pass "Detected missing output file"
fi

log_test "Post-action validator accepts existing output"
# Create test file
TEST_FILE="$TEST_OUTPUT_DIR/test_output.txt"
echo "Test content" > "$TEST_FILE"

if bash "$REPO_ROOT/scripts/post_action_validate.sh" \
    --type file \
    --output "$TEST_FILE" \
    > "$TEST_OUTPUT_DIR/postaction_valid.log" 2>&1; then
    log_pass "Accepted existing output"
else
    EXIT_CODE=$?
    if [[ $EXIT_CODE -eq 2 ]]; then
        log_pass "Passed with warnings (acceptable)"
    else
        log_fail "Rejected existing output"
    fi
fi

log_test "Post-action validator detects invalid JSON"
# Create invalid JSON
INVALID_JSON="$TEST_OUTPUT_DIR/invalid.json"
echo "{ not valid json }" > "$INVALID_JSON"

if bash "$REPO_ROOT/scripts/post_action_validate.sh" \
    --type file \
    --output "$INVALID_JSON" \
    > "$TEST_OUTPUT_DIR/postaction_invalid_json.log" 2>&1; then
    if command -v jq >/dev/null 2>&1; then
        log_fail "Should have detected invalid JSON"
    else
        log_pass "JSON validation skipped (jq not available)"
    fi
else
    log_pass "Detected invalid JSON"
fi

log_test "Post-action validator accepts valid JSON"
# Create valid JSON
VALID_JSON="$TEST_OUTPUT_DIR/valid.json"
echo '{"test": "data", "value": 123}' > "$VALID_JSON"

if bash "$REPO_ROOT/scripts/post_action_validate.sh" \
    --type file \
    --output "$VALID_JSON" \
    > "$TEST_OUTPUT_DIR/postaction_valid_json.log" 2>&1; then
    log_pass "Accepted valid JSON"
else
    EXIT_CODE=$?
    if [[ $EXIT_CODE -eq 2 ]]; then
        log_pass "Passed with warnings (acceptable)"
    else
        log_fail "Rejected valid JSON"
    fi
fi

#
# TEST SUITE 5: SESSION MONITOR
#
banner "Test Suite 5: Session Monitor"

log_test "Session monitor script exists and is executable"
if [[ -x "$REPO_ROOT/scripts/session_monitor.sh" ]]; then
    log_pass "Script found and executable"
else
    log_fail "Script not found or not executable"
fi

log_test "Session monitor can start"
# Start monitor in background
if bash "$REPO_ROOT/scripts/session_monitor.sh" > "$TEST_OUTPUT_DIR/monitor.log" 2>&1 &
then
    MONITOR_PID=$!
    sleep 2

    if kill -0 $MONITOR_PID 2>/dev/null; then
        log_pass "Monitor started successfully"

        # Stop monitor
        kill $MONITOR_PID 2>/dev/null || true
        wait $MONITOR_PID 2>/dev/null || true
    else
        log_fail "Monitor failed to start or crashed immediately"
    fi
else
    log_fail "Failed to start monitor"
fi

#
# FINAL REPORT
#
banner "Test Results Summary"

echo ""
echo "Tests Run:    $TESTS_RUN"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}✓ ALL TESTS PASSED${NC}"
    echo ""
    echo "Validation system is ready for production use"
    exit 0
else
    echo -e "${RED}${BOLD}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Review failures above and fix issues"
    echo ""
    echo "Test outputs saved to: $TEST_OUTPUT_DIR"
    exit 1
fi
