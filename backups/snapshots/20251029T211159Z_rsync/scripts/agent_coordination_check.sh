#!/usr/bin/env bash
#
# Agent Coordination Validator
# Validates agent coordination rules BEFORE launching any agent
#
# Usage:
#   ./agent_coordination_check.sh --task "Extract TRUTH pipeline" \
#                                  --output "docs/TRUTH_PIPELINE_MASTER/" \
#                                  --timeout 1800 \
#                                  --agent-id "agent-001"
#
# Exit Codes:
#   0 = Safe to launch agent
#   1 = Cannot launch - coordination violations
#   2 = Warning - can launch with caution
#
# Based on: AGENT_DEPLOYMENT_FORENSIC_ANALYSIS_2025-10-21.md
# Prevents: Parallel agent conflicts, overlapping work, resource contention

set -euo pipefail

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parameters (defaults)
TASK=""
OUTPUT=""
TIMEOUT=3600  # 1 hour default
AGENT_ID=""
PARENT_AGENT_ID=""
MAX_PARALLEL=1
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --task)
            TASK="$2"
            shift 2
            ;;
        --output)
            OUTPUT="$2"
            shift 2
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --agent-id)
            AGENT_ID="$2"
            shift 2
            ;;
        --parent)
            PARENT_AGENT_ID="$2"
            shift 2
            ;;
        --max-parallel)
            MAX_PARALLEL="$2"
            shift 2
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging
log_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Find repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Agent tracking directory
AGENT_TRACKING_DIR="$REPO_ROOT/.claude/agent_tracking"
mkdir -p "$AGENT_TRACKING_DIR"

echo "=========================================="
echo "Agent Coordination Validator"
echo "=========================================="
echo ""

VALIDATION_FAILED=false

#
# CHECK 1: Task Specification
#
log_check "Task specification provided"
if [[ -z "$TASK" ]]; then
    log_fail "No task specified - use --task 'description'"
    echo "  Agent must have clear task specification"
    echo "  Example: --task 'Extract TRUTH pipeline from copilot file'"
    VALIDATION_FAILED=true
else
    # Check task is not too vague
    TASK_LENGTH=${#TASK}
    if [[ $TASK_LENGTH -lt 10 ]]; then
        log_warn "Task description too short ($TASK_LENGTH chars) - be more specific"
        echo "  Task: $TASK"
    else
        log_pass "Task specified: $TASK"
    fi
fi

#
# CHECK 2: Expected Output Definition
#
log_check "Expected output defined"
if [[ -z "$OUTPUT" ]]; then
    log_fail "No expected output specified - use --output 'path/to/output'"
    echo "  Agent must have clear deliverable specification"
    echo "  Examples:"
    echo "    --output 'docs/analysis.md'"
    echo "    --output 'scripts/extract_*.sh'"
    echo "    --output '.claude/agent_reports/'"
    VALIDATION_FAILED=true
else
    log_pass "Expected output: $OUTPUT"
fi

#
# CHECK 3: Timeout Configuration
#
log_check "Timeout configured"
if [[ -z "$TIMEOUT" ]] || [[ "$TIMEOUT" -le 0 ]]; then
    log_fail "Invalid timeout - use --timeout <seconds>"
    echo "  Agents must have timeout to prevent runaway processes"
    echo "  Typical values: 1800 (30min), 3600 (1hr), 7200 (2hr)"
    VALIDATION_FAILED=true
else
    TIMEOUT_MIN=$((TIMEOUT / 60))
    if [[ $TIMEOUT_MIN -gt 120 ]]; then
        log_warn "Timeout very long ($TIMEOUT_MIN minutes) - consider shorter"
    else
        log_pass "Timeout: $TIMEOUT_MIN minutes"
    fi
fi

#
# CHECK 4: Agent ID Specified
#
log_check "Agent ID specified"
if [[ -z "$AGENT_ID" ]]; then
    # Generate one
    AGENT_ID="agent-$(date +%s)"
    log_warn "No agent ID specified - generated: $AGENT_ID"
    echo "  Use --agent-id for explicit tracking"
else
    log_pass "Agent ID: $AGENT_ID"
fi

#
# CHECK 5: Check for Other Running Agents
#
log_check "Checking for other running agents"

# Count active agent tracking files
ACTIVE_AGENTS=$(find "$AGENT_TRACKING_DIR" -name "*.active" 2>/dev/null | wc -l | xargs)

if [[ $ACTIVE_AGENTS -ge $MAX_PARALLEL ]]; then
    log_fail "Too many agents running: $ACTIVE_AGENTS (max $MAX_PARALLEL)"
    echo "  Active agents:"
    for agent_file in "$AGENT_TRACKING_DIR"/*.active; do
        if [[ -f "$agent_file" ]]; then
            AGENT_NAME=$(basename "$agent_file" .active)
            AGENT_TASK=$(grep "TASK:" "$agent_file" 2>/dev/null | cut -d: -f2- || echo "unknown")
            AGENT_STARTED=$(stat -f %SB -t "%Y-%m-%d %H:%M:%S" "$agent_file" 2>/dev/null || stat -c %y "$agent_file" 2>/dev/null | cut -d. -f1)
            echo "    - $AGENT_NAME (started $AGENT_STARTED)"
            echo "      Task: $AGENT_TASK"
        fi
    done
    echo ""
    echo "  Options:"
    echo "    1. Wait for current agent to complete"
    echo "    2. Use --max-parallel 2 to allow parallel execution (NOT RECOMMENDED)"
    echo "    3. Use --force to override (DANGEROUS)"

    if [[ "$FORCE" == "false" ]]; then
        VALIDATION_FAILED=true
    else
        log_warn "Overriding parallel agent check with --force"
    fi
elif [[ $ACTIVE_AGENTS -gt 0 ]]; then
    log_warn "$ACTIVE_AGENTS agent(s) already running"
    for agent_file in "$AGENT_TRACKING_DIR"/*.active; do
        if [[ -f "$agent_file" ]]; then
            AGENT_NAME=$(basename "$agent_file" .active)
            echo "    - $AGENT_NAME"
        fi
    done
else
    log_pass "No other agents currently running"
fi

#
# CHECK 6: Check for Task Overlap
#
log_check "Checking for overlapping tasks"

if [[ $ACTIVE_AGENTS -gt 0 ]]; then
    OVERLAP_DETECTED=false

    for agent_file in "$AGENT_TRACKING_DIR"/*.active; do
        if [[ -f "$agent_file" ]]; then
            EXISTING_TASK=$(grep "TASK:" "$agent_file" | cut -d: -f2- || echo "")
            EXISTING_OUTPUT=$(grep "OUTPUT:" "$agent_file" | cut -d: -f2- || echo "")

            # Check if tasks are similar (simple substring match)
            if [[ -n "$EXISTING_TASK" ]] && [[ "$TASK" == *"$EXISTING_TASK"* ]] || [[ "$EXISTING_TASK" == *"$TASK"* ]]; then
                log_warn "Task overlap detected with existing agent"
                echo "    Existing: $EXISTING_TASK"
                echo "    New:      $TASK"
                OVERLAP_DETECTED=true
            fi

            # Check if outputs conflict
            if [[ -n "$EXISTING_OUTPUT" ]] && [[ "$OUTPUT" == "$EXISTING_OUTPUT" ]]; then
                log_fail "Output conflict - both agents writing to: $OUTPUT"
                echo "    This will cause file conflicts"
                VALIDATION_FAILED=true
            fi
        fi
    done

    if [[ "$OVERLAP_DETECTED" == "true" ]]; then
        log_warn "Consider coordinating tasks to avoid duplication"
    fi
else
    log_pass "No task overlap (no other agents)"
fi

#
# CHECK 7: Validate Output Location
#
log_check "Validating output location"

if [[ -n "$OUTPUT" ]]; then
    # Check if output location is in repo
    if [[ "$OUTPUT" == /* ]]; then
        # Absolute path
        if [[ "$OUTPUT" != "$REPO_ROOT"* ]]; then
            log_warn "Output location outside repo: $OUTPUT"
            echo "    Consider using relative path within repo"
        else
            log_pass "Output location in repo"
        fi
    else
        # Relative path - resolve it
        OUTPUT_ABS="$REPO_ROOT/$OUTPUT"
        log_info "Output will be: $OUTPUT_ABS"
    fi

    # Check if output location already exists
    if [[ -e "$OUTPUT" ]] || [[ -e "$REPO_ROOT/$OUTPUT" ]]; then
        log_warn "Output location already exists - agent may overwrite"
        echo "    Consider backing up or using different output location"
    fi
fi

#
# CHECK 8: Resource Availability
#
log_check "Checking resource availability"

# Check disk space
if [[ "$(uname)" == "Darwin" ]]; then
    DISK_AVAIL_GB=$(df -g "$REPO_ROOT" | awk 'NR==2 {print $4}')
    if [[ $DISK_AVAIL_GB -lt 5 ]]; then
        log_warn "Low disk space: ${DISK_AVAIL_GB}GB available"
    else
        log_pass "Disk space: ${DISK_AVAIL_GB}GB available"
    fi
fi

# Check memory
if command -v vm_stat >/dev/null 2>&1; then
    FREE_PAGES=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.' || echo 0)
    if [[ $FREE_PAGES -gt 0 ]]; then
        FREE_GB=$((FREE_PAGES * 4096 / 1024 / 1024 / 1024))
        if [[ $FREE_GB -lt 2 ]]; then
            log_warn "Low memory: ~${FREE_GB}GB free"
        else
            log_pass "Memory: ~${FREE_GB}GB free"
        fi
    fi
fi

echo ""

#
# FINAL DECISION
#
if [[ "$VALIDATION_FAILED" == "true" ]]; then
    echo "=========================================="
    echo -e "${RED}AGENT LAUNCH BLOCKED${NC}"
    echo "=========================================="
    echo ""
    echo "Fix validation failures above before launching agent"
    echo ""
    exit 1
else
    echo "=========================================="
    echo -e "${GREEN}SAFE TO LAUNCH AGENT${NC}"
    echo "=========================================="
    echo ""

    # Create tracking file
    TRACKING_FILE="$AGENT_TRACKING_DIR/${AGENT_ID}.active"
    cat > "$TRACKING_FILE" <<EOF
AGENT_ID: $AGENT_ID
TASK: $TASK
OUTPUT: $OUTPUT
TIMEOUT: $TIMEOUT
PARENT: $PARENT_AGENT_ID
STARTED: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

    log_info "Agent tracking created: $TRACKING_FILE"
    echo ""
    echo "Agent Details:"
    echo "  ID:      $AGENT_ID"
    echo "  Task:    $TASK"
    echo "  Output:  $OUTPUT"
    echo "  Timeout: $TIMEOUT_MIN minutes"
    echo ""
    echo "To complete agent, run:"
    echo "  rm $TRACKING_FILE"
    echo ""

    exit 0
fi
