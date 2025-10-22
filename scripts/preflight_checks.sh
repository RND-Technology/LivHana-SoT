#!/usr/bin/env bash
#
# Pre-Flight Checks for Claude Tier-1 Boot System
# Validates environment, services, dependencies, and configuration
# BEFORE session starts to prevent crashes from missing resources
#
# Exit Codes:
#   0 = All checks pass (safe to proceed)
#   1 = Critical failure (CANNOT proceed - will crash)
#   2 = Warning (CAN proceed with degraded functionality)
#
# Based on: AGENT_DEPLOYMENT_FORENSIC_ANALYSIS_2025-10-21.md
# Prevents repeat of crash #1 (missing OPENAI_API_KEY) and crash #2 (service failures)

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
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Banner
echo "=========================================="
echo "Pre-Flight Checks for Claude Tier-1 Boot"
echo "=========================================="
echo ""

#
# CATEGORY 1: ENVIRONMENT VARIABLES (CRITICAL)
# Prevents: OPENAI_API_KEY missing (Crash #1 root cause)
#
log_info "Category 1: Environment Variables"
echo ""

# Check OPENAI_API_KEY (OPTIONAL - fallback only, Whisper is primary)
log_check "OPENAI_API_KEY present (optional fallback)"
if [[ -z "${OPENAI_API_KEY:-}" ]]; then
    log_warn "OPENAI_API_KEY not set - voice fallback disabled (Whisper STT is primary, this is OK)"
    echo "  Note: Only needed if Whisper fails; not critical for normal operation"
else
    # Validate format (starts with sk- or sk-proj- or local-voice-mode-active)
    if [[ "$OPENAI_API_KEY" =~ ^sk-[a-zA-Z0-9_-]+$ ]] || [[ "$OPENAI_API_KEY" == "local-voice-mode-active" ]]; then
        log_pass "OPENAI_API_KEY set and valid format"
    else
        log_warn "OPENAI_API_KEY has unexpected format (should start with 'sk-' or be 'local-voice-mode-active')"
        echo "  Current value starts with: ${OPENAI_API_KEY:0:3}..."
    fi
fi

# Check ANTHROPIC_API_KEY
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

# Check DEEPSEEK_API_KEY
log_check "DEEPSEEK_API_KEY present"
if [[ -z "${DEEPSEEK_API_KEY:-}" ]]; then
    log_warn "DEEPSEEK_API_KEY not set - reasoning gateway may be limited"
    echo "  Fix: export DEEPSEEK_API_KEY='...'"
else
    log_pass "DEEPSEEK_API_KEY set"
fi

# Check PERPLEXITY_API_KEY
log_check "PERPLEXITY_API_KEY present"
if [[ -z "${PERPLEXITY_API_KEY:-}" ]]; then
    log_warn "PERPLEXITY_API_KEY not set - TRUTH verification step will fail"
    echo "  Fix: export PERPLEXITY_API_KEY='pplx-...'"
else
    log_pass "PERPLEXITY_API_KEY set"
fi

echo ""

#
# CATEGORY 2: SERVICES RUNNING (CRITICAL)
# Prevents: Voice mode STT timeout (Crash #1 trigger)
#
log_info "Category 2: Critical Services"
echo ""

# Check Whisper STT on port 2022
log_check "Whisper STT service on port 2022"
if curl -sf http://127.0.0.1:2022/health >/dev/null 2>&1; then
    log_pass "Whisper STT responding on port 2022"
elif curl -sf http://127.0.0.1:2022/v1/models >/dev/null 2>&1; then
    log_pass "Whisper STT responding on port 2022 (fallback check)"
elif nc -z 127.0.0.1 2022 2>/dev/null; then
    log_warn "Port 2022 open but not responding to HTTP - service may be starting"
else
    log_fail "Whisper STT not available on port 2022"
    echo "  Fix: Start Whisper service or check service status"
    echo "  Command: mcp__voicemode__service whisper status"
fi

# Check Kokoro TTS on port 8880
log_check "Kokoro TTS service on port 8880"
if curl -sf http://127.0.0.1:8880/health >/dev/null 2>&1; then
    log_pass "Kokoro TTS responding on port 8880"
elif nc -z 127.0.0.1 8880 2>/dev/null; then
    log_warn "Port 8880 open but not responding to HTTP - service may be starting"
else
    log_warn "Kokoro TTS not available on port 8880 - voice output may fail"
    echo "  Fix: mcp__voicemode__service kokoro start"
fi

# Check compliance service on port 8000 (if configured)
log_check "Compliance service on port 8000 (optional)"
if curl -sf http://127.0.0.1:8000/health >/dev/null 2>&1; then
    log_pass "Compliance service responding on port 8000"
elif nc -z 127.0.0.1 8000 2>/dev/null; then
    log_warn "Port 8000 open but compliance service not responding"
else
    log_info "Compliance service not running (optional)"
fi

echo ""

#
# CATEGORY 3: DEPENDENCIES (CRITICAL)
# Prevents: Missing Python packages causing runtime errors
#
log_info "Category 3: Dependencies"
echo ""

# Check Python 3 available
log_check "Python 3 available"
if command -v python3 >/dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    log_pass "Python $PYTHON_VERSION available"
else
    log_fail "Python 3 not found in PATH"
    echo "  Fix: Install Python 3.9+"
fi

# Check critical Python packages
log_check "Required Python packages installed"
MISSING_PACKAGES=()
REQUIRED_PACKAGES=("httpx" "pydantic" "redis" "bullmq")

for package in "${REQUIRED_PACKAGES[@]}"; do
    if python3 -c "import $package" 2>/dev/null; then
        true  # Package found
    else
        MISSING_PACKAGES+=("$package")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -eq 0 ]; then
    log_pass "All required Python packages installed"
else
    log_warn "Missing Python packages: ${MISSING_PACKAGES[*]}"
    echo "  Fix: pip install ${MISSING_PACKAGES[*]}"
fi

# Check Git available
log_check "Git available"
if command -v git >/dev/null 2>&1; then
    GIT_VERSION=$(git --version 2>&1 | awk '{print $3}')
    log_pass "Git $GIT_VERSION available"
else
    log_fail "Git not found - version control will not work"
fi

# Check curl available
log_check "curl available"
if command -v curl >/dev/null 2>&1; then
    log_pass "curl available"
else
    log_fail "curl not found - API checks will fail"
fi

# Check jq available (for JSON processing)
log_check "jq available (optional)"
if command -v jq >/dev/null 2>&1; then
    log_pass "jq available"
else
    log_info "jq not found (optional - for JSON validation)"
fi

echo ""

#
# CATEGORY 4: CONFIGURATION FILES (CRITICAL)
# Prevents: Missing config causing boot failures
#
log_info "Category 4: Configuration Files"
echo ""

# Find repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check Tier-1 boot script exists
log_check "Tier-1 boot script exists"
if [[ -f "$REPO_ROOT/scripts/claude_tier1_boot.sh" ]]; then
    log_pass "claude_tier1_boot.sh found"
else
    log_fail "claude_tier1_boot.sh not found"
    echo "  Expected: $REPO_ROOT/scripts/claude_tier1_boot.sh"
fi

# Check voice mode config
log_check "Voice mode configuration exists (optional)"
if [[ -f "$REPO_ROOT/config/voice_mode.json" ]]; then
    log_pass "voice_mode.json found"
    # Validate JSON structure
    if command -v jq >/dev/null 2>&1; then
        if jq empty "$REPO_ROOT/config/voice_mode.json" 2>/dev/null; then
            log_pass "voice_mode.json is valid JSON"
        else
            log_warn "voice_mode.json is not valid JSON"
        fi
    fi
elif [[ -f "$REPO_ROOT/.claude/voice_mode.json" ]]; then
    log_pass "voice_mode.json found in .claude/"
else
    log_info "voice_mode.json not found (optional)"
fi

# Check MCP broker config
log_check "MCP broker configuration exists (optional)"
if [[ -f "$REPO_ROOT/config/mcp_broker_config.json" ]]; then
    log_pass "mcp_broker_config.json found"
else
    log_info "mcp_broker_config.json not found (optional)"
fi

# Check truth schema
log_check "TRUTH schema exists (optional)"
if [[ -f "$REPO_ROOT/config/truth_schema.json" ]]; then
    log_pass "truth_schema.json found"
    if command -v jq >/dev/null 2>&1; then
        if jq empty "$REPO_ROOT/config/truth_schema.json" 2>/dev/null; then
            log_pass "truth_schema.json is valid JSON"
        else
            log_warn "truth_schema.json is not valid JSON"
        fi
    fi
else
    log_info "truth_schema.json not found (optional)"
fi

echo ""

#
# CATEGORY 5: GIT REPOSITORY STATE (WARNING)
# Prevents: Dirty state causing confusion
#
log_info "Category 5: Git Repository State"
echo ""

# Check if in git repo
log_check "Current directory is a git repository"
if git rev-parse --git-dir >/dev/null 2>&1; then
    log_pass "Git repository detected"

    # Check for uncommitted changes
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        log_pass "No uncommitted changes (clean state)"
    else
        log_warn "Uncommitted changes detected"
        MODIFIED_COUNT=$(git status --porcelain | wc -l | xargs)
        echo "  Modified files: $MODIFIED_COUNT"
        echo "  Note: Session will work but changes may cause confusion"
    fi

    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "Current branch: $CURRENT_BRANCH"
else
    log_warn "Not in a git repository"
fi

echo ""

#
# CATEGORY 6: RESOURCE AVAILABILITY (WARNING)
# Prevents: Resource exhaustion during session
#
log_info "Category 6: System Resources"
echo ""

# Check disk space
log_check "Disk space available"
if [[ "$(uname)" == "Darwin" ]]; then
    # macOS
    DISK_AVAIL=$(df -h . | awk 'NR==2 {print $4}')
    DISK_AVAIL_GB=$(df -g . | awk 'NR==2 {print $4}')
    if [[ $DISK_AVAIL_GB -lt 5 ]]; then
        log_warn "Low disk space: $DISK_AVAIL available"
        echo "  Consider freeing up space before long sessions"
    else
        log_pass "Disk space: $DISK_AVAIL available"
    fi
else
    # Linux
    DISK_AVAIL=$(df -h . | awk 'NR==2 {print $4}')
    log_info "Disk space: $DISK_AVAIL available"
fi

# Check memory (macOS)
if command -v vm_stat >/dev/null 2>&1; then
    log_check "Memory available"
    FREE_PAGES=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
    FREE_GB=$((FREE_PAGES * 4096 / 1024 / 1024 / 1024))
    if [[ $FREE_GB -lt 2 ]]; then
        log_warn "Low memory: ~${FREE_GB}GB free"
        echo "  Consider closing applications before long sessions"
    else
        log_pass "Memory: ~${FREE_GB}GB free"
    fi
fi

echo ""

#
# FINAL REPORT
#
echo "=========================================="
echo "Pre-Flight Check Results"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed:${NC}    $CHECKS_PASSED"
echo -e "${YELLOW}Warnings:${NC}  $WARNINGS"
echo -e "${RED}Failed:${NC}    $CRITICAL_FAILURES"
echo ""

if [[ $CRITICAL_FAILURES -gt 0 ]]; then
    echo -e "${RED}CRITICAL FAILURES DETECTED${NC}"
    echo "Cannot proceed - fix failures above before starting session"
    echo ""
    echo "Most common fixes:"
    echo "  1. Export missing API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY)"
    echo "  2. Start voice mode services:"
    echo "     mcp__voicemode__service whisper start"
    echo "     mcp__voicemode__service kokoro start"
    echo "  3. Install missing dependencies:"
    echo "     pip install httpx pydantic redis bullmq"
    echo ""
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}WARNINGS DETECTED${NC}"
    echo "Can proceed but with degraded functionality"
    echo "Review warnings above and fix if needed"
    echo ""
    exit 2
else
    echo -e "${GREEN}ALL CHECKS PASSED${NC}"
    echo "Safe to proceed with Claude Tier-1 Boot"
    echo ""
    exit 0
fi
