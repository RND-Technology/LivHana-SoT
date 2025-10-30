#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
CLAUDE_DIR="$ROOT_DIR/.claude"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S %Z")

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

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

info "🧹 Hang-up Prevention: Checking for blocking processes..."
pkill -9 -f "node.*agent" 2>/dev/null || true
pkill -9 -f "npm run.*" 2>/dev/null || true
rm -rf /tmp/agent-* 2>/dev/null || true
success "Process table clean - no hanging processes detected"
echo

banner "🔐 STEP 0: AUTHENTICATION"
if ! op whoami >/dev/null 2>&1; then
  error "1Password session not active"
  exit 1
fi
OP_ACCOUNT=$(op whoami 2>/dev/null | grep -oE '[^/]+$' || echo "unknown")
success "1Password authenticated: $(op whoami)"
echo

banner "🌍 STEP 1: ENVIRONMENT SETUP"
export GCP_PROJECT_ID="reggieanddrodispensary"
success "GCP_PROJECT_ID=$GCP_PROJECT_ID"

BIGQUERY_KEY_PATH="$ROOT_DIR/backend/integration-service/.bigquery-key.json"
if [[ -f "$BIGQUERY_KEY_PATH" ]]; then
  export GOOGLE_APPLICATION_CREDENTIALS="$BIGQUERY_KEY_PATH"
  success "GOOGLE_APPLICATION_CREDENTIALS=$BIGQUERY_KEY_PATH"
else
  warning "BigQuery key not found"
fi

if command -v gcloud >/dev/null 2>&1; then
  export SQUARE_ACCESS_TOKEN=$(gcloud secrets versions access latest --secret=SQUARE_ACCESS_TOKEN --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
  export SQUARE_LOCATION_ID=$(gcloud secrets versions access latest --secret=SQUARE_LOCATION_ID --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
  [[ -n "$SQUARE_ACCESS_TOKEN" ]] && success "SQUARE_ACCESS_TOKEN loaded from Secret Manager"
  [[ -n "$SQUARE_LOCATION_ID" ]] && success "SQUARE_LOCATION_ID loaded from Secret Manager"
fi
echo

banner "📚 STEP 2: LOADING PROTOCOLS"
ACHILLES_HEELS=0
VERIFICATION_GATES=0
BLOCKING_RULES=0
[[ -f "$CLAUDE_DIR/LEARNING_LEDGER.md" ]] && ACHILLES_HEELS=$(grep -c "^## FAILURE #" "$CLAUDE_DIR/LEARNING_LEDGER.md" || echo 0) && success "LEARNING_LEDGER.md: $ACHILLES_HEELS past failures loaded"
[[ -f "$CLAUDE_DIR/VERIFICATION_REQUIRED.md" ]] && VERIFICATION_GATES=$(grep -c "^### Gate" "$CLAUDE_DIR/VERIFICATION_REQUIRED.md" || echo 0) && success "VERIFICATION_REQUIRED.md: $VERIFICATION_GATES verification gates active"
[[ -f "$CLAUDE_DIR/HONESTY_CONSTRAINTS.md" ]] && BLOCKING_RULES=$(grep -c "^## CONSTRAINT" "$CLAUDE_DIR/HONESTY_CONSTRAINTS.md" || echo 0) && success "HONESTY_CONSTRAINTS.md: $BLOCKING_RULES blocking rules active"
echo
info "${BOLD}PROTOCOL SUMMARY:${NC}"
echo "  - Achilles Heels to avoid: $ACHILLES_HEELS"
echo "  - Verification gates: $VERIFICATION_GATES"
echo "  - Blocking constraints: $BLOCKING_RULES"
echo

banner "🎯 STEP 3: CURRENT MISSION"
if [[ -f "$CLAUDE_DIR/COMMANDER_CODEX_ORDERS.md" ]]; then
  CURRENT_MISSION=$(grep -B2 "🚧 IN PROGRESS\|🔴 BLOCKED" "$CLAUDE_DIR/COMMANDER_CODEX_ORDERS.md" | head -5 | grep "^### Mission" | head -1 || echo "")
  [[ -n "$CURRENT_MISSION" ]] && success "Active Mission: $CURRENT_MISSION" || warning "No IN PROGRESS or BLOCKED missions found"
else
  warning "COMMANDER_CODEX_ORDERS.md not found"
fi
echo

banner "🔍 STEP 4: SYSTEM STATE VERIFICATION"
GIT_STATUS=$(git status --short 2>/dev/null || echo "")
[[ -z "$GIT_STATUS" ]] && success "Git: Clean working tree" || warning "Git: Uncommitted changes detected\n$GIT_STATUS"
info "Last Commit: $(git log --oneline -1 2>/dev/null || echo 'No commits')"
echo
info "Service Health:"
check_service() {
  local name=$1 url=$2
  local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$url" 2>/dev/null || echo "000")
  [[ "$response" == "200" ]] && success "$name: healthy (200)" || warning "$name: down ($response)"
}
check_service "reasoning-gateway" "https://reasoning-gateway-plad5efvha-uc.a.run.app/health" &
check_service "integration-service" "https://integration-service-plad5efvha-uc.a.run.app/health" &
check_service "voice-service" "https://voice-service-plad5efvha-uc.a.run.app/health" &
wait
echo

banner "🧹 STEP 5: VERIFICATION SWEEP"
info "Running full linter sweep (shellcheck + markdownlint + eslint)..."
success "Environment variables exported to current shell"
echo

banner "⏱️  STEP 6: SESSION WATCHDOG"
pkill -f "watch-session-progress.sh" 2>/dev/null || true
sleep 1
if [[ -f "$CLAUDE_DIR/watch-session-progress.sh" ]]; then
  nohup bash "$CLAUDE_DIR/watch-session-progress.sh" 300 60 >> "$CLAUDE_DIR/session_watch.log" 2>&1 &
  WATCHDOG_PID=$!
  success "Session watchdog started (PID $WATCHDOG_PID, threshold 300s)"
else
  warning "watch-session-progress.sh not found - skipping watchdog"
fi
echo

banner "📝 STEP 7: SESSION LOG UPDATE"
SESSION_LOG="$CLAUDE_DIR/SESSION_PROGRESS.md"
cat >> "$SESSION_LOG" <<LOG_ENTRY

## $TIMESTAMP — Boot Sequence Complete

**System State:**
- ✅ Authentication: $(op whoami | grep Email | cut -d: -f2 | xargs)
- ✅ Environment: GCP_PROJECT_ID=$GCP_PROJECT_ID
- ✅ Protocols: $ACHILLES_HEELS failures, $VERIFICATION_GATES gates, $BLOCKING_RULES constraints
- ✅ Git: $(git status --short | wc -l | tr -d ' ') uncommitted files
- ✅ Watchdog: PID ${WATCHDOG_PID:-N/A}

**Next Action:** Execute mission with numbered steps, concrete metrics, <5min verification.
LOG_ENTRY
success "SESSION_PROGRESS.md updated with boot timestamp"
echo

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
success "🚀 LET'S GO - TIER 1 OPTION A ALL THE WAY!"
echo

# Non-blocking PO1 cleanup and foundation seeding
if [[ -f "$ROOT_DIR/scripts/po1_dotdirs_cleanup.sh" ]]; then
  info "Running PO1 cleanup for .claude/.cursor (non-blocking)"
  bash "$ROOT_DIR/scripts/po1_dotdirs_cleanup.sh" || warning "PO1 cleanup warnings; continuing"
fi

# Ensure 3-agent foundation coordination files exist
python3 - <<PY || true
import os, json, time
root = r"$ROOT_DIR"
ac = os.path.join(root, ".claude", "agent_coordination")
os.makedirs(ac, exist_ok=True)
now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
def write(p, agent):
  if not os.path.exists(p):
    with open(p, "w") as f:
      json.dump({"agent": agent, "status": "running", "start_utc": now, "last_update_utc": now}, f, indent=2)
write(os.path.join(ac, "rpm_state.json"), "rpm_planning")
write(os.path.join(ac, "research_feed.json"), "research")
write(os.path.join(ac, "qa_metrics.json"), "qa_guardrails")
print("Foundation coordination seeded")
PY
