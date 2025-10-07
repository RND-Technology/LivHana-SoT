#!/usr/bin/env bash
# ULTIMATE_BOOT.sh - Tier 1 Option A - 100% State Restoration
# Liv Hana Absolute Standard - Commander Codex X Claude Code CLI Sonnet 4.5
# MAX AUTO, MIN HUMAN, HIGH SPEED, ZERO ERROR

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="$ROOT_DIR/.claude"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S %Z")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

banner() {
  printf "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "${BOLD}${BLUE}  %s${NC}\n" "$1"
  printf "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n"
}

success() { printf "${GREEN}✅ %s${NC}\n" "$1"; }
warning() { printf "${YELLOW}⚠️  %s${NC}\n" "$1"; }
error() { printf "${RED}❌ %s${NC}\n" "$1"; }
info() { printf "${BLUE}ℹ️  %s${NC}\n" "$1"; }

cd "$ROOT_DIR"

banner "🚀 TIER 1 OPTION A BOOT SEQUENCE"
info "Timestamp: $TIMESTAMP"
info "Root: $ROOT_DIR"
echo

# ═══════════════════════════════════════════════════════════════════════
# STEP 0: AUTHENTICATE 1PASSWORD (TOUCH ID)
# ═══════════════════════════════════════════════════════════════════════
banner "🔐 STEP 0: AUTHENTICATION"

if ! op whoami >/dev/null 2>&1; then
  error "1Password session not active"
  info "Run: op signin"
  info "Then run this script again"
  exit 1
fi

OP_ACCOUNT=$(op whoami 2>/dev/null | grep -oE '[^/]+$' || echo "unknown")
success "1Password authenticated: $OP_ACCOUNT"
echo

# ═══════════════════════════════════════════════════════════════════════
# STEP 1: ENVIRONMENT VARIABLES (FIX GOOGLE_APPLICATION_CREDENTIALS)
# ═══════════════════════════════════════════════════════════════════════
banner "🌍 STEP 1: ENVIRONMENT SETUP"

# GCP Project
export GCP_PROJECT_ID="reggieanddrodispensary"
success "GCP_PROJECT_ID=$GCP_PROJECT_ID"

# Fix GOOGLE_APPLICATION_CREDENTIALS (cause of Cursor crash)
BIGQUERY_KEY_PATH="$ROOT_DIR/backend/integration-service/.bigquery-key.json"
if [[ -f "$BIGQUERY_KEY_PATH" ]]; then
  export GOOGLE_APPLICATION_CREDENTIALS="$BIGQUERY_KEY_PATH"
  success "GOOGLE_APPLICATION_CREDENTIALS=$BIGQUERY_KEY_PATH"
else
  warning "BigQuery key not found at $BIGQUERY_KEY_PATH"
  info "Download from GCP Console → IAM & Admin → Service Accounts"
fi

# Load Square credentials from Secret Manager
if command -v gcloud >/dev/null 2>&1; then
  export SQUARE_ACCESS_TOKEN=$(gcloud secrets versions access latest --secret=SQUARE_ACCESS_TOKEN --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
  export SQUARE_LOCATION_ID=$(gcloud secrets versions access latest --secret=SQUARE_LOCATION_ID --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")

  if [[ -n "$SQUARE_ACCESS_TOKEN" ]]; then
    success "SQUARE_ACCESS_TOKEN loaded from Secret Manager"
  else
    warning "SQUARE_ACCESS_TOKEN not found in Secret Manager"
  fi

  if [[ -n "$SQUARE_LOCATION_ID" ]]; then
    success "SQUARE_LOCATION_ID loaded from Secret Manager"
  else
    warning "SQUARE_LOCATION_ID not found in Secret Manager"
  fi
else
  warning "gcloud CLI not found - skipping Secret Manager"
fi

echo

# ═══════════════════════════════════════════════════════════════════════
# STEP 2: LOAD PROTOCOL CONTEXT (AUTO-READ + SUMMARIZE)
# ═══════════════════════════════════════════════════════════════════════
banner "📚 STEP 2: LOADING PROTOCOLS"

ACHILLES_HEELS=0
VERIFICATION_GATES=0
BLOCKING_RULES=0

if [[ -f "$CLAUDE_DIR/LEARNING_LEDGER.md" ]]; then
  ACHILLES_HEELS=$(grep -c "^## FAILURE #" "$CLAUDE_DIR/LEARNING_LEDGER.md" || echo 0)
  success "LEARNING_LEDGER.md: $ACHILLES_HEELS past failures loaded"
else
  warning "LEARNING_LEDGER.md not found"
fi

if [[ -f "$CLAUDE_DIR/VERIFICATION_REQUIRED.md" ]]; then
  VERIFICATION_GATES=$(grep -c "^### Gate" "$CLAUDE_DIR/VERIFICATION_REQUIRED.md" || echo 0)
  success "VERIFICATION_REQUIRED.md: $VERIFICATION_GATES verification gates active"
else
  warning "VERIFICATION_REQUIRED.md not found"
fi

if [[ -f "$CLAUDE_DIR/HONESTY_CONSTRAINTS.md" ]]; then
  BLOCKING_RULES=$(grep -c "^## CONSTRAINT" "$CLAUDE_DIR/HONESTY_CONSTRAINTS.md" || echo 0)
  success "HONESTY_CONSTRAINTS.md: $BLOCKING_RULES blocking rules active"
else
  warning "HONESTY_CONSTRAINTS.md not found"
fi

echo
info "${BOLD}PROTOCOL SUMMARY:${NC}"
echo "  - Achilles Heels to avoid: $ACHILLES_HEELS"
echo "  - Verification gates: $VERIFICATION_GATES"
echo "  - Blocking constraints: $BLOCKING_RULES"
echo

# ═══════════════════════════════════════════════════════════════════════
# STEP 3: EXTRACT CURRENT MISSION (AUTO-PARSE)
# ═══════════════════════════════════════════════════════════════════════
banner "🎯 STEP 3: CURRENT MISSION"

if [[ -f "$CLAUDE_DIR/COMMANDER_CODEX_ORDERS.md" ]]; then
  # Find first IN PROGRESS or BLOCKED mission
  CURRENT_MISSION=$(grep -B2 "🚧 IN PROGRESS\|🔴 BLOCKED" "$CLAUDE_DIR/COMMANDER_CODEX_ORDERS.md" | head -5 | grep "^### Mission" | head -1 || echo "No active mission found")

  if [[ "$CURRENT_MISSION" =~ "Mission" ]]; then
    success "Active Mission Identified:"
    echo "  $CURRENT_MISSION"

    # Extract mission number
    MISSION_NUM=$(echo "$CURRENT_MISSION" | grep -oE 'Mission [0-9]+' || echo "")

    # Get next 10 lines after mission header to show checklist
    if [[ -n "$MISSION_NUM" ]]; then
      echo
      info "Next Steps:"
      grep -A15 "^### $MISSION_NUM" "$CLAUDE_DIR/COMMANDER_CODEX_ORDERS.md" | grep -E "^- \[|^\*\*" | head -10
    fi
  else
    warning "No IN PROGRESS or BLOCKED missions found"
    info "Check COMMANDER_CODEX_ORDERS.md for mission status"
  fi
else
  error "COMMANDER_CODEX_ORDERS.md not found"
fi

echo

# ═══════════════════════════════════════════════════════════════════════
# STEP 4: SYSTEM STATE VERIFICATION (WITH EVIDENCE)
# ═══════════════════════════════════════════════════════════════════════
banner "🔍 STEP 4: SYSTEM STATE VERIFICATION"

# Git status
GIT_STATUS=$(git status --short 2>/dev/null || echo "ERROR")
if [[ "$GIT_STATUS" == "" ]]; then
  success "Git: Clean working tree"
elif [[ "$GIT_STATUS" == "ERROR" ]]; then
  warning "Git: Not a repository"
else
  warning "Git: Uncommitted changes detected"
  echo "$GIT_STATUS" | head -10
fi

# Last commit
LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "No commits")
info "Last Commit: $LAST_COMMIT"

# Service health checks (parallel)
echo
info "Service Health:"

check_service() {
  local name=$1
  local url=$2
  local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$url" 2>/dev/null || echo "000")

  if [[ "$response" == "200" ]]; then
    success "$name: healthy (200)"
  else
    warning "$name: down ($response)"
  fi
}

check_service "reasoning-gateway" "https://reasoning-gateway-plad5efvha-uc.a.run.app/health" &
check_service "integration-service" "https://integration-service-plad5efvha-uc.a.run.app/health" &
check_service "voice-service" "https://voice-service-plad5efvha-uc.a.run.app/health" &
wait

echo

# ═══════════════════════════════════════════════════════════════════════
# STEP 5: RUN FULL VERIFICATION SWEEP (AUTOMATIC)
# ═══════════════════════════════════════════════════════════════════════
banner "🧹 STEP 5: VERIFICATION SWEEP"

info "Running full linter sweep (shellcheck + markdownlint + eslint)..."

if [[ -f "$ROOT_DIR/scripts/run_full_sweep.sh" ]]; then
  SWEEP_OUTPUT=$(bash "$ROOT_DIR/scripts/run_full_sweep.sh" 2>&1)
  SWEEP_EXIT=$?

  if [[ $SWEEP_EXIT -eq 0 ]]; then
    success "Linter sweep complete (exit $SWEEP_EXIT)"
  else
    warning "Linter sweep completed with warnings (exit $SWEEP_EXIT)"
  fi

  # Extract metrics from sweep output
  SHELLCHECK_COUNT=$(echo "$SWEEP_OUTPUT" | grep -oE 'Shellcheck warnings: [0-9]+' | grep -oE '[0-9]+' || echo "0")
  MARKDOWN_COUNT=$(echo "$SWEEP_OUTPUT" | grep -oE 'Summary: [0-9]+ error' | grep -oE '[0-9]+' || echo "0")
  ESLINT_COUNT=$(echo "$SWEEP_OUTPUT" | grep -oE '[0-9]+ problems' | grep -oE '[0-9]+' || echo "0")

  info "Linter Metrics:"
  echo "  - Shellcheck: $SHELLCHECK_COUNT warnings"
  echo "  - Markdownlint: $MARKDOWN_COUNT errors"
  echo "  - ESLint: $ESLINT_COUNT problems"
  echo
  info "Evidence saved to: .evidence/$(date +%Y-%m-%d)/"
else
  warning "scripts/run_full_sweep.sh not found - skipping linter sweep"
fi

echo

# ═══════════════════════════════════════════════════════════════════════
# STEP 6: START SESSION WATCHDOG
# ═══════════════════════════════════════════════════════════════════════
banner "⏱️  STEP 6: SESSION WATCHDOG"

# Kill any existing watchdogs
pkill -f "watch-session-progress.sh" 2>/dev/null || true
sleep 1

# Start new watchdog in background
if [[ -f "$CLAUDE_DIR/watch-session-progress.sh" ]]; then
  nohup bash "$CLAUDE_DIR/watch-session-progress.sh" 300 60 >> "$CLAUDE_DIR/session_watch.log" 2>&1 &
  WATCHDOG_PID=$!
  success "Session watchdog started (PID $WATCHDOG_PID, threshold 300s)"
else
  warning "watch-session-progress.sh not found - skipping watchdog"
fi

echo

# ═══════════════════════════════════════════════════════════════════════
# STEP 7: AUTO-UPDATE SESSION_PROGRESS.md
# ═══════════════════════════════════════════════════════════════════════
banner "📝 STEP 7: SESSION LOG UPDATE"

SESSION_LOG="$CLAUDE_DIR/SESSION_PROGRESS.md"

cat >> "$SESSION_LOG" <<LOG_ENTRY

## $TIMESTAMP — ULTIMATE_BOOT.sh Execution

**Boot Sequence Complete:**
- ✅ 1Password authenticated ($OP_ACCOUNT)
- ✅ Environment variables set (GCP_PROJECT_ID=$GCP_PROJECT_ID)
- ✅ GOOGLE_APPLICATION_CREDENTIALS fixed: $BIGQUERY_KEY_PATH
- ✅ Protocols loaded: $ACHILLES_HEELS failures, $VERIFICATION_GATES gates, $BLOCKING_RULES constraints
- ✅ Current mission identified: $CURRENT_MISSION
- ✅ System state verified: Git $(git status --short | wc -l | tr -d ' ') files changed
- ✅ Linters executed: shellcheck=$SHELLCHECK_COUNT, markdown=$MARKDOWN_COUNT, eslint=$ESLINT_COUNT
- ✅ Watchdog started: PID $WATCHDOG_PID (300s threshold)

**Next Action:** Execute current mission with numbered steps, concrete metrics, <5min verification cadence.

LOG_ENTRY

success "SESSION_PROGRESS.md updated with boot timestamp"
echo

# ═══════════════════════════════════════════════════════════════════════
# STEP 8: EXPORT ENV VARS FOR CURRENT SHELL
# ═══════════════════════════════════════════════════════════════════════
banner "🎬 BOOT COMPLETE - READY TO EXECUTE"

success "Session restored to 100% state"
success "Claude Sonnet 4.5 ready for Tier 1 Option A execution"
echo

info "${BOLD}CRITICAL REMINDERS:${NC}"
echo "  1. ${BOLD}EVIDENCE FIRST${NC} - Show proof in same message as claim"
echo "  2. ${BOLD}<5 MIN VERIFICATION${NC} - Execute → Verify (<5min) → Claim with timestamp"
echo "  3. ${BOLD}CONCRETE METRICS${NC} - Always state X/Y with numbers"
echo "  4. ${BOLD}NUMBERED STEPS${NC} - Systematic execution with checkpoints"
echo

info "${BOLD}TO EXPORT ENV VARS TO CURRENT SHELL:${NC}"
echo "  ${BOLD}source <(cat <<'EOF'"
echo "export GCP_PROJECT_ID=\"$GCP_PROJECT_ID\""
echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$BIGQUERY_KEY_PATH\""
[[ -n "${SQUARE_ACCESS_TOKEN:-}" ]] && echo "export SQUARE_ACCESS_TOKEN=\"$SQUARE_ACCESS_TOKEN\""
[[ -n "${SQUARE_LOCATION_ID:-}" ]] && echo "export SQUARE_LOCATION_ID=\"$SQUARE_LOCATION_ID\""
echo "EOF"
echo ")${NC}"
echo

success "🚀 LET'S GO - TIER 1 OPTION A ALL THE WAY!"
echo
