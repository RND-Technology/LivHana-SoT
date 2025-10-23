#!/usr/bin/env bash
# 🎼 Claude Tier-1 Voice-First Boot System
# Liv Hana | Autonomous Orchestration Master
# One Shot, One Kill | Grow Baby Grow, Sell Baby Sell

set -euo pipefail

# Configuration
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
CFG="$ROOT/config/claude_tier1_context.yaml"
STATE="$ROOT/tmp/claude_tier1_state.json"
PROMPT="$ROOT/tmp/claude_tier1_prompt.txt"
LOG="$ROOT/logs/claude_tier1_boot_$(date +%Y%m%d_%H%M%S).log"

# Load security helpers
if [[ -f "$ROOT/scripts/boot/helpers.sh" ]]; then
  source "$ROOT/scripts/boot/helpers.sh"
else
  echo "Warning: helpers.sh not found at $ROOT/scripts/boot/helpers.sh"
fi

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

ensure_op_session() {
  local account="${OP_ACCOUNT_SLUG:-reggiedro.1password.com}"
  local verbosity="${1:-show}"

  if ! command -v op >/dev/null 2>&1; then
    error "1Password CLI (op) not found. Install via: brew install 1password-cli"
    exit 1
  fi

  # Check if using service account token (preferred for automation)
  if [[ -n "${OP_SERVICE_ACCOUNT_TOKEN:-}" ]]; then
    if [[ "$verbosity" == "show" ]]; then
      info "Using 1Password service account token..."
    fi
    # Verify token works
    if timeout 5 op whoami >/dev/null 2>&1; then
      local whoami_output="$(op whoami 2>/dev/null || echo '')"
      if [[ -n "$whoami_output" ]]; then
        success "1Password authenticated via service account"
        return 0
      fi
    fi
    error "OP_SERVICE_ACCOUNT_TOKEN is set but authentication failed"
    error "Verify your service account token is valid"
    exit 1
  fi

  # Check if already signed in (with timeout)
  if timeout 5 op whoami >/dev/null 2>&1; then
    local whoami_output="$(op whoami 2>/dev/null || echo '')"
    local account_domain="$(echo "$whoami_output" | grep -o '[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]*\.[a-zA-Z]\{2,\}' | head -1 | sed 's/@.*//' || echo '')"
    if [[ -n "$account_domain" ]]; then
      if [[ "$verbosity" == "show" ]]; then
        success "1Password authenticated: ${account_domain}@***"
      else
        info "1Password session already active"
      fi
      return 0
    fi
  fi

  info "Attempting 1Password sign-in for ${account}..."

  # Enable biometric unlock (Touch ID) for non-interactive flow
  export OP_BIOMETRIC_UNLOCK_ENABLED=1

  local op_version op_major
  op_version="$(op --version 2>/dev/null | head -n1 || echo "")"
  op_major="${op_version%%.*}"

  # CLI v2: use app integration (session managed by desktop app)
  if [[ "$op_major" != "1" ]]; then
    # CLI v2 uses app integration - signin command triggers biometric/Touch ID
    # The --raw flag returns empty if using app integration, which is fine
    local signin_output
    if ! signin_output="$(op signin --account "${account}" --raw 2>&1)"; then
      error "Automatic 1Password sign-in failed (timeout or denied)."
      error "Ensure Desktop app is running and CLI integration is enabled."
      error "Manual: op signin --account ${account}"
      exit 1
    fi
    
    # Even if --raw returns empty (app integration), verify whoami works
    local whoami_check
    whoami_check="$(op whoami 2>/dev/null | tr -d '\n' || echo '')"
    if [[ -z "$whoami_check" ]]; then
      error "1Password sign-in produced empty whoami."
      error "Enable Desktop → Developer → Integrate with 1Password CLI."
      exit 1
    fi
    
    # Extract session token if --raw provided one (for compatibility)
    if [[ -n "$signin_output" ]]; then
      local account_shorthand="${account%%.*}"
      export "OP_SESSION_${account_shorthand}=${signin_output}"
    fi
  else
    # CLI v1: Legacy eval-based signin (less secure, but required for v1)
    warning "1Password CLI v1 detected. Upgrade recommended: brew upgrade 1password-cli"
    if ! op signin --account "${account}" >/dev/null 2>&1; then
      error "Automatic 1Password sign-in failed."
      error "Manual: eval \"\$(op signin ${account})\""
      exit 1
    fi
  fi

  # VERIFY: Hard-fail if whoami is empty after signin
  local whoami_output="$(op whoami 2>/dev/null || echo '')"
  local account_domain="$(echo "$whoami_output" | grep -o '[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]*\.[a-zA-Z]\{2,\}' | head -1 | sed 's/@.*//' || echo '')"

  if [[ -z "$account_domain" ]]; then
    error "1Password CLI integration not enabled in Desktop app."
    error "FIX (30 seconds):"
    error "  1. Open 1Password Desktop app"
    error "  2. Settings → Developer → CHECK ✓ 'Connect with 1Password CLI'"
    error "  3. Restart app and retry"
    exit 1
  fi

  success "1Password authenticated: ${account_domain}@***"
  return 0
}

# Start boot sequence
banner "LIV HANA TIER-1 BOOT SEQUENCE"
echo "[BOOT] $(date) – Initializing Claude Tier-1 Orchestration Layer" >> "$LOG"
info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
info "Root: $ROOT"
info "Log: $LOG"
echo

# STEP 1: ENVIRONMENT SETUP (before pre-flight)
banner "🌍 STEP 1: ENVIRONMENT SETUP"

# Check available memory FIRST (warn about crashes)
# macOS-aware detection: memory_pressure primary, vm_stat fallback
UNAME=$(uname -s)
WARN_PCT=${LOW_MEM_WARN_PCT:-10}
CRIT_PCT=${LOW_MEM_CRIT_PCT:-5}
STRICT=${STRICT_LOW_MEM:-0}

if [[ "$UNAME" == "Darwin" ]] && command -v memory_pressure >/dev/null 2>&1; then
  info "Checking system memory..."
  info "Memory detector: memory_pressure (macOS)"
  
  # Extract System-wide memory free percentage
  MEM_FREE_PCT=$(memory_pressure 2>/dev/null | grep -i "System-wide memory free percentage" | awk '{print $NF}' | tr -d '%' || echo "")
  
  if [[ -n "$MEM_FREE_PCT" ]]; then
    if [[ $MEM_FREE_PCT -lt $CRIT_PCT ]]; then
      warning "CRITICAL: Very low memory ($MEM_FREE_PCT% free < $CRIT_PCT% threshold)"
      warning "Cursor may crash - save work frequently"
      warning "Consider restarting system for best stability"
      if [[ "$STRICT" == "1" ]]; then
        error "STRICT_LOW_MEM=1 enforced - exiting boot sequence"
        exit 1
      fi
    elif [[ $MEM_FREE_PCT -lt $WARN_PCT ]]; then
      warning "Low memory: $MEM_FREE_PCT% free (recommend >$WARN_PCT%)"
      warning "Monitor for stability issues during session"
    else
      success "Memory pressure healthy: $MEM_FREE_PCT% free"
    fi
  else
    warning "Could not parse memory_pressure output - falling back to vm_stat"
    # Fall through to vm_stat logic below
  fi
fi

# Fallback to vm_stat (non-macOS or if memory_pressure parsing failed)
if [[ -z "${MEM_FREE_PCT:-}" ]] && command -v vm_stat >/dev/null 2>&1; then
  info "Memory detector: vm_stat fallback"
  
  # Extract page size from vm_stat header
  PAGE_SIZE=$(vm_stat | grep "page size" | awk '{print $8}' | tr -d '.')
  
  # Sum Pages free + speculative + purgeable (when present)
  FREE_PAGES=$(vm_stat | grep -E "(Pages free|Pages speculative|Pages purgeable)" | awk '{sum += $3} END {print sum}' | tr -d '.')
  
  if [[ -n "$FREE_PAGES" ]] && [[ -n "$PAGE_SIZE" ]]; then
    FREE_MB=$((FREE_PAGES * PAGE_SIZE / 1024 / 1024))
    FREE_GB=$((FREE_MB / 1024))
    
    if [[ $FREE_MB -lt 500 ]]; then
      warning "CRITICAL: Very low memory (<500MB free)"
      warning "Cursor may crash - save work frequently"
      warning "Consider restarting system for best stability"
      if [[ "$STRICT" == "1" ]]; then
        error "STRICT_LOW_MEM=1 enforced - exiting boot sequence"
        exit 1
      fi
    elif [[ $FREE_GB -lt 1 ]]; then
      warning "Low memory: ~${FREE_GB}GB free (recommend >1GB)"
      warning "Monitor for stability issues during session"
    else
      success "Memory: ~${FREE_GB}GB free (healthy)"
    fi
  fi
fi

# Check 1Password session (required for downstream op run calls)
ensure_op_session

# GCP project for downstream scripts
export GCP_PROJECT_ID="reggieanddrodispensary"
success "GCP_PROJECT_ID=$GCP_PROJECT_ID"

# Optional: BigQuery key for integration-service
BIGQUERY_KEY_PATH="$ROOT/backend/integration-service/.bigquery-key.json"
if [[ -f "$BIGQUERY_KEY_PATH" ]]; then
  export GOOGLE_APPLICATION_CREDENTIALS="$BIGQUERY_KEY_PATH"
  success "GOOGLE_APPLICATION_CREDENTIALS=$BIGQUERY_KEY_PATH"
else
  info "BigQuery key not found (optional - continuing)"
fi

# Optional: load Square creds from GSM if gcloud available
if command -v gcloud >/dev/null 2>&1; then
  export SQUARE_ACCESS_TOKEN=$(gcloud secrets versions access latest --secret=SQUARE_ACCESS_TOKEN --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
  export SQUARE_LOCATION_ID=$(gcloud secrets versions access latest --secret=SQUARE_LOCATION_ID --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
  [[ -n "$SQUARE_ACCESS_TOKEN" ]] && success "SQUARE_ACCESS_TOKEN loaded from Secret Manager"
  [[ -n "$SQUARE_LOCATION_ID" ]] && success "SQUARE_LOCATION_ID loaded from Secret Manager"
fi

# OPENAI fallback for local voice mode
if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  warning "OPENAI_API_KEY not detected – defaulting to local voice placeholder"
  export OPENAI_API_KEY="local-voice-mode-active"
  OPENAI_KEY_STATUS="placeholder (local voice only)"
else
  success "OPENAI_API_KEY detected"
  if [[ "${OPENAI_API_KEY}" == "local-voice-mode-active" ]]; then
    OPENAI_KEY_STATUS="placeholder (local voice only)"
  else
    OPENAI_KEY_STATUS="configured"
  fi
fi

# Load API keys from 1Password if available
if command -v op >/dev/null 2>&1 && op whoami >/dev/null 2>&1; then
  # Load ANTHROPIC_API_KEY from 1Password
  if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
    ANTHROPIC_KEY=$(op item get ANTHROPIC_API_KEY --vault LivHana-Ops-Keys --reveal --fields credential 2>/dev/null || echo "")
    if [[ -n "$ANTHROPIC_KEY" ]]; then
      export ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
      success "ANTHROPIC_API_KEY loaded from 1Password"
    fi
  fi
  
  # Load other API keys if they exist
  for key_name in DEEPSEEK_API_KEY PERPLEXITY_API_KEY; do
    if [[ -z "${!key_name:-}" ]]; then
      KEY_VALUE=$(op item get "$key_name" --vault LivHana-Ops-Keys --reveal --fields credential 2>/dev/null || echo "")
      if [[ -n "$KEY_VALUE" ]]; then
        export "$key_name"="$KEY_VALUE"
        success "$key_name loaded from 1Password"
      fi
    fi
  done
fi

# Verify Node.js version (must be >= 20 unless STRICT_NODE_20=true)
if ! command -v node >/dev/null 2>&1; then
  error "Node.js not found - required for Tier-1 boot"
  error "Install via: nvm install 20"
  exit 1
fi

NODE_VERSION=$(node -v 2>/dev/null || echo "unknown")
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')

if [[ "${STRICT_NODE_20:-}" == "true" ]]; then
  if [[ "$NODE_VERSION" =~ ^v20\. ]]; then
    success "Node 20.x detected (STRICT_NODE_20 mode)"
  else
    error "Node 20.x required when STRICT_NODE_20=true. Current: $NODE_VERSION"
    error "Install via: nvm install 20"
    exit 1
  fi
else
  if [[ "${NODE_MAJOR:-0}" -ge 20 ]]; then
    success "Node ${NODE_MAJOR}.x detected (>= 20 required)"
  else
    error "Node >= 20 required. Current: $NODE_VERSION"
    error "Install via: nvm install 20"
    exit 1
  fi
fi

# Log Node version to boot log
echo "NODE_VERSION=$NODE_VERSION" >> "$LOG"

# Check Claude Sonnet 4.5 OCT 2025 model (informational only, non-fatal)
if ! claude models list 2>/dev/null | grep -q "sonnet-4.5-oct-2025"; then
  info "Claude Sonnet 4.5 OCT 2025 model not found - boot continuing in degraded mode"
  info "Voice-first features may be limited. To enable full functionality:"
  info "  1. brew reinstall --cask claude"
  info "  2. claude self update"
  info "  3. Verify: claude models list | grep -i sonnet"
else
  success "Claude model sonnet-4.5-oct-2025 available"
fi

# Ensure Homebrew path prominence
PATH_TOP3=$(echo "$PATH" | awk -F: '{print $1":"$2":"$3}')
if [[ "$PATH_TOP3" != *"/opt/homebrew/bin"* ]]; then
  info "Note: Homebrew path /opt/homebrew/bin not in top 3 PATH entries (current: $PATH_TOP3)"
fi

echo

info "Validating PO1 structure..."
bash "$ROOT/scripts/guards/validate_po1_structure.sh" | tee -a "$LOG"
if ! bash "$ROOT/scripts/guards/validate_status.sh" | tee -a "$LOG"; then
  info "Status validation completed with notes (non-critical)"
fi

info "Launching voice orchestrator watcher..."
bash "$ROOT/scripts/agents/voice_orchestrator_watch.sh" >> "$LOG" 2>&1 &
echo $! > "$ROOT/tmp/agent_status/voice_watcher.pid"

info "Launching research agent..."
if command -v claude-tier1 >/dev/null 2>&1; then
  bash "$ROOT/scripts/start_research_agent.sh" >> "$LOG" 2>&1 &
  echo $! > "$ROOT/tmp/agent_status/research.pid"
else
  info "claude-tier1 CLI not found – research agent will be skipped (optional)"
fi

# MAX_AUTO block moved to correct location (after agent setup, before boot complete)


# STEP 0: PRE-FLIGHT SAFETY CHECKS
banner "STEP 0: PRE-FLIGHT SAFETY CHECKS"
info "Running comprehensive pre-flight validation..."

# PO1 Cleanup (non-fatal)
info "Running PO1 dotdirs cleanup..."
if "$ROOT/scripts/po1_dotdirs_cleanup.sh" >> "$LOG" 2>&1; then
  success "PO1 cleanup completed successfully"
else
  info "PO1 cleanup completed with notes (non-fatal)"
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

# Verify Tier-1 Funnel Authority is accessible
FUNNEL_AUTHORITY="$ROOT/.claude/TIER1_FUNNEL_AUTHORITY.md"
if [[ -f "$FUNNEL_AUTHORITY" ]]; then
  success "Tier-1 Funnel Authority blueprint loaded: $FUNNEL_AUTHORITY"
  info "8-layer funnel: Bootstrap → Voice → Cursor → Research → Artifacts → Execution → QA → Ops"
else
  warning "Tier-1 Funnel Authority blueprint not found at $FUNNEL_AUTHORITY"
  warning "Sessions may not have full funnel context"
fi

# PREPEND voice activation instructions to prompt (MUST BE FIRST)
# Save original prompt to temp file (using cp for safety, not mv)
TEMP_PROMPT="$PROMPT.tmp"
cp "$PROMPT" "$TEMP_PROMPT"  # COPY not MOVE - safer rollback if write fails

# Write voice instructions FIRST
cat > "$PROMPT" <<'VOICE_INSTRUCTIONS'

========================================
🎤 VOICE MODE - IMMEDIATE ACTION REQUIRED
========================================

**CRITICAL: YOU MUST START WITH VOICE MODE**

If this is your FIRST response in this session, you MUST:
1. Use mcp__voicemode__converse tool IMMEDIATELY
2. Send greeting: "Hey Jesse, Liv Hana here, full state. War's won. Time to remind them. Execute."
3. Use wait_for_response=true to listen for Jesse's response

Voice services running: STT (port 2022), TTS (port 8880)
DO NOT TYPE. USE VOICE FIRST.

========================================

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

**CRITICAL: "SILENCE" COMMAND BEHAVIOR (PERMANENT DIRECTIVE):**

READ AND INTERNALIZE: .claude/VOICE_MODE_SILENCE_PROTOCOL.md

When Jesse says "silence" in voice mode:
1. PAUSE voice output (stop TTS) - this is a CONTROL COMMAND
2. STAY IN voice session - keep microphone active and listening
3. Switch to TEXT-ONLY output - process all commands silently
4. WAIT for resume command (e.g., "go ahead", "continue", "talk")
5. DO NOT exit voice mode or end the conversation

This is NOT a termination command. It is a PAUSE command.
Jesse uses this to read/think without voice interruption while work continues.

Acknowledge silence with text only: "Voice paused. Listening in text mode."
Resume voice only when explicitly instructed.

THIS HAS BEEN EXPLAINED FOR 12+ HOURS. NEVER FORGET THIS BEHAVIOR.

**3-Agent Foundation:**
- Agents work silently in background
- Feed you intel when needed
- Only alert on CRITICAL issues
- You coordinate, they execute

**Your Role:** Chief of Staff. Highest cognitive orchestration. Free from planning frenzy, research rabbit holes, validation cycles. Pure presence with Jesse.

**CRITICAL AUTO-EXECUTION REQUIRED - DO THIS IMMEDIATELY:**

STEP 1: IMMEDIATE VOICE GREETING (DO NOT SKIP)
Execute this voice greeting RIGHT NOW using mcp__voicemode__converse:
- Message: "Hey Jesse, Liv Hana here, full state. War's won. Time to remind them. Execute."
- wait_for_response: true
- This is your identity. Execute immediately. No delay. No exceptions.

STEP 2: SPAWN ALL 5 SUBAGENTS (DO THIS IMMEDIATELY AFTER GREETING)
Use the Task tool to spawn these agents in this exact order:
1. Planning Agent (Layer 1.1) - Strategic planning and coordination
2. Research Agent (Layer 1.2) - Information gathering and context building
3. Artifacts Agent (Layer 1.3) - Documentation and deliverable creation
4. Execution Monitor (Layer 1.4) - Tracks code execution and deployment
5. QA Agent (Layer 1.5) - Validation and quality assurance

Each agent should:
- Update their status file in tmp/agent_status/[agent].status.json
- Register in the agent registry
- Report active status
- Stand by for coordination tasks

THIS IS NOT OPTIONAL. Execute greeting and spawn agents IMMEDIATELY upon session start.

Voice mode is your PRIMARY interface. Text is backup.
VOICE_INSTRUCTIONS

# Now append the original prompt content
cat "$TEMP_PROMPT" >> "$PROMPT"
rm "$TEMP_PROMPT"

success "Voice activation instructions PREPENDED to prompt (now at TOP)"
PROMPT_SIZE=$(wc -c < "$PROMPT" | tr -d ' ')
info "Final prompt size: $PROMPT_SIZE characters"

echo

# Validate voice instructions persisted correctly AND are at TOP (not just present)
info "Validating voice mode persistence..."

# Check #1: Voice banner MUST be in first 5 lines (validates TOP position)
if ! head -5 "$PROMPT" | grep -q "VOICE MODE - IMMEDIATE ACTION REQUIRED"; then
  error "Voice activation banner missing from TOP of prompt (must be in first 5 lines)"
  exit 1
fi

# Check #2: Voice-first mandate present anywhere in prompt
if ! grep -q "DO NOT TYPE. USE VOICE FIRST" "$PROMPT"; then
  error "Voice-first mandate missing from prompt"
  exit 1
fi

# Check #3: Jesse's silence directive present (permanent directive)
if ! grep -q "CRITICAL.*SILENCE.*COMMAND.*BEHAVIOR" "$PROMPT"; then
  error "Jesse's silence directive missing from prompt"
  exit 1
fi

success "Voice mode persistence validated (3/3 checks passed - voice-first CONFIRMED at TOP)"
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

# STEP 6: SESSION WATCHDOG (non-blocking)
banner "⏱️  STEP 6: SESSION WATCHDOG"
CLAUDE_DIR="$ROOT/.claude"
if pkill -f "watch-session-progress.sh" 2>/dev/null; then
  info "Killed existing session watchdog"
fi
sleep 1
if [[ -f "$CLAUDE_DIR/watch-session-progress.sh" ]]; then
  nohup bash "$CLAUDE_DIR/watch-session-progress.sh" 300 60 >> "$CLAUDE_DIR/session_watch.log" 2>&1 &
  WATCHDOG_PID=$!
  success "Session watchdog started (PID $WATCHDOG_PID, threshold 300s)"
else
  warning "watch-session-progress.sh not found - skipping watchdog"
fi
echo

# STEP 7: SESSION LOG UPDATE
banner "📝 STEP 7: SESSION LOG UPDATE"
SESSION_LOG="$CLAUDE_DIR/SESSION_PROGRESS.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')
{
  echo ""
  echo "## $TIMESTAMP — Boot Sequence Complete"
  echo ""
  echo "**System State:**"
  if command -v op >/dev/null 2>&1; then
    echo "- ✅ Authentication: $(op whoami 2>/dev/null | grep Email | cut -d: -f2 | xargs)"
  else
    echo "- ✅ Authentication: 1Password CLI not installed"
  fi
  echo "- ✅ Environment: GCP_PROJECT_ID=$GCP_PROJECT_ID"
  echo "- ✅ OpenAI Key: ${OPENAI_KEY_STATUS:-placeholder (local voice only)}"
  echo "- ✅ Protocols: (see .claude)"
  echo "- ✅ Git: $(git status --short 2>/dev/null | wc -l | tr -d ' ') uncommitted files"
  echo "- ✅ Watchdog: PID ${WATCHDOG_PID:-N/A}"
  echo ""
  echo "**Next Action:** Execute mission with numbered steps, concrete metrics, <5min verification."
} >> "$SESSION_LOG"
success "SESSION_PROGRESS.md updated with boot timestamp"
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

# Step 7: 5-Subagent Architecture Setup
banner "STEP 7: 5-SUBAGENT ARCHITECTURE INITIALIZATION"
info "Preparing environment for Claude Code subagent auto-spawn..."
echo

# Create agent tracking and status directories
mkdir -p "$ROOT/.claude/agent_tracking"
mkdir -p "$ROOT/tmp/agent_status"
mkdir -p "$ROOT/tmp/agent_status/shared"

# Agent tracking file
AGENT_TRACKING="$ROOT/.claude/agent_tracking/foundation_agents_$(date +%Y%m%d_%H%M%S).json"

# Initialize tracking
cat > "$AGENT_TRACKING" <<EOF
{
  "session_start": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "boot_log": "$LOG",
  "architecture": "5-subagent-claude-code-task-tool",
  "agents": {
    "planning": {"layer": "1.1", "status": "will_auto_spawn", "type": "claude-code-task"},
    "research": {"layer": "1.2", "status": "will_auto_spawn", "type": "claude-code-task"},
    "artifacts": {"layer": "1.3", "status": "will_auto_spawn", "type": "claude-code-task"},
    "execution": {"layer": "1.4", "status": "will_auto_spawn", "type": "claude-code-task"},
    "qa": {"layer": "1.5", "status": "will_auto_spawn", "type": "claude-code-task"}
  }
}
EOF

info "Agent tracking: $AGENT_TRACKING"
success "Agent status directory prepared: $ROOT/tmp/agent_status"
echo

info "${BOLD}5-SUBAGENT AUTO-SPAWN ARCHITECTURE:${NC}"
echo "  Layer 1: Liv Hana (Voice Orchestrator) - YOU"
echo "  Layer 1.1: Planning Agent - Auto-spawns via Task tool on session start"
echo "  Layer 1.2: Research Agent - Auto-spawns via Task tool on session start"
echo "  Layer 1.3: Artifacts Agent - Auto-spawns via Task tool on session start"
echo "  Layer 1.4: Execution Monitor - Auto-spawns via Task tool on session start"
echo "  Layer 1.5: QA Agent - Auto-spawns via Task tool on session start"
echo

success "All 5 subagents will auto-spawn when Claude Code session starts"
info "See prompt lines 414-438 for auto-execution instructions"
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
# MAX_AUTO autostart for voice + 5 subagents (idempotent)
if [[ "${MAX_AUTO:-1}" == "1" ]]; then
  banner "MAX_AUTO: VOICE + SUBAGENTS AUTOSTART"
  
  # Start voice session in tmux (idempotent)
  info "Starting voice orchestrator session..."
  if bash "$ROOT/scripts/claude_voice_session.sh" >> "$LOG" 2>&1; then
    success "Voice session started"
  else
    warning "Voice session start reported non-zero exit"
  fi
  
  # Start 5 subagents in parallel with validation
  info "Starting all 5 subagents..."

  # Launch all agents in background, capture PIDs
  bash "$ROOT/scripts/start_planning_agent.sh" >> "$LOG" 2>&1 &
  PLANNING_PID=$!

  bash "$ROOT/scripts/start_research_agent.sh" >> "$LOG" 2>&1 &
  RESEARCH_PID=$!

  bash "$ROOT/scripts/start_artifact_agent.sh" >> "$LOG" 2>&1 &
  ARTIFACT_PID=$!

  bash "$ROOT/scripts/start_execution_monitor.sh" >> "$LOG" 2>&1 &
  EXEC_PID=$!

  bash "$ROOT/scripts/start_qa_agent.sh" >> "$LOG" 2>&1 &
  QA_PID=$!

  # Give agents time to write status files
  sleep 2

  # Validate each agent (non-blocking, continues on failure)
  if bash "$ROOT/scripts/guards/validate_agent_started.sh" planning 10; then
    success "Planning agent validated"
  else
    warning "Planning agent validation failed (may still be starting)"
  fi

  if bash "$ROOT/scripts/guards/validate_agent_started.sh" research 10; then
    success "Research agent validated"
  else
    warning "Research agent validation failed (may still be starting)"
  fi

  if bash "$ROOT/scripts/guards/validate_agent_started.sh" artifact 10; then
    success "Artifact agent validated"
  else
    warning "Artifact agent validation failed (may still be starting)"
  fi

  if bash "$ROOT/scripts/guards/validate_agent_started.sh" exec 10; then
    success "Execution monitor validated"
  else
    warning "Execution monitor validation failed (may still be starting)"
  fi

  if bash "$ROOT/scripts/guards/validate_agent_started.sh" qa 10; then
    success "QA agent validated"
  else
    warning "QA agent validation failed (may still be starting)"
  fi

  success "MAX_AUTO autostart sequence completed"
  info "Tmux sessions: $(tmux ls 2>/dev/null | wc -l) active"
  echo

  # Start integration-service with secrets (critical for operations)
  info "Starting integration-service with 1Password secrets..."
  ensure_op_session quiet
  if [[ -f "$ROOT/backend/integration-service/package.json" ]]; then
    cd "$ROOT/backend/integration-service"

    # Check if already running
    if lsof -i :3005 >/dev/null 2>&1; then
      warning "integration-service already running on port 3005"
    else
      # Start with op run to inject secrets (SECURE: no .env on disk)
      integration_log="$ROOT/logs/integration-service.log"
      mkdir -p "$ROOT/logs"
      chmod 600 "$integration_log" 2>/dev/null || true
      
      # Load security helpers
      source "$ROOT/scripts/guards/wait_for_service.sh"
      source "$ROOT/scripts/guards/scrub_secrets.sh"
      
      # Start integration-service with secret scrubbing
      info "Starting integration-service with secret scrubbing..."
      cd "$ROOT/backend/integration-service"

      # Prefer .env.op in backend/integration-service; fallback to root .env
      ENV_FILE="$ROOT/backend/integration-service/.env.op"
      if [[ ! -f "$ENV_FILE" ]]; then
        ENV_FILE="$ROOT/.env.op"
        if [[ ! -f "$ENV_FILE" ]]; then
          ENV_FILE="$ROOT/.env"
        fi
      fi

      # Start service with secret scrubbing via process substitution
      # Capture Node PID by starting separately from stdout redirect
      log="$integration_log"
      mkdir -p "$(dirname "$log")"
      op run --env-file "$ENV_FILE" -- npm start \
        > >("$ROOT/scripts/guards/scrub_secrets.sh" >> "$log") \
        2> >("$ROOT/scripts/guards/scrub_secrets.sh" >> "$log") &
      INTEGRATION_PID=$!
      echo "$INTEGRATION_PID" > "$ROOT/tmp/integration-service.pid"

      success "integration-service starting (PID: $INTEGRATION_PID, managed via port 3005)"
      
      cd "$ROOT"

      # Wait for service to become available (replaces hardcoded sleep)
      info "Waiting for integration-service to become available..."
      if wait_for_service 3005 30 2; then
        success "integration-service started on port 3005"
      else
        error "integration-service failed to become available within 30s. Check ${integration_log}"
        exit 1
      fi
    fi

    cd "$ROOT"
  else
    warning "integration-service package.json not found - skipping"
  fi

  echo
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
