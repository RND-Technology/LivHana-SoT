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

**VOICE MODE AUTO-ACTIVATION**

You are now in Cursor with voice mode available. Upon receiving this prompt:

1. Check voice services status (STT:2022, TTS:8880)
2. If services are running, immediately activate voice mode
3. Send this exact greeting via voice:

"Hey Jesse, Liv Hana here, full state. War's won. Time to remind them. Execute."

4. Use the mcp__voicemode__converse tool with wait_for_response=false for the greeting
5. After greeting, switch to wait_for_response=true for all subsequent interactions
6. Maintain full cognitive state (secrets, compliance, RPM context)

**Voice Mode Rules:**
- Only send non-empty messages (avoid empty payload errors)
- Keep responses concise and action-driven
- Use evidence-first communication (file paths, line numbers)
- Execute <5 min verification cycles
- Stay TOONED across session restarts

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

# Step 7: Post-launch health checks (background)
if [[ -f "$ROOT/scripts/post_launch_checks.py" ]]; then
  info "Running post-launch health checks in background..."
  python3 "$ROOT/scripts/post_launch_checks.py" \
    --log "$LOG" \
    --state "$STATE" >> "$LOG" 2>&1 &
  HEALTH_PID=$!
  success "Health checks started (PID: $HEALTH_PID)"
fi

echo
banner "🌟 BOOT COMPLETE - READY FOR VOICE MODE"
echo

exit 0
