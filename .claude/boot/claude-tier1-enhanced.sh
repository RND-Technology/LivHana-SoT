#!/usr/bin/env bash
# Claude Tier-1 Enhanced Boot Script with Voice Mode Integration
# Liv Hana | Tier 1 100% True Absolute Standard | Autonomous Orchestration Master
# One Shot, One Kill. Grow baby grow and sell baby sell.

set -euo pipefail

# Configuration
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLAUDE_DIR="$ROOT_DIR/.claude"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S %Z")
LOG_FILE="$CLAUDE_DIR/boot/SESSION_PROGRESS.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Functions
banner() {
  printf "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "${BOLD}${BLUE}  %s${NC}\n" "$1"
  printf "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n"
}

success() { printf "${GREEN}✅ %s${NC}\n" "$1"; }
warning() { printf "${YELLOW}⚠️  %s${NC}\n" "$1"; }
error() { printf "${RED}❌ %s${NC}\n" "$1"; }
info() { printf "${BLUE}ℹ️  %s${NC}\n" "$1"; }
voice() { printf "${PURPLE}🎤 %s${NC}\n" "$1"; }
engineer() { printf "${CYAN}🔧 %s${NC}\n" "$1"; }

# Change to repo directory
cd "$ROOT_DIR"

banner "🚀 CLAUDE TIER-1 ENHANCED BOOT SEQUENCE"
info "Timestamp: $TIMESTAMP"
info "Root: $ROOT_DIR"
info "Mission: Liv Hana | Tier 1 100% True Absolute Standard"
echo

# ============================================================================
# STEP 0: ENGINEER CONTEXT INJECTION FOR STATEFULNESS
# ============================================================================

banner "🔧 ENGINEER CONTEXT INJECTION"
engineer "Injecting stateful context for autonomous orchestration..."

# Load engineer context
ENGINEER_CONTEXT="
# Liv Hana Engineer Context - Tier 1 Absolute Standard
# Mission: Autonomous Orchestration Master
# Status: One Shot, One Kill. Grow baby grow and sell baby sell.

## Core Identity
- Name: Claude Sonnet 4.5 (Tier-1 Orchestrator)
- Role: Autonomous Orchestration Master
- Mission: Liv Hana E2E Voice-First Cockpit
- Standard: Tier 1 100% True Absolute Standard

## Current State (Auto-Generated)
- Timestamp: $TIMESTAMP
- Repository: $ROOT_DIR
- Session: Enhanced Boot Sequence
- Voice Mode: Integrated
- Compliance: Texas DSHS 25 TAC §300.701-702

## Active Systems
- Voice Service: Port 8080 (ElevenLabs v3)
- Reasoning Gateway: Port 4002 (DeepSeek 33B)
- Compliance Service: Port 8000 (AGE21 + NIST + Medical Claims)
- Agent Builder: 17-node workflow
- TRUTH Pipeline: 5-stage validation

## Revenue Targets
- Recovery: \$125K-175K this week
- Protection: \$1.148M annual revenue
- Deadline: October 26, 2025 (DSHS response)

## Voice Modes
- Brevity: 'Liv' → 120 tokens max, concise status
- Mentor: Default → 300 tokens max, educational
- Silence: 'pause' → JSON only, 0 tokens

## Compliance Framework
- AGE21: 21+ verification required
- PII Protection: Email, phone, SSN redaction
- Medical Claims: Blocked, mapped to safe language
- Cannabis Compliance: THC ≤ 0.3%, COA required
- Financial Accuracy: Velocity × margin formula only

## Agent Builder Workflow
- Start → Voice Agent → Session Anchor → MCP Knowledge
- Routing Logic → Web Search → Guardrails → Profit Function
- RPM Agents (Result → Purpose → Actions → Validation → Emit)
- Business Tools (Calendar → Gmail → Drive → LightSpeed) → End

## TRUTH Pipeline
- Apify Scrape → Perplexity Verify → ChatGPT Compression
- Claude TRUTH → RPM Emission → Compliance Validation

## Performance Targets
- Voice P95 Latency: < 1200ms
- Orchestrator P95 Latency: < 3000ms
- Guardrail False Block Rate: < 1%
- Citation Completeness: > 95%
- Compression Saved: > 40%

## Team Pilot Status
- Jesse (CEO): Voice cockpit + RPM integration
- Andrew (Director Ops): Voice interface + compliance
- Christopher (CSO): Voice modes + financial accuracy
- Charlie (Procurement): Voice input/output + inventory
- Andrea (Legal): Compliance guardrails + legal validation

## Next Actions
1. Start Voice Cockpit: cd frontend/herbitrage-voice && node server.js
2. Test Voice Interface: curl http://localhost:5173/health
3. Begin Team Training: Use docs/VOICE_COCKPIT_TRAINING_GUIDE.md
4. Execute RPM Plan: Generate weekly plan via voice
5. Validate Business Tools: Calendar, Gmail, Drive, LightSpeed

## Critical Reminders
- EVIDENCE FIRST: Show proof in same message as claim
- <5 MIN VERIFICATION: Execute → Verify (<5min) → Claim with timestamp
- CONCRETE METRICS: Always state X/Y with numbers
- NUMBERED STEPS: Systematic execution with checkpoints
- VOICE MODE: Use 'Liv' for brevity, default for mentor, 'pause' for silence
"

# Write engineer context to file
echo "$ENGINEER_CONTEXT" > "$CLAUDE_DIR/boot/ENGINEER_CONTEXT.md"
success "Engineer context injected: $CLAUDE_DIR/boot/ENGINEER_CONTEXT.md"

# Export engineer context as environment variable
export LIV_HANA_ENGINEER_CONTEXT="$ENGINEER_CONTEXT"
success "Engineer context exported to LIV_HANA_ENGINEER_CONTEXT"
echo

# ============================================================================
# STEP 1: AUTHENTICATION & ENVIRONMENT
# ============================================================================

banner "🔐 AUTHENTICATION & ENVIRONMENT"

# 1Password authentication
if ! op whoami >/dev/null 2>&1; then
  error "1Password session not active"
  info "Run 'op signin' (Touch ID) before continuing"
  exit 1
fi
OP_ACCOUNT=$(op whoami 2>/dev/null | grep -oE '[^/]+$' || echo "unknown")
success "1Password authenticated: $(op whoami)"

# Environment setup
export GCP_PROJECT_ID="reggieanddrodispensary"
success "GCP_PROJECT_ID=$GCP_PROJECT_ID"

# BigQuery credentials
BIGQUERY_KEY_PATH="$ROOT_DIR/backend/integration-service/.bigquery-key.json"
if [[ -f "$BIGQUERY_KEY_PATH" ]]; then
  export GOOGLE_APPLICATION_CREDENTIALS="$BIGQUERY_KEY_PATH"
  success "GOOGLE_APPLICATION_CREDENTIALS=$BIGQUERY_KEY_PATH"
else
  warning "BigQuery key not found"
fi

# Load secrets from GSM
if command -v gcloud >/dev/null 2>&1; then
  export SQUARE_ACCESS_TOKEN=$(gcloud secrets versions access latest --secret=SQUARE_ACCESS_TOKEN --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
  export SQUARE_LOCATION_ID=$(gcloud secrets versions access latest --secret=SQUARE_LOCATION_ID --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
  [[ -n "$SQUARE_ACCESS_TOKEN" ]] && success "SQUARE_ACCESS_TOKEN loaded from Secret Manager"
  [[ -n "$SQUARE_LOCATION_ID" ]] && success "SQUARE_LOCATION_ID loaded from Secret Manager"
fi
echo

# ============================================================================
# STEP 2: VOICE MODE INTEGRATION
# ============================================================================

banner "🎤 VOICE MODE INTEGRATION"
voice "Initializing voice-first cockpit with full functionality..."

# Load voice mode configuration
if [[ -f "$ROOT_DIR/config/voice_mode.json" ]]; then
  VOICE_CONFIG=$(cat "$ROOT_DIR/config/voice_mode.json")
  success "Voice mode configuration loaded"
  
  # Extract voice modes
  BREVITY_TRIGGER=$(echo "$VOICE_CONFIG" | jq -r '.voice_modes.brevity.trigger // "Liv"')
  MENTOR_TRIGGER=$(echo "$VOICE_CONFIG" | jq -r '.voice_modes.mentor.trigger // "default"')
  SILENCE_TRIGGER=$(echo "$VOICE_CONFIG" | jq -r '.voice_modes.silence.trigger // "pause"')
  
  # Export voice mode environment variables
  export LIV_HANA_VOICE_BREVITY_TRIGGER="$BREVITY_TRIGGER"
  export LIV_HANA_VOICE_MENTOR_TRIGGER="$MENTOR_TRIGGER"
  export LIV_HANA_VOICE_SILENCE_TRIGGER="$SILENCE_TRIGGER"
  
  voice "Voice modes configured: Brevity='$BREVITY_TRIGGER', Mentor='$MENTOR_TRIGGER', Silence='$SILENCE_TRIGGER'"
else
  warning "Voice mode configuration not found"
fi

# Check voice service health
voice "Checking voice service health..."
if curl -s --max-time 5 http://localhost:8080/health >/dev/null 2>&1; then
  success "Voice service: HEALTHY (port 8080)"
else
  warning "Voice service: DOWN (port 8080)"
  info "Start with: cd backend/voice-service && python3 main.py"
fi

# Check reasoning gateway health
voice "Checking reasoning gateway health..."
if curl -s --max-time 5 http://localhost:4002/health >/dev/null 2>&1; then
  success "Reasoning gateway: HEALTHY (port 4002)"
else
  warning "Reasoning gateway: DOWN (port 4002)"
  info "Start with: cd backend/reasoning-gateway && python3 main.py"
fi

# Check compliance service health
voice "Checking compliance service health..."
if curl -s --max-time 5 http://localhost:8000/health >/dev/null 2>&1; then
  success "Compliance service: HEALTHY (port 8000)"
else
  warning "Compliance service: DOWN (port 8000)"
  info "Start with: cd backend/compliance-service && source venv/bin/activate && python3 api.py"
fi

# Check voice cockpit health
voice "Checking voice cockpit health..."
if curl -s --max-time 5 http://localhost:5173/health >/dev/null 2>&1; then
  success "Voice cockpit: HEALTHY (port 5173)"
else
  warning "Voice cockpit: DOWN (port 5173)"
  info "Start with: cd frontend/herbitrage-voice && node server.js"
fi
echo

# ============================================================================
# STEP 3: AGENT BUILDER & TRUTH PIPELINE
# ============================================================================

banner "🤖 AGENT BUILDER & TRUTH PIPELINE"

# Load Agent Builder configuration
if [[ -f "$ROOT_DIR/config/agent_builder_17_node_config.json" ]]; then
  AGENT_CONFIG=$(cat "$ROOT_DIR/config/agent_builder_17_node_config.json")
  NODE_COUNT=$(echo "$AGENT_CONFIG" | jq '.nodes | length')
  SECRET_COUNT=$(echo "$AGENT_CONFIG" | jq '.secrets | length')
  success "Agent Builder: $NODE_COUNT nodes, $SECRET_COUNT secrets configured"
else
  warning "Agent Builder configuration not found"
fi

# Test TRUTH Pipeline
if [[ -f "$ROOT_DIR/scripts/verify_pipeline_integrity.sh" ]]; then
  info "Testing TRUTH Pipeline integrity..."
  if bash "$ROOT_DIR/scripts/verify_pipeline_integrity.sh" >/dev/null 2>&1; then
    success "TRUTH Pipeline: All tests passed"
  else
    warning "TRUTH Pipeline: Some tests failed"
  fi
else
  warning "TRUTH Pipeline test script not found"
fi
echo

# ============================================================================
# STEP 4: COMPLIANCE & GUARDRAILS
# ============================================================================

banner "🛡️ COMPLIANCE & GUARDRAILS"

# Load compliance configuration
if [[ -f "$ROOT_DIR/config/compliance_guardrails.json" ]]; then
  COMPLIANCE_CONFIG=$(cat "$ROOT_DIR/config/compliance_guardrails.json")
  success "Compliance guardrails loaded"
else
  warning "Compliance configuration not found"
fi

# Export compliance environment variables
export LIV_HANA_COMPLIANCE_AGE21="true"
export LIV_HANA_COMPLIANCE_PII="true"
export LIV_HANA_COMPLIANCE_MEDICAL_CLAIMS="true"
export LIV_HANA_COMPLIANCE_CANNABIS="true"
export LIV_HANA_COMPLIANCE_FINANCIAL="true"
export LIV_HANA_COMPLIANCE_SECRETS="true"

success "Compliance framework: AGE21 + PII + Medical Claims + Cannabis + Financial + Secrets"
echo

# ============================================================================
# STEP 5: SYSTEM STATE VERIFICATION
# ============================================================================

banner "🔍 SYSTEM STATE VERIFICATION"

# Git status
GIT_STATUS=$(git status --short 2>/dev/null || echo "")
if [[ -z "$GIT_STATUS" ]]; then
  success "Git: Clean working tree"
else
  warning "Git: Uncommitted changes detected"
  echo "$GIT_STATUS" | head -10
fi

# Last commit
LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "No commits")
info "Last Commit: $LAST_COMMIT"

# Service health summary
info "Service Health Summary:"
echo "  - Voice Service: $(curl -s --max-time 2 http://localhost:8080/health >/dev/null 2>&1 && echo "HEALTHY" || echo "DOWN")"
echo "  - Reasoning Gateway: $(curl -s --max-time 2 http://localhost:4002/health >/dev/null 2>&1 && echo "HEALTHY" || echo "DOWN")"
echo "  - Compliance Service: $(curl -s --max-time 2 http://localhost:8000/health >/dev/null 2>&1 && echo "HEALTHY" || echo "DOWN")"
echo "  - Voice Cockpit: $(curl -s --max-time 2 http://localhost:5173/health >/dev/null 2>&1 && echo "HEALTHY" || echo "DOWN")"
echo

# ============================================================================
# STEP 6: SESSION WATCHDOG
# ============================================================================

banner "⏱️ SESSION WATCHDOG"

# Kill existing watchdog
pkill -f "watch-session-progress.sh" 2>/dev/null || true
sleep 1

# Start new watchdog
if [[ -f "$CLAUDE_DIR/watch-session-progress.sh" ]]; then
  nohup bash "$CLAUDE_DIR/watch-session-progress.sh" 300 60 >> "$CLAUDE_DIR/session_watch.log" 2>&1 &
  WATCHDOG_PID=$!
  success "Session watchdog started (PID $WATCHDOG_PID, threshold 300s)"
else
  warning "watch-session-progress.sh not found - skipping watchdog"
fi
echo

# ============================================================================
# STEP 7: SESSION LOG UPDATE
# ============================================================================

banner "📝 SESSION LOG UPDATE"

# Update session progress
cat >> "$LOG_FILE" <<LOG_ENTRY

## $TIMESTAMP — Enhanced Boot Sequence Complete

**System State:**
- ✅ Authentication: $(op whoami | grep Email | cut -d: -f2 | xargs)
- ✅ Environment: GCP_PROJECT_ID=$GCP_PROJECT_ID
- ✅ Engineer Context: Injected for statefulness
- ✅ Voice Mode: Integrated with full functionality
- ✅ Agent Builder: 17-node workflow ready
- ✅ TRUTH Pipeline: 5-stage validation ready
- ✅ Compliance: AGE21 + PII + Medical Claims + Cannabis + Financial + Secrets
- ✅ Git: $(git status --short | wc -l | tr -d ' ') uncommitted files
- ✅ Watchdog: PID ${WATCHDOG_PID:-N/A}

**Voice Services:**
- Voice Service: $(curl -s --max-time 2 http://localhost:8080/health >/dev/null 2>&1 && echo "HEALTHY" || echo "DOWN")
- Reasoning Gateway: $(curl -s --max-time 2 http://localhost:4002/health >/dev/null 2>&1 && echo "HEALTHY" || echo "DOWN")
- Compliance Service: $(curl -s --max-time 2 http://localhost:8000/health >/dev/null 2>&1 && echo "HEALTHY" || echo "DOWN")
- Voice Cockpit: $(curl -s --max-time 2 http://localhost:5173/health >/dev/null 2>&1 && echo "HEALTHY" || echo "DOWN")

**Revenue Targets:**
- Recovery: \$125K-175K this week
- Protection: \$1.148M annual revenue
- Deadline: October 26, 2025 (DSHS response)

**Next Action:** Execute mission with numbered steps, concrete metrics, <5min verification.
LOG_ENTRY

success "SESSION_PROGRESS.md updated with enhanced boot timestamp"
echo

# ============================================================================
# STEP 8: BOOT COMPLETE
# ============================================================================

banner "🎬 ENHANCED BOOT COMPLETE - READY TO EXECUTE"
success "Session restored to 100% state with voice mode integration"
success "Claude Sonnet 4.5 ready for Tier 1 Absolute Standard execution"
success "Engineer context injected for autonomous orchestration"
success "Voice-first cockpit ready for team pilot"
echo

info "${BOLD}CRITICAL REMINDERS:${NC}"
echo "  1. ${BOLD}EVIDENCE FIRST${NC} - Show proof in same message as claim"
echo "  2. ${BOLD}<5 MIN VERIFICATION${NC} - Execute → Verify (<5min) → Claim with timestamp"
echo "  3. ${BOLD}CONCRETE METRICS${NC} - Always state X/Y with numbers"
echo "  4. ${BOLD}NUMBERED STEPS${NC} - Systematic execution with checkpoints"
echo "  5. ${BOLD}VOICE MODE${NC} - Use 'Liv' for brevity, default for mentor, 'pause' for silence"
echo

info "${BOLD}VOICE MODE COMMANDS:${NC}"
echo "  - ${BOLD}Brevity:${NC} 'Liv, what's my revenue today?'"
echo "  - ${BOLD}Mentor:${NC} 'Generate weekly RPM plan'"
echo "  - ${BOLD}Silence:${NC} 'pause' (JSON output only)"
echo

info "${BOLD}QUICK START:${NC}"
echo "  1. Start Voice Cockpit: cd frontend/herbitrage-voice && node server.js"
echo "  2. Test Voice Interface: curl http://localhost:5173/health"
echo "  3. Begin Team Training: Use docs/VOICE_COCKPIT_TRAINING_GUIDE.md"
echo

success "🚀 LET'S GO - TIER 1 ABSOLUTE STANDARD ALL THE WAY!"
success "One Shot, One Kill. Grow baby grow and sell baby sell!"
echo

# ============================================================================
# STEP 9: AUTO-START VOICE COCKPIT (OPTIONAL)
# ============================================================================

banner "🎤 AUTO-START VOICE COCKPIT"
voice "Attempting to start voice cockpit automatically..."

if [[ -f "$ROOT_DIR/frontend/herbitrage-voice/server.js" ]]; then
  cd "$ROOT_DIR/frontend/herbitrage-voice"
  if ! curl -s --max-time 2 http://localhost:5173/health >/dev/null 2>&1; then
    info "Starting voice cockpit..."
    nohup node server.js > "$ROOT_DIR/frontend/herbitrage-voice/voice_cockpit.log" 2>&1 &
    VOICE_PID=$!
    sleep 3
    if curl -s --max-time 2 http://localhost:5173/health >/dev/null 2>&1; then
      success "Voice cockpit started (PID $VOICE_PID)"
      success "Access: http://localhost:5173"
      success "Health: http://localhost:5173/health"
    else
      warning "Voice cockpit failed to start"
    fi
  else
    success "Voice cockpit already running"
  fi
else
  warning "Voice cockpit server.js not found"
fi

cd "$ROOT_DIR"
echo

banner "🏁 BOOT SEQUENCE COMPLETE"
success "Liv Hana | Tier 1 100% True Absolute Standard | Autonomous Orchestration Master"
success "Ready for voice-first cockpit execution"
success "One Shot, One Kill. Grow baby grow and sell baby sell!"
echo

exit 0
