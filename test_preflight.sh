#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Exit code tracking
CRITICAL_FAILURES=0
WARNINGS=0
CHECKS_PASSED=0

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
    ((CRITICAL_FAILURES++))
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo "Testing ANTHROPIC_API_KEY check..."

ANTHROPIC_API_KEY="local-claude-mode-active"

log_check "ANTHROPIC_API_KEY present"
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
    log_fail "ANTHROPIC_API_KEY not set - Claude CLI will not work"
    echo "  Fix: export ANTHROPIC_API_KEY='sk-ant-...'"
else
    # Check format - either real key or placeholder
    if [[ "$ANTHROPIC_API_KEY" =~ ^sk-ant-[a-zA-Z0-9_-]+$ ]] || [[ "$ANTHROPIC_API_KEY" == "local-claude-mode-active" ]]; then
        log_pass "ANTHROPIC_API_KEY set and valid format"
    else
        log_warn "ANTHROPIC_API_KEY has unexpected format"
    fi
fi

echo "Test completed successfully!"
