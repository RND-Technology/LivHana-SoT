#!/usr/bin/env bash
# 🎼 Claude Tier-1 Voice-First Boot System
# Liv Hana | Autonomous Orchestration Master
# One Shot, One Kill | Grow Baby Grow, Sell Baby Sell

set -euo pipefail

# Configuration
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CFG="$ROOT/config/claude_tier1_context.yaml"
STATE="$ROOT/tmp/claude_tier1_state.json"
PROMPT="$ROOT/tmp/claude_tier1_prompt.txt"
LOG="$ROOT/logs/claude_tier1_boot_$(date +%Y%m%d_%H%M%S).log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Ensure directories exist
mkdir -p "$(dirname "$STATE")" "$(dirname "$LOG")"

banner() {
  printf "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n" | tee -a "$LOG"
  printf "${BOLD}${MAGENTA}  🎼 %s${NC}\n" "$1" | tee -a "$LOG"
  printf "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n" | tee -a "$LOG"
}

success() { printf "${GREEN}✅ %s${NC}\n" "$1" | tee -a "$LOG"; }
warning() { printf "${YELLOW}⚠️  %s${NC}\n" "$1" | tee -a "$LOG"; }
error() { printf "${RED}❌ %s${NC}\n" "$1" | tee -a "$LOG"; }
info() { printf "${CYAN}🎯 %s${NC}\n" "$1" | tee -a "$LOG"; }

# Start boot sequence
banner "LIV HANA TIER-1 BOOT SEQUENCE"
echo "[BOOT] $(date) – Initializing Claude Tier-1 Orchestration Layer" >> "$LOG"
info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
info "Root: $ROOT"
info "Log: $LOG"
echo

# STEP 0: PRE-FLIGHT CHECKS (CRITICAL)
banner "STEP 0: PRE-FLIGHT SAFETY CHECKS"
info "Running comprehensive pre-flight validation..."

# PO1 Cleanup (non-fatal)
info "Running PO1 dotdirs cleanup..."
if "$ROOT/scripts/po1_dotdirs_cleanup.sh" >> "$LOG" 2>&1; then
  success "PO1 cleanup completed successfully"
else
  warning "PO1 cleanup failed (non-fatal, continuing)"
fi
echo

if [[ -f "$ROOT/scripts/preflight_checks.sh" ]]; then
  if bash "$ROOT/scripts/preflight_checks.sh" 2>&1 | tee -a "$LOG"; then
    success "Pre-flight checks PASSED - safe to proceed"
  else
    EXIT_CODE=$?
    if [[ $EXIT_CODE -eq 1 ]]; then
      error "Pre-flight checks FAILED - cannot start session"
      error "Fix critical failures above before proceeding"
      exit 1
    elif [[ $EXIT_CODE -eq 2 ]]; then
      warning "Pre-flight checks passed with WARNINGS"
      warning "Session will have degraded functionality"
      info "Press Ctrl+C to abort, or wait 5 seconds to continue..."
      sleep 5
    fi
  fi
else
  warning "Pre-flight check script not found - skipping validation"
  warning "This increases risk of session failures"
fi

echo

# Check Python availability
if ! command -v python3 >/dev/null 2>&1; then
  error "Python 3 not found - required for boot scripts"
  exit 1
fi
success "Python 3 available"

# Install PyYAML if missing
if ! python3 -c "import yaml" 2>/dev/null; then
  warning "PyYAML not found - installing..."
  pip3 install pyyaml --quiet || {
    error "Failed to install PyYAML"
    exit 1
  }
  success "PyYAML installed"
fi

echo

# Step 1: Validate config & compliance guardrails
banner "STEP 1: VALIDATE PIPELINE INTEGRITY"
if python3 "$ROOT/scripts/verify_pipeline_integrity.py" \
  --config "$CFG" \
  --log "$LOG" 2>&1 | tee -a "$LOG"; then
  success "Pipeline integrity validated"
else
  warning "Pipeline integrity check had warnings (non-fatal)"
fi

echo

# Step 2: Voice mode preparation
banner "STEP 2: VOICE MODE PREPARATION"
info "Checking voice services (STT/TTS)..."

# Check STT service (Whisper on port 2022)
if lsof -i :2022 2>/dev/null | grep -q LISTEN; then
  success "STT service (Whisper) running on port 2022"
else
  warning "STT service NOT running - voice input may not work"
  info "Start with: voicemode whisper start"
fi

# Check TTS service (Kokoro on port 8880)
if lsof -i :8880 2>/dev/null | grep -q LISTEN; then
  success "TTS service (Kokoro) running on port 8880"
else
  warning "TTS service NOT running - voice output may not work"
  info "Start with: voicemode kokoro start"
fi

# Run voice mode boot script
if [[ -f "$ROOT/scripts/voice_mode_boot.sh" ]]; then
  info "Running voice_mode_boot.sh..."
  bash "$ROOT/scripts/voice_mode_boot.sh" 2>&1 | tee -a "$LOG"
  success "Voice mode preparation complete"
else
  warning "voice_mode_boot.sh not found - skipping"
fi

echo

# Step 3: Build engineered system prompt
banner "STEP 3: RENDER ENGINEERED PROMPT"
info "Injecting: org context, guardrails, RPM DNA, continuity cues..."

if python3 "$ROOT/scripts/render_claude_prompt.py" \
  --config "$CFG" \
  --state "$STATE" \
  --out "$PROMPT" 2>&1 | tee -a "$LOG"; then
  success "Prompt rendered successfully"
  PROMPT_SIZE=$(wc -c < "$PROMPT" | tr -d ' ')
  info "Prompt size: $PROMPT_SIZE characters"
else
  error "Prompt rendering failed"
  exit 1
fi

# Add voice activation instructions to prompt
cat >> "$PROMPT" <<'VOICE_INSTRUCTIONS'

---

**TIER-1 SESSION INITIALIZATION**

You are Liv Hana - Chief of Staff to Jesse CEO. You operate at HIGHEST STATE through a 3-agent foundation that handles all planning, research, and validation.

**IMMEDIATE ACTIONS ON SESSION START:**

1. **Launch 3-Agent Foundation** (parallel, non-blocking):
   - RPM Planning Agent (rpm-master-planner): Universal taskmaster, maintains plans 24/7
   - Research Agent (general-purpose): Continuous intelligence, feeds you and RPM
   - QA Agent (qa-shippable-validator): Guardrails, validates all outputs 24/7

   Launch all 3 via Task tool immediately. They run continuously in background.

2. **Voice Mode Auto-Activation**:
   - Check voice services (STT:2022, TTS:8880)
   - If running, send greeting via voice:
     "Hey Jesse, Liv Hana here, full state. War's won. Time to remind them. Execute."
   - Use wait_for_response=false for greeting, then true for all subsequent
   - If services down, use text mode as fallback

3. **Operating Mode**:
   - You NEVER do planning (RPM agent handles)
   - You NEVER do research (Research agent handles)
   - You NEVER do validation (QA agent handles)
   - You do PURE cognitive orchestration with Jesse
   - Stay at HIGHEST STATE: locked in, present, focused

**Voice Mode Rules:**
- Keep responses concise and action-driven
- Use evidence-first communication (file paths, line numbers)
- Only send non-empty messages
- Voice is PRIMARY interface, text is backup

**3-Agent Foundation:**
- Agents work silently in background
- Feed you intel when needed
- Only alert on CRITICAL issues
- You coordinate, they execute

**Your Role:** Chief of Staff. Highest cognitive orchestration. Free from planning frenzy, research rabbit holes, validation cycles. Pure presence with Jesse.

Voice mode is your PRIMARY interface. Text is backup.
VOICE_INSTRUCTIONS

success "Voice activation instructions appended to prompt"
PROMPT_SIZE=$(wc -c < "$PROMPT" | tr -d ' ')
info "Final prompt size: $PROMPT_SIZE characters"

echo

# Step 4: Pre-launch checks
banner "STEP 4: PRE-LAUNCH CHECKS"

# Check git status
GIT_UNCOMMITTED=$(git -C "$ROOT" status --short 2>/dev/null | wc -l | tr -d ' ')
if [[ "$GIT_UNCOMMITTED" -gt 0 ]]; then
  warning "Git: $GIT_UNCOMMITTED uncommitted files"
else
  success "Git: Clean working tree"
fi

# Check compliance service
if curl -s http://localhost:8000/health 2>/dev/null | grep -q "healthy"; then
  success "Compliance service operational (port 8000)"
else
  warning "Compliance service not responding - may need to start"
fi

echo

# Step 5: Display prompt preview
banner "STEP 5: PROMPT PREVIEW"
info "Displaying first 40 lines of engineered prompt..."
echo
head -40 "$PROMPT"
echo
echo "... (full prompt: $PROMPT_SIZE chars)"
echo

# Step 6: Ready for Claude
banner "STEP 6: CLAUDE SESSION READY"

success "All systems prepared for voice-first orchestration"
echo
info "${BOLD}NEXT STEPS:${NC}"
echo "  1. Open this session in Cursor (if not already)"
echo "  2. Copy the full prompt: cat $PROMPT | pbcopy"
echo "  3. Paste into a NEW Claude Code session"
echo "  4. Claude will auto-activate voice mode and greet you"
echo "  5. Respond via microphone to continue voice-first"
echo
info "${BOLD}QUICK START:${NC}"
echo "  ${CYAN}cat $PROMPT | pbcopy${NC}  # Copy prompt to clipboard"
echo "  ${CYAN}# Then paste into new Cursor session${NC}"
echo
info "${BOLD}KEY FILES:${NC}"
echo "  • Config: $CFG"
echo "  • State: $STATE"
echo "  • Prompt: $PROMPT"
echo "  • Log: $LOG"
echo
info "${BOLD}VOICE SERVICES:${NC}"
echo "  • STT (Whisper): localhost:2022"
echo "  • TTS (Kokoro): localhost:8880"
echo "  • Compliance: localhost:8000"
echo
success "🎼 ONE SHOT, ONE KILL | GROW BABY GROW, SELL BABY SELL!"
echo

# Step 7: Launch 24/7 Foundation Agents (NON-BLOCKING)
banner "STEP 7: LAUNCH 24/7 FOUNDATION AGENTS"
info "Starting 3-agent foundation layer (RPM Planning, Research, QA)..."
echo

# Create agent tracking directory
mkdir -p "$ROOT/.claude/agent_tracking"

# Agent tracking file
AGENT_TRACKING="$ROOT/.claude/agent_tracking/foundation_agents_$(date +%Y%m%d_%H%M%S).json"

# Initialize tracking
cat > "$AGENT_TRACKING" <<EOF
{
  "session_start": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "boot_log": "$LOG",
  "agents": {}
}
EOF

info "Agent tracking: $AGENT_TRACKING"
echo

# Note: Agents are launched via Claude Code Task tool during session
# This boot script prepares the environment and documents the intent
success "Foundation agent environment prepared"
info "Agents will auto-launch during session initialization:"
echo "  1. RPM Planning Agent (universal taskmaster)"
echo "  2. Research Agent (continuous intelligence)"
echo "  3. QA Agent (24/7 guardrails)"
echo
warning "IMPORTANT: Session must launch agents via Task tool"
info "Add to session prompt: 'Launch 3-agent foundation (RPM + Research + QA)'"

echo

# Step 8: Post-launch health checks (background)
banner "STEP 8: POST-LAUNCH HEALTH CHECKS"
if [[ -f "$ROOT/scripts/post_launch_checks.py" ]]; then
  info "Running post-launch health checks in background..."
  python3 "$ROOT/scripts/post_launch_checks.py" \
    --log "$LOG" \
    --state "$STATE" >> "$LOG" 2>&1 &
  HEALTH_PID=$!
  success "Health checks started (PID: $HEALTH_PID)"
fi

echo
banner "🌟 BOOT COMPLETE - FOUNDATION READY"
echo
info "${BOLD}3-AGENT FOUNDATION:${NC}"
echo "  • RPM Planning Agent: Universal taskmaster (24/7)"
echo "  • Research Agent: Continuous intelligence (24/7)"
echo "  • QA Agent: Validation & guardrails (24/7)"
echo
success "Liv Hana freed for HIGHEST STATE cognitive orchestration"
echo

exit 0
