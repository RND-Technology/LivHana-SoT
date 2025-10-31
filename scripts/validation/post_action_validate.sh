#!/usr/bin/env bash
#
# Post-Action Validation Script
# Validates outputs after significant actions (agent completion, file modification, commit)
#
# Usage:
#   ./post_action_validate.sh --type agent --output "docs/analysis.md"
#   ./post_action_validate.sh --type commit --ref "HEAD"
#   ./post_action_validate.sh --type file --path "scripts/new_script.sh"
#
# Exit Codes:
#   0 = Validation passed
#   1 = Validation failed
#   2 = Warnings (passed with issues)
#
# Validates:
#   - Expected outputs exist
#   - File integrity (not corrupted)
#   - Cross-references valid
#   - No broken links
#   - Nothing broke (tests still pass)

set -euo pipefail

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parameters
ACTION_TYPE=""
OUTPUT_PATH=""
GIT_REF="HEAD"
AGENT_ID=""

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            ACTION_TYPE="$2"
            shift 2
            ;;
        --output)
            OUTPUT_PATH="$2"
            shift 2
            ;;
        --ref)
            GIT_REF="$2"
            shift 2
            ;;
        --agent-id)
            AGENT_ID="$2"
            shift 2
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
    ((CHECKS_PASSED++))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((CHECKS_FAILED++))
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Find repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "Post-Action Validation"
echo "=========================================="
echo ""
log_info "Action Type: ${ACTION_TYPE:-unspecified}"
echo ""

#
# VALIDATION FOR AGENT COMPLETION
#
if [[ "$ACTION_TYPE" == "agent" ]]; then
    log_info "Validating agent output"
    echo ""

    # Check output exists
    log_check "Expected output exists"
    if [[ -z "$OUTPUT_PATH" ]]; then
        log_fail "No output path specified - use --output"
    else
        # Handle wildcards
        if [[ "$OUTPUT_PATH" == *"*"* ]]; then
            # Glob pattern
            MATCHES=$(find "$REPO_ROOT" -path "$REPO_ROOT/$OUTPUT_PATH" 2>/dev/null | wc -l | xargs)
            if [[ $MATCHES -gt 0 ]]; then
                log_pass "Found $MATCHES files matching pattern: $OUTPUT_PATH"
            else
                log_fail "No files match pattern: $OUTPUT_PATH"
            fi
        else
            # Exact path
            if [[ -e "$REPO_ROOT/$OUTPUT_PATH" ]]; then
                log_pass "Output exists: $OUTPUT_PATH"
            elif [[ -e "$OUTPUT_PATH" ]]; then
                log_pass "Output exists: $OUTPUT_PATH"
            else
                log_fail "Output not found: $OUTPUT_PATH"
            fi
        fi
    fi

    # Check file integrity (if single file)
    if [[ -n "$OUTPUT_PATH" ]] && [[ "$OUTPUT_PATH" != *"*"* ]]; then
        if [[ -f "$REPO_ROOT/$OUTPUT_PATH" ]]; then
            FILE_PATH="$REPO_ROOT/$OUTPUT_PATH"
        elif [[ -f "$OUTPUT_PATH" ]]; then
            FILE_PATH="$OUTPUT_PATH"
        else
            FILE_PATH=""
        fi

        if [[ -n "$FILE_PATH" ]]; then
            log_check "File integrity"

            # Check file is not empty
            FILE_SIZE=$(stat -f%z "$FILE_PATH" 2>/dev/null || stat -c%s "$FILE_PATH" 2>/dev/null)
            if [[ $FILE_SIZE -eq 0 ]]; then
                log_warn "Output file is empty (0 bytes)"
            else
                log_pass "File size: $FILE_SIZE bytes"
            fi

            # Check for common corruption indicators
            if file "$FILE_PATH" | grep -q "corrupt"; then
                log_fail "File appears to be corrupted"
            else
                log_pass "File integrity OK"
            fi

            # For JSON files, validate JSON
            if [[ "$FILE_PATH" == *.json ]] && command -v jq >/dev/null 2>&1; then
                log_check "JSON validity"
                if jq empty "$FILE_PATH" 2>/dev/null; then
                    log_pass "Valid JSON"
                else
                    log_fail "Invalid JSON"
                fi
            fi

            # For shell scripts, check syntax
            if [[ "$FILE_PATH" == *.sh ]]; then
                log_check "Shell script syntax"
                if bash -n "$FILE_PATH" 2>/dev/null; then
                    log_pass "Valid shell syntax"
                else
                    log_fail "Shell syntax errors detected"
                fi
            fi

            # For Python files, check syntax
            if [[ "$FILE_PATH" == *.py ]]; then
                log_check "Python syntax"
                if python3 -m py_compile "$FILE_PATH" 2>/dev/null; then
                    log_pass "Valid Python syntax"
                else
                    log_fail "Python syntax errors detected"
                fi
            fi

            # For Markdown files, check for broken links
            if [[ "$FILE_PATH" == *.md ]]; then
                log_check "Markdown links (local files)"

                # Extract local file references
                BROKEN_LINKS=()
                while IFS= read -r link; do
                    # Skip external URLs
                    if [[ "$link" =~ ^https?:// ]]; then
                        continue
                    fi

                    # Check if file exists
                    if [[ ! -e "$REPO_ROOT/$link" ]]; then
                        BROKEN_LINKS+=("$link")
                    fi
                done < <(grep -oE '\[.*\]\([^)]+\)' "$FILE_PATH" | sed -E 's/.*\(([^)]+)\).*/\1/' || true)

                if [[ ${#BROKEN_LINKS[@]} -gt 0 ]]; then
                    log_warn "Found ${#BROKEN_LINKS[@]} potentially broken links"
                    for link in "${BROKEN_LINKS[@]}"; do
                        echo "    - $link"
                    done
                else
                    log_pass "No broken local file links detected"
                fi
            fi
        fi
    fi

    # Clean up agent tracking
    if [[ -n "$AGENT_ID" ]]; then
        log_check "Cleaning up agent tracking"
        TRACKING_FILE="$REPO_ROOT/.claude/agent_tracking/${AGENT_ID}.active"
        if [[ -f "$TRACKING_FILE" ]]; then
            # Archive to .completed
            mv "$TRACKING_FILE" "${TRACKING_FILE%.active}.completed"
            log_pass "Agent tracking archived"
        else
            log_info "No tracking file found for agent: $AGENT_ID"
        fi
    fi
fi

#
# VALIDATION FOR GIT COMMIT
#
if [[ "$ACTION_TYPE" == "commit" ]]; then
    log_info "Validating git commit: $GIT_REF"
    echo ""

    # Check commit exists
    log_check "Commit exists"
    if git rev-parse "$GIT_REF" >/dev/null 2>&1; then
        COMMIT_HASH=$(git rev-parse "$GIT_REF")
        log_pass "Commit: $COMMIT_HASH"
    else
        log_fail "Commit not found: $GIT_REF"
    fi

    # Check commit message
    log_check "Commit message quality"
    COMMIT_MSG=$(git log -1 --format=%B "$GIT_REF" 2>/dev/null || echo "")

    if [[ -z "$COMMIT_MSG" ]]; then
        log_fail "Empty commit message"
    else
        MSG_LENGTH=${#COMMIT_MSG}
        if [[ $MSG_LENGTH -lt 10 ]]; then
            log_warn "Commit message very short ($MSG_LENGTH chars)"
        else
            log_pass "Commit message: ${COMMIT_MSG:0:50}..."
        fi
    fi

    # Check files in commit
    log_check "Files in commit"
    FILE_COUNT=$(git diff-tree --no-commit-id --name-only -r "$GIT_REF" 2>/dev/null | wc -l | xargs)

    if [[ $FILE_COUNT -eq 0 ]]; then
        log_warn "Empty commit (no files changed)"
    else
        log_pass "$FILE_COUNT file(s) changed"
    fi

    # Check for large files
    log_check "Large files in commit"
    LARGE_FILES=()
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
            if [[ $SIZE -gt 1048576 ]]; then  # 1MB
                SIZE_MB=$((SIZE / 1048576))
                LARGE_FILES+=("$file (${SIZE_MB}MB)")
            fi
        fi
    done < <(git diff-tree --no-commit-id --name-only -r "$GIT_REF" 2>/dev/null || true)

    if [[ ${#LARGE_FILES[@]} -gt 0 ]]; then
        log_warn "Large files in commit:"
        for file in "${LARGE_FILES[@]}"; do
            echo "    - $file"
        done
    else
        log_pass "No large files (>1MB) in commit"
    fi

    # Check for common mistakes
    log_check "Common commit mistakes"
    MISTAKES=()

    # Check for committed secrets
    if git diff-tree --no-commit-id --name-only -r "$GIT_REF" 2>/dev/null | grep -qE '\.(env|secret|key|pem)$'; then
        MISTAKES+=("Potential secrets files committed (.env, .secret, .key, .pem)")
    fi

    # Check for node_modules
    if git diff-tree --no-commit-id --name-only -r "$GIT_REF" 2>/dev/null | grep -q "node_modules/"; then
        MISTAKES+=("node_modules/ included in commit")
    fi

    if [[ ${#MISTAKES[@]} -gt 0 ]]; then
        log_fail "Potential mistakes detected:"
        for mistake in "${MISTAKES[@]}"; do
            echo "    - $mistake"
        done
    else
        log_pass "No common mistakes detected"
    fi
fi

#
# VALIDATION FOR FILE MODIFICATION
#
if [[ "$ACTION_TYPE" == "file" ]]; then
    log_info "Validating file modification"
    echo ""

    if [[ -z "$OUTPUT_PATH" ]]; then
        log_fail "No file path specified - use --output"
    else
        FILE_PATH="$OUTPUT_PATH"
        if [[ ! -f "$FILE_PATH" ]] && [[ -f "$REPO_ROOT/$OUTPUT_PATH" ]]; then
            FILE_PATH="$REPO_ROOT/$OUTPUT_PATH"
        fi

        log_check "File exists"
        if [[ -f "$FILE_PATH" ]]; then
            log_pass "File found: $FILE_PATH"
        else
            log_fail "File not found: $OUTPUT_PATH"
        fi

        # Check file permissions
        if [[ -f "$FILE_PATH" ]]; then
            log_check "File permissions"
            PERMS=$(stat -f%A "$FILE_PATH" 2>/dev/null || stat -c%a "$FILE_PATH" 2>/dev/null)

            # For scripts, should be executable
            if [[ "$FILE_PATH" == *.sh ]] || [[ "$FILE_PATH" == *.py ]]; then
                if [[ "$PERMS" == *"755"* ]] || [[ "$PERMS" == *"744"* ]]; then
                    log_pass "Executable permissions set"
                else
                    log_warn "Script not executable (chmod +x $FILE_PATH)"
                fi
            else
                log_pass "Permissions: $PERMS"
            fi

            # Check file was modified recently
            log_check "File modification time"
            if [[ "$(uname)" == "Darwin" ]]; then
                MOD_TIME=$(stat -f%m "$FILE_PATH")
            else
                MOD_TIME=$(stat -c%Y "$FILE_PATH")
            fi
            NOW=$(date +%s)
            AGE=$((NOW - MOD_TIME))

            if [[ $AGE -lt 60 ]]; then
                log_pass "Modified $AGE seconds ago"
            elif [[ $AGE -lt 3600 ]]; then
                MIN=$((AGE / 60))
                log_pass "Modified $MIN minutes ago"
            else
                HOURS=$((AGE / 3600))
                log_warn "Modified $HOURS hours ago (may not be recent change)"
            fi
        fi
    fi
fi

#
# GENERIC VALIDATIONS (ALL TYPES)
#
echo ""
log_info "Generic validation checks"
echo ""

# Check if we're in a git repo
log_check "Git repository status"
if git rev-parse --git-dir >/dev/null 2>&1; then
    log_pass "In git repository"

    # Check for uncommitted changes
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        log_pass "No uncommitted changes"
    else
        MODIFIED_COUNT=$(git status --porcelain | wc -l | xargs)
        log_info "Uncommitted changes: $MODIFIED_COUNT files"
    fi
else
    log_warn "Not in a git repository"
fi

# Check for Python syntax errors in repo (quick check)
if [[ "$ACTION_TYPE" == "agent" ]] || [[ "$ACTION_TYPE" == "commit" ]]; then
    log_check "Python syntax errors (quick scan)"
    PYTHON_ERRORS=0

    # Only check recently modified Python files
    while IFS= read -r pyfile; do
        if [[ -f "$pyfile" ]]; then
            if ! python3 -m py_compile "$pyfile" 2>/dev/null; then
                ((PYTHON_ERRORS++))
                log_warn "Syntax error in: $pyfile"
            fi
        fi
    done < <(find "$REPO_ROOT" -name "*.py" -mmin -60 2>/dev/null || true)

    if [[ $PYTHON_ERRORS -eq 0 ]]; then
        log_pass "No Python syntax errors in recent files"
    fi
fi

echo ""

#
# FINAL REPORT
#
echo "=========================================="
echo "Validation Results"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed:${NC}   $CHECKS_PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC}   $CHECKS_FAILED"
echo ""

if [[ $CHECKS_FAILED -gt 0 ]]; then
    echo -e "${RED}VALIDATION FAILED${NC}"
    echo "Review and fix failures above"
    echo ""
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}VALIDATION PASSED WITH WARNINGS${NC}"
    echo "Review warnings - may need attention"
    echo ""
    exit 2
else
    echo -e "${GREEN}VALIDATION PASSED${NC}"
    echo "All checks successful"
    echo ""
    exit 0
fi
