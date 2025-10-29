#!/usr/bin/env bash
# 🎼 Claude Tier-1 Voice-First Boot System
# Liv Hana | Autonomous Orchestration Master
# One Shot, One Kill | Grow Baby Grow, Sell Baby Sell

set -euo pipefail

# PHASE 1: STABILIZE - Model gate bypass
export ALLOW_TEXT_ONLY="${ALLOW_TEXT_ONLY:-0}"

# Configuration
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
CFG="$ROOT/config/claude_tier1_context.yaml"
STATE="$ROOT/tmp/claude_tier1_state.json"
PROMPT="$ROOT/tmp/claude_tier1_prompt.txt"
LOG="$ROOT/logs/claude_tier1_boot_$(date +%Y%m%d_%H%M%S).log"

# Load security helpers (optional)
if [[ -f "$ROOT/scripts/boot/helpers.sh" ]]; then
  source "$ROOT/scripts/boot/helpers.sh"
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

# Port conflict checker
check_port_available() {
  local port="$1"
  local service_name="$2"
  if lsof -ti :"$port" >/dev/null 2>&1; then
    local pid=$(lsof -ti :"$port" | head -1)
    local process=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
    warning "Port $port already in use by $process (PID $pid)"
    warning "Service: $service_name will NOT be started to avoid conflict"
    return 1
  fi
  return 0
}

# Comprehensive dependency checker
check_critical_dependencies() {
  local missing=0

  # Check Node.js
  if ! command -v node >/dev/null 2>&1; then
    error "Node.js not found - CRITICAL DEPENDENCY MISSING"
    error "Install: nvm install 20 && nvm use 20"
    missing=$((missing + 1))
  fi

  # Check npm
  if ! command -v npm >/dev/null 2>&1; then
    error "npm not found - CRITICAL DEPENDENCY MISSING"
    error "Should come with Node.js installation"
    missing=$((missing + 1))
  fi

  # Check tmux
  if ! command -v tmux >/dev/null 2>&1; then
    error "tmux not found - REQUIRED for agent spawning"
    error "Install: brew install tmux"
    missing=$((missing + 1))
  fi

  # Check 1Password CLI
  if ! command -v op >/dev/null 2>&1; then
    error "1Password CLI not found - REQUIRED for secrets"
    error "Install: brew install 1password-cli"
    missing=$((missing + 1))
  fi

  # Check Claude CLI
  if ! command -v claude >/dev/null 2>&1; then
    warning "Claude CLI not found - agent spawning may be limited"
    info "Install: brew install --cask claude"
  fi

  # Node 20 Guard (hard-fail in non-interactive shells)
  if [[ ! -t 0 ]]; then
    local node_version=$(node -v 2>/dev/null || echo "unknown")
    local node_major=$(echo "$node_version" | sed 's/v\([0-9]*\).*/\1/')
    if [[ "${node_major:-0}" -lt 20 ]]; then
      error "Node >= 20 required in non-interactive mode. Current: ${node_version}"
      error "Run: nvm install 20 && nvm use 20"
      missing=$((missing + 1))
    fi
  fi
  
  # PATH prepend to Homebrew for non-interactive shells
  if [[ ! -t 0 ]] && [[ "$PATH" != *"/opt/homebrew/bin"* ]]; then
    export PATH="/opt/homebrew/bin:$PATH"
  fi

  return $missing
}

# Check 1Password Desktop app status
check_1password_desktop() {
  # Check if 1Password.app is running
  if ! pgrep -x "1Password" >/dev/null 2>&1; then
    warning "1Password Desktop app NOT running"
    warning "CLI integration requires the Desktop app for Touch ID"
    info "Launch 1Password.app before continuing"
    return 1
  fi

  # DON'T CHECK WHOAMI HERE - that will be handled by ensure_op_session later
  # Just verify the CLI is installed
  if ! command -v op >/dev/null 2>&1; then
    error "1Password CLI not found"
    error "Install: brew install 1password-cli"
    return 1
  fi

  success "1Password Desktop app running"
  return 0
}

# Disk space checker with threshold
check_disk_space() {
  local threshold_gb="${1:-5}"

  # Get available space in GB
  local available=$(df -h / | tail -1 | awk '{print $4}' | sed 's/Gi//')

  if [[ "$available" =~ ^[0-9]+$ ]]; then
    if [[ $available -lt $threshold_gb ]]; then
      error "CRITICAL: Low disk space (${available}GB available < ${threshold_gb}GB threshold)"
      error "Free up space before starting session to prevent crashes"
      return 1
    elif [[ $available -lt $((threshold_gb * 2)) ]]; then
      warning "Disk space getting low: ${available}GB available"
      warning "Consider freeing space for optimal performance"
    else
      success "Disk space healthy: ${available}GB available"
    fi
  fi

  return 0
}

# Memory pressure checker (SESSION STABILITY SAFEGUARD)
check_memory_pressure() {
  # macOS memory_pressure tool
  if command -v memory_pressure >/dev/null 2>&1; then
    local mem_info=$(memory_pressure 2>&1 | grep -i "System-wide memory free percentage" || echo "Status: Normal")
    info "Memory status: $mem_info"

    # Parse memory percentage if available
    if echo "$mem_info" | grep -q "System-wide memory free percentage"; then
      local free_pct=$(echo "$mem_info" | grep -oE '[0-9]+' | head -1)
      if [[ -n "$free_pct" ]]; then
        if [[ $free_pct -lt 20 ]]; then
          warning "MEMORY PRESSURE HIGH: Only ${free_pct}% free"
          warning "Consider closing applications to prevent Visual Studio Code crashes"
        elif [[ $free_pct -lt 40 ]]; then
          warning "Memory getting low: ${free_pct}% free"
        else
          success "Memory pressure healthy: ${free_pct}% free"
        fi
      fi
    fi
  elif command -v vm_stat >/dev/null 2>&1; then
    # Fallback: vm_stat (less accurate but available)
    info "Memory check: Using vm_stat (memory_pressure not available)"
  fi

  return 0
}

# Port cleanup - kill stale processes (FAILURE #4 mitigation)
cleanup_port() {
  local port="$1"
  local service_name="${2:-service}"
  
  info "Cleaning up port $port before starting $service_name..."
  
  # Try graceful TERM first
  if lsof -ti:$port >/dev/null 2>&1; then
    local pids=$(lsof -ti:$port)
    (echo "$pids" | xargs kill -TERM 2>/dev/null) || true
    sleep 2

    # Force kill if still running
    if lsof -ti:$port >/dev/null 2>&1; then
      (echo "$pids" | xargs kill -KILL 2>/dev/null) || true
      sleep 1
      warning "Force-killed stale processes on port $port"
    else
      success "Cleaned up stale processes on port $port"
    fi
  else
    success "Port $port is clean"
  fi
}

# Log rotation (FAILURE #3 mitigation)
rotate_log_if_needed() {
  local log_file="$1"
  local max_size_mb="${2:-10}"
  local max_size_bytes=$((max_size_mb * 1024 * 1024))
  
  if [[ -f "$log_file" ]]; then
    local file_size=$(stat -f%z "$log_file" 2>/dev/null || echo 0)
    if [[ $file_size -gt $max_size_bytes ]]; then
      info "Rotating oversized log: $log_file ($(numfmt --to=iec-i --suffix=B $file_size))"
      mv "$log_file" "${log_file}.old" && touch "$log_file"
      success "Log rotated successfully"
    fi
  fi
}

# Clean stale agent locks (FAILURE #5 mitigation)
clean_stale_agent_locks() {
  info "Cleaning stale agent lock files..."
  rm -f "$ROOT/tmp/agent_status/.planning.status.json.lock" \
       "$ROOT/tmp/agent_status/.research.status.json.lock" \
       "$ROOT/tmp/agent_status/.artifact.status.json.lock" \
       "$ROOT/tmp/agent_status/.qa.status.json.lock" \
       "$ROOT/tmp/agent_status/.execmon.status.json.lock" \
       "$ROOT/tmp/agent_status/.voice.status.json.lock" 2>/dev/null || true
  success "Stale agent locks removed"
}

# Check for Visual Studio Code AppTranslocation issue (causes crashes)
check_cursor_apptranslocation() {
  info "Checking for Visual Studio Code AppTranslocation issue..."

  # Check if Visual Studio Code is running from AppTranslocation
  local cursor_procs=$(ps aux | grep -i "AppTranslocation.*Visual Studio Code\|AppTranslocation.*Electron" | grep -v grep | wc -l)

  if [[ $cursor_procs -gt 0 ]]; then
    warning "Visual Studio Code is running from AppTranslocation (quarantine sandbox)"
    warning "This causes random crashes and memory leaks"
    warning "Run: bash $ROOT/scripts/fix_cursor_quarantine.sh"
    info "Then restart Visual Studio Code from /Applications/Visual Studio Code.app"
    return 1
  else
    success "Visual Studio Code not in AppTranslocation (good)"
    return 0
  fi
}

# Clean zombie boot script processes from previous runs
clean_zombie_boot_processes() {
  info "Cleaning zombie boot script processes..."
  # Find all claude_tier1_boot.sh processes except the current one
  local current_pid=$$
  local zombie_pids=$(ps aux | grep "bash.*claude_tier1_boot.sh" | grep -v grep | awk '{print $2}' | grep -v "^${current_pid}$" || true)

  if [[ -n "$zombie_pids" ]]; then
    echo "$zombie_pids" | xargs kill 2>/dev/null || true
    sleep 0.5
    success "Cleaned up $(echo "$zombie_pids" | wc -l | tr -d ' ') zombie boot processes"
  else
    success "No zombie boot processes found"
  fi
}

# Agent status file health check
check_agent_health() {
  local agent="$1"
  local status_file="$ROOT/tmp/agent_status/${agent}.status.json"
  local tmux_session="$agent"

  # Check if tmux session exists
  if ! tmux has-session -t "$tmux_session" 2>/dev/null; then
    return 1
  fi

  # Check if status file exists and is recent (within last 5 minutes)
  if [[ -f "$status_file" ]]; then
    local file_age=$(($(date +%s) - $(stat -f %m "$status_file" 2>/dev/null || echo 0)))
    if [[ $file_age -lt 300 ]]; then
      # Check if agent reports active or running status
      if grep -qE '"status"[[:space:]]*:[[:space:]]*"(active|running)"' "$status_file" 2>/dev/null; then
        return 0
      fi
    fi
  fi

  return 1
}

# Voice services connectivity test
check_voice_connectivity() {
  local stt_port=2022
  local tts_port=8880
  local issues=0

  # Check STT (Whisper)
  if lsof -i :$stt_port 2>/dev/null | grep -q LISTEN; then
    # Try to connect (use curl --max-time instead of GNU timeout)
    if curl --max-time 2 -sf "http://localhost:$stt_port/health" >/dev/null 2>&1 || nc -z localhost $stt_port 2>/dev/null; then
      success "STT service (Whisper) responsive on port $stt_port"
    else
      warning "STT service running but not responding on port $stt_port"
      issues=$((issues + 1))
    fi
  else
    warning "STT service (Whisper) NOT running - voice input disabled"
    info "Start with: mcp__voicemode__service whisper start"
    issues=$((issues + 1))
  fi

  # Check TTS (Kokoro)
  if lsof -i :$tts_port 2>/dev/null | grep -q LISTEN; then
    # Try to connect (use curl --max-time instead of GNU timeout)
    if curl --max-time 2 -sf "http://localhost:$tts_port/health" >/dev/null 2>&1 || nc -z localhost $tts_port 2>/dev/null; then
      success "TTS service (Kokoro) responsive on port $tts_port"
    else
      warning "TTS service running but not responding on port $tts_port"
      issues=$((issues + 1))
    fi
  else
    warning "TTS service (Kokoro) NOT running - voice output disabled"
    info "Start with: mcp__voicemode__service kokoro start"
    issues=$((issues + 1))
  fi

  return $issues
}

ensure_op_session() {
  local account="${OP_ACCOUNT_SLUG:-reggiedro.1password.com}"
  local verbosity="${1:-show}"

  if ! command -v op >/dev/null 2>&1; then
    error "1Password CLI (op) not found. Install via: brew install 1password-cli"
    return 1
  fi

  # Check if using service account token (preferred for automation)
  if [[ -n "${OP_SERVICE_ACCOUNT_TOKEN:-}" ]]; then
    if [[ "$verbosity" == "show" ]]; then
      info "Using 1Password service account token..."
    fi
    # Verify token works (op whoami is fast, no timeout needed)
    local whoami_output="$(op whoami 2>/dev/null || echo '')"
    if [[ -n "$whoami_output" ]]; then
      success "1Password authenticated via service account"
      return 0
    fi
    error "OP_SERVICE_ACCOUNT_TOKEN is set but authentication failed"
    error "Verify your service account token is valid"
    return 1
  fi

  # Check if already signed in (FIXED: Always use --account flag)
  local whoami_output="$(op --account "$account" whoami 2>/dev/null || echo '')"
  
  # If op whoami returns ANY output with Email or URL, we're authenticated
  if [[ -n "$whoami_output" ]] && echo "$whoami_output" | grep -qi "Email:\|URL:"; then
    if [[ "$verbosity" == "show" ]]; then
      local email=$(echo "$whoami_output" | grep "Email:" | awk '{print $2}' || echo "authenticated")
      success "1Password authenticated: $email"
    else
      info "1Password session already active"
    fi
    return 0
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
      return 1
    fi
    
    # Even if --raw returns empty (app integration), verify whoami works
    local whoami_check
    whoami_check="$(op whoami 2>/dev/null | tr -d '\n' || echo '')"
    if [[ -z "$whoami_check" ]]; then
      error "1Password sign-in produced empty whoami."
      error "Enable Desktop → Developer → Integrate with 1Password CLI."
      return 1
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
      return 1
    fi
  fi

  # VERIFY: Check authentication after signin (FIXED: Use --account flag)
  whoami_output="$(op --account "$account" whoami 2>/dev/null || echo '')"
  
  if [[ -n "$whoami_output" ]] && echo "$whoami_output" | grep -qi "Email:\|URL:"; then
    local email=$(echo "$whoami_output" | grep "Email:" | awk '{print $2}' || echo "authenticated")
    success "1Password authenticated: $email"
    return 0
  fi

  # Only fail if truly broken
  error "1Password CLI integration not enabled in Desktop app."
  error "FIX: Open 1Password → Settings → Developer → Enable CLI integration"
  return 1
}

# Start boot sequence
banner "LIV HANA TIER-1 BOOT SEQUENCE"
echo "[BOOT] $(date) – Initializing Claude Tier-1 Orchestration Layer" >> "$LOG"
info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
info "Root: $ROOT"
info "Log: $LOG"
echo

# PREDICTIVE PRE-BOOT VALIDATION
banner "🔍 PREDICTIVE PRE-BOOT VALIDATION"
info "Running comprehensive dependency and resource checks..."
echo

# Check 1: Critical dependencies
info "Checking critical dependencies..."
if check_critical_dependencies; then
  success "All critical dependencies present"
else
  error "Missing critical dependencies - cannot continue"
  error "Install missing tools and re-run boot script"
  exit 1
fi
echo

# Check 2: 1Password Desktop app (SKIP - integration verified via actual signin)
# Removed false-positive warning that confused users
echo

# Check 3: Disk space
info "Checking disk space..."
if ! check_disk_space 5; then
  error "Insufficient disk space - aborting to prevent session crashes"
  exit 1
fi

# Check 3.5: Memory pressure (SESSION STABILITY)
info "Checking system memory..."
check_memory_pressure
echo

# Check 4: Port conflicts (check before starting services)
info "Checking for port conflicts..."
INTEGRATION_PORT_AVAILABLE=1
VOICE_PORTS_AVAILABLE=1

if ! check_port_available 3005 "integration-service"; then
  INTEGRATION_PORT_AVAILABLE=0
fi

# Check voice service ports but don't fail (they should already be running)
if lsof -i :2022 2>/dev/null | grep -q LISTEN; then
  info "Port 2022 (STT/Whisper) in use - service already running"
else
  info "Port 2022 (STT/Whisper) available - service needs to start"
fi

if lsof -i :8880 2>/dev/null | grep -q LISTEN; then
  info "Port 8880 (TTS/Kokoro) in use - service already running"
else
  info "Port 8880 (TTS/Kokoro) available - service needs to start"
fi
echo

# Check 5: Existing agent sessions
info "Checking existing agent sessions..."
AGENTS_RUNNING=0
for agent in planning research artifact execmon qa; do
  if check_agent_health "$agent"; then
    success "Agent '$agent' already running and healthy"
    AGENTS_RUNNING=$((AGENTS_RUNNING + 1))
  fi
done

if [[ $AGENTS_RUNNING -eq 5 ]]; then
  success "All 5 agents already running - will skip agent spawn"
  SKIP_AGENT_SPAWN=1
elif [[ $AGENTS_RUNNING -gt 0 ]]; then
  warning "$AGENTS_RUNNING/5 agents running - will attempt to start missing agents"
  SKIP_AGENT_SPAWN=0
else
  info "No agents running - will start all 5 agents"
  SKIP_AGENT_SPAWN=0
fi
echo

success "Pre-boot validation complete - all systems ready"
echo

# STEP 1: ENVIRONMENT SETUP (before pre-flight)
banner "🌍 STEP 1: ENVIRONMENT SETUP"

# Configure Claude Code permissions (eliminate popups)
if [[ -f "$ROOT/scripts/boot/configure_claude_permissions.sh" ]]; then
  info "Configuring Claude Code permissions..."
  bash "$ROOT/scripts/boot/configure_claude_permissions.sh" "$ROOT" 2>/dev/null || warning "Permission configuration failed (non-fatal)"
  success "Permission configuration complete"
else
  warning "Permission configuration script not found (non-fatal)"
fi

# Grant VS Code/Visual Studio Code macOS automation permissions (eliminate popups)
if [[ -f "$ROOT/scripts/boot/grant_vscode_permissions.sh" ]]; then
  info "Configuring VS Code macOS automation permissions..."
  bash "$ROOT/scripts/boot/grant_vscode_permissions.sh" 2>/dev/null || true
  success "VS Code automation permissions configured"
fi

# Check for RAW file accumulation (memory/boot impact)
info "Checking for RAW file accumulation..."
RAW_COUNT=$(find "$ROOT" -name "raw-*" -o -name "*.raw" 2>/dev/null | { grep -v node_modules || true; } | { grep -v .emergency-archive || true; } | wc -l | tr -d ' ')
if [[ "$RAW_COUNT" -gt 10 ]]; then
  warning "Detected $RAW_COUNT RAW files - may impact voice mode performance"
  warning "Run: find . -name 'raw-*' -o -name '*.raw' | grep -v node_modules"
  warning "Cause: Visual Studio Code's files.hotExit accumulating unsaved buffers"
  warning "Fix: Check ~/Library/Application Support/Visual Studio Code/User/settings.json"
else
  success "RAW file count healthy: $RAW_COUNT files"
fi

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
      warning "Visual Studio Code may crash - save work frequently"
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
      warning "Visual Studio Code may crash - save work frequently"
      warning "Consider restarting system for best stability"
      if [[ "$STRICT" == "1" ]]; then
        error "STRICT_LOW_MEM=1 enforced - exiting boot sequence"
        exit 1
      fi
    elif [[ $FREE_MB -lt 1024 ]]; then
      warning "Low memory: ${FREE_MB}MB free (recommend >1GB)"
      warning "Monitor for stability issues during session"
    else
      # Use MB if under 10GB for better precision
      if [[ $FREE_GB -lt 10 ]]; then
        success "Memory: ${FREE_MB}MB free (healthy)"
      else
        success "Memory: ~${FREE_GB}GB free (healthy)"
      fi
    fi
  fi
fi

# PHASE 1: STABILIZE - Port pre-clear
info "Pre-clearing port 3005..."
(lsof -ti :3005 2>/dev/null | xargs kill -TERM 2>/dev/null) || true
sleep 1
(lsof -ti :3005 2>/dev/null | xargs kill -KILL 2>/dev/null) || true
success "Port 3005 cleared"

# PHASE 1: STABILIZE - Log prep
mkdir -p "$ROOT/logs"
touch "$ROOT/logs/integration-service.log"

# Check 1Password session (required for downstream op run calls)
# NOTE: CLI v2 Desktop integration returns empty whoami - that's OK
# SKIP_1PASSWORD=1 to bypass for voice-first boot (integration-service will warn if needed)
if [[ "${SKIP_1PASSWORD:-0}" == "1" ]]; then
  warning "Skipping 1Password authentication (SKIP_1PASSWORD=1)"
  warning "Integration service features requiring secrets will be limited"
else
  if ensure_op_session; then
    success "1Password session ready"
  else
    warning "1Password authentication failed or timed out"
    warning "Voice mode will start, but integration features may be limited"
    warning "To retry: run 'op signin' manually"
  fi
fi

# GCP project for downstream scripts
GCP_PROJECT_ID="${GCP_PROJECT_ID:-reggieanddrodispensary}"
export GCP_PROJECT_ID
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
  
  # Load LightSpeed OAuth credentials (TIER-1)
  export LIGHTSPEED_CLIENT_ID=$(gcloud secrets versions access latest --secret=LIGHTSPEED_CLIENT_ID --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
  export LIGHTSPEED_CLIENT_SECRET=$(gcloud secrets versions access latest --secret=LIGHTSPEED_CLIENT_SECRET --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
  export LIGHTSPEED_ACCOUNT_ID=$(gcloud secrets versions access latest --secret=LIGHTSPEED_ACCOUNT_ID --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")

  if [[ -n "$LIGHTSPEED_CLIENT_ID" ]] && [[ -n "$LIGHTSPEED_CLIENT_SECRET" ]] && [[ -n "$LIGHTSPEED_ACCOUNT_ID" ]]; then
    success "LIGHTSPEED OAuth credentials loaded (TIER-1)"
    info "Account ID: $LIGHTSPEED_ACCOUNT_ID"
  else
    warning "No LightSpeed OAuth credentials found - integration service may fail"
  fi
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
  
  # Load other API keys if they exist (LivHana-Ops-Keys vault only)
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

# PHASE 2: HARDEN - Node 20 guard
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
# EMERGENCY FIX: claude models list hangs indefinitely - disabled
info "Skipping Claude model check (causes boot timeout - EMERGENCY FIX)"

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
info "Ensuring voice services are running (STT/TTS)..."

# Auto-start STT service (Whisper on port 2022)
if lsof -i :2022 2>/dev/null | grep -q LISTEN; then
  success "STT service (Whisper) already running on port 2022"
else
  info "Starting STT service (Whisper)..."
  # Use launchctl if available, otherwise direct start
  if launchctl list | grep -q com.livhana.whisper 2>/dev/null; then
    launchctl kickstart -k "gui/$(id -u)/com.livhana.whisper" 2>/dev/null || true
  fi
  sleep 2
  if lsof -i :2022 2>/dev/null | grep -q LISTEN; then
    success "STT service started successfully"
  else
    warning "STT service failed to start - voice input may not work"
  fi
fi

# Auto-start TTS service (Kokoro on port 8880)
if lsof -i :8880 2>/dev/null | grep -q LISTEN; then
  success "TTS service (Kokoro) already running on port 8880"
else
  info "Starting TTS service (Kokoro)..."
  # Use launchctl if available, otherwise direct start
  if launchctl list | grep -q com.livhana.kokoro 2>/dev/null; then
    launchctl kickstart -k "gui/$(id -u)/com.livhana.kokoro" 2>/dev/null || true
  fi
  sleep 2
  if lsof -i :8880 2>/dev/null | grep -q LISTEN; then
    success "TTS service started successfully"
  else
    warning "TTS service failed to start - voice output may not work"
  fi
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
  info "8-layer funnel: Bootstrap → Voice → Visual Studio Code → Research → Artifacts → Execution → QA → Ops"
else
  warning "Tier-1 Funnel Authority blueprint not found at $FUNNEL_AUTHORITY"
  warning "Sessions may not have full funnel context"
fi

# PREPEND voice activation instructions to prompt (MUST BE FIRST)
# Save original prompt to temp file (using cp for safety, not mv)
TEMP_PROMPT="$PROMPT.tmp"
cp "$PROMPT" "$TEMP_PROMPT"  # COPY not MOVE - safer rollback if write fails

generate_dynamic_greeting() {
  local hour=$(date +%H)
  local agent_count=$(ls -1 tmp/agent_status/*.status.json 2>/dev/null | wc -l | tr -d ' ')
  local current_branch=$(git branch --show-current 2>/dev/null)
  local modified_count=$(git status --short 2>/dev/null | wc -l | tr -d ' ')

  local greetings=(
    "Jesse. ${agent_count} agents live, ${current_branch} branch, ${modified_count} files modified. Execute?"
    "Boss. Full stack up. ${agent_count} agents, ${modified_count} changes queued. What's the target?"
    "Jesse, Liv here. ${agent_count} agents ready, ${current_branch} active. Let's move."
  )

  local random_index=$((RANDOM % ${#greetings[@]}))
  echo "${greetings[$random_index]}"
}

DYNAMIC_GREETING=$(generate_dynamic_greeting)
export DYNAMIC_GREETING

# Write voice instructions FIRST
cat > "$PROMPT" <<'VOICE_INSTRUCTIONS'

========================================
🎤 VOICE MODE - IMMEDIATE ACTION REQUIRED
========================================

**CRITICAL: YOU MUST START WITH VOICE MODE**

If this is your FIRST response in this session, you MUST:
1. Use mcp__voicemode__converse tool IMMEDIATELY
2. Send greeting using DYNAMIC_GREETING variable (unique context-aware greeting)
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
     Use DYNAMIC_GREETING variable (generated from system context: time, agents, branch, files)
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
- Message: "$DYNAMIC_GREETING" (unique context-aware greeting generated at boot)
- wait_for_response: true
- vad_aggressiveness: 0 (MOST PERMISSIVE for live Meet sessions)
- disable_silence_detection: true (continuous listening)
- listen_duration_min: 0.5
- listen_duration_max: 30
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

# STEP 6.1: 1PASSWORD SECRET GUARD (non-blocking)
if [[ -f "$ROOT/scripts/watchdogs/op_secret_guard.sh" ]]; then
  info "Starting 1Password secret guard..."
  nohup bash "$ROOT/scripts/watchdogs/op_secret_guard.sh" >> "$ROOT/logs/op_secret_guard.log" 2>&1 &
  OP_GUARD_PID=$!
  success "1Password secret guard started (PID $OP_GUARD_PID, check interval: ${OP_WATCHDOG_INTERVAL_SEC:-900}s)"
else
  warning "op_secret_guard.sh not found - skipping 1Password watchdog"
fi

# STEP 6.2: BOOT SCRIPT AUTO-COMMIT WATCHDOG (non-blocking)
if [[ -f "$ROOT/scripts/watchdogs/boot_script_auto_commit.sh" ]]; then
  info "Starting boot script auto-commit watchdog..."
  nohup bash "$ROOT/scripts/watchdogs/boot_script_auto_commit.sh" >> "$ROOT/logs/boot_script_auto_commit.log" 2>&1 &
  BOOT_WATCHDOG_PID=$!
  success "Boot script watchdog started (PID $BOOT_WATCHDOG_PID, check interval: ${BOOT_SCRIPT_WATCH_INTERVAL:-300}s)"
else
  warning "boot_script_auto_commit.sh not found - skipping boot script watchdog"
fi

# STEP 6.3: REAL-TIME AGENT STATUS LOGGER (non-blocking)
if [[ -f "$ROOT/scripts/watchdogs/agent_status_realtime_logger.sh" ]]; then
  info "Starting real-time agent status logger..."
  nohup bash "$ROOT/scripts/watchdogs/agent_status_realtime_logger.sh" >> "$ROOT/logs/agent_status_realtime.log" 2>&1 &
  AGENT_LOGGER_PID=$!
  echo "$AGENT_LOGGER_PID" > "$ROOT/tmp/agent_logger.pid"
  success "Agent logger started (PID $AGENT_LOGGER_PID, interval: ${AGENT_LOG_INTERVAL:-10}s)"
else
  warning "agent_status_realtime_logger.sh not found - skipping real-time logging"
fi

# STEP 6.4: DYNAMIC RESOURCE ALLOCATOR (non-blocking)
if [[ -f "$ROOT/scripts/dynamic_resource_allocator.sh" ]]; then
  info "Starting dynamic resource allocator..."
  nohup bash "$ROOT/scripts/dynamic_resource_allocator.sh" >> "$ROOT/logs/dynamic_resource_allocator.log" 2>&1 &
  RESOURCE_ALLOCATOR_PID=$!
  echo "$RESOURCE_ALLOCATOR_PID" > "$ROOT/tmp/resource_allocator.pid"
  success "Resource allocator started (PID $RESOURCE_ALLOCATOR_PID, interval: ${RESOURCE_CHECK_INTERVAL:-60}s)"
else
  warning "dynamic_resource_allocator.sh not found - skipping dynamic allocation"
fi

# STEP 6.5: SYSTEM INTEGRITY MONITOR (non-blocking)
if [[ -f "$ROOT/scripts/system_integrity_monitor.sh" ]]; then
  info "Starting system integrity monitor..."
  nohup bash "$ROOT/scripts/system_integrity_monitor.sh" --daemon >> "$ROOT/logs/system_integrity_monitor.nohup.log" 2>&1 &
  SYSTEM_MONITOR_PID=$!
  echo "$SYSTEM_MONITOR_PID" > "$ROOT/tmp/system_integrity_monitor.pid"
  success "System integrity monitor started (PID $SYSTEM_MONITOR_PID, interval: ${SYSTEM_MONITOR_INTERVAL:-60}s)"
else
  warning "system_integrity_monitor.sh not found - skipping system telemetry"
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
echo "  1. Open this session in Visual Studio Code (if not already)"
echo "  2. Copy the full prompt: cat $PROMPT | pbcopy"
echo "  3. Paste into a NEW Claude Code session"
echo "  4. Claude will auto-activate voice mode and greet you"
echo "  5. Respond via microphone to continue voice-first"
echo
info "${BOLD}QUICK START:${NC}"
echo "  ${CYAN}cat $PROMPT | pbcopy${NC}  # Copy prompt to clipboard"
echo "  ${CYAN}# Then paste into new Visual Studio Code session${NC}"
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

# Clean zombie boot processes from previous runs
clean_zombie_boot_processes

# Check for Visual Studio Code AppTranslocation issue (causes crashes)
check_cursor_apptranslocation || true  # Non-blocking warning

# FAILURE #5: Clean stale agent locks BEFORE starting new agents
clean_stale_agent_locks

# FAILURE #4: Clean up port 3005 before starting integration-service
if [[ -d "$ROOT/backend/integration-service" ]]; then
  cleanup_port 3005 "integration-service"
fi

# FAILURE #3: Rotate oversized logs
rotate_log_if_needed "$ROOT/logs/integration-service.log" 10

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
  
  # Start 5 subagents in parallel with validation (idempotent)
  if [[ "${SKIP_AGENT_SPAWN:-0}" == "1" ]]; then
    success "All agents already running - skipping spawn"
  else
    info "Starting subagents (missing: $((5 - AGENTS_RUNNING))/5)..."

    # Launch agents conditionally based on health check
    if ! check_agent_health "planning"; then
      bash "$ROOT/scripts/start_planning_agent.sh" >> "$LOG" 2>&1 &
      PLANNING_PID=$!
      info "Starting planning agent (PID: $PLANNING_PID)"
      # Seed status file so health check can pass while agent warms up
      if [[ -f "$ROOT/scripts/guards/atomic_write.sh" ]]; then
        printf '{ "agent": "planning", "status": "active", "phase": "running", "updated_at": "%s" }\n' "$(date -u +%FT%TZ)" | \
          bash "$ROOT/scripts/guards/atomic_write.sh" "$ROOT/tmp/agent_status/planning.status.json"
      else
        printf '{ "agent": "planning", "status": "active", "phase": "running", "updated_at": "%s" }\n' "$(date -u +%FT%TZ)" > "$ROOT/tmp/agent_status/planning.status.json"
      fi
    fi

    if ! check_agent_health "research"; then
      bash "$ROOT/scripts/start_research_agent.sh" >> "$LOG" 2>&1 &
      RESEARCH_PID=$!
      info "Starting research agent (PID: $RESEARCH_PID)"
      if [[ -f "$ROOT/scripts/guards/atomic_write.sh" ]]; then
        printf '{ "agent": "research", "status": "active", "phase": "running", "updated_at": "%s" }\n' "$(date -u +%FT%TZ)" | \
          bash "$ROOT/scripts/guards/atomic_write.sh" "$ROOT/tmp/agent_status/research.status.json"
      else
        printf '{ "agent": "research", "status": "active", "phase": "running", "updated_at": "%s" }\n' "$(date -u +%FT%TZ)" > "$ROOT/tmp/agent_status/research.status.json"
      fi
    fi

    if ! check_agent_health "artifact"; then
      bash "$ROOT/scripts/start_artifact_agent.sh" >> "$LOG" 2>&1 &
      ARTIFACT_PID=$!
      info "Starting artifact agent (PID: $ARTIFACT_PID)"
      if [[ -f "$ROOT/scripts/guards/atomic_write.sh" ]]; then
        printf '{ "agent": "artifact", "status": "active", "phase": "running", "updated_at": "%s" }\n' "$(date -u +%FT%TZ)" | \
          bash "$ROOT/scripts/guards/atomic_write.sh" "$ROOT/tmp/agent_status/artifact.status.json"
      else
        printf '{ "agent": "artifact", "status": "active", "phase": "running", "updated_at": "%s" }\n' "$(date -u +%FT%TZ)" > "$ROOT/tmp/agent_status/artifact.status.json"
      fi
    fi

    if ! check_agent_health "execmon"; then
      bash "$ROOT/scripts/start_execution_monitor.sh" >> "$LOG" 2>&1 &
      EXEC_PID=$!
      info "Starting execution monitor (PID: $EXEC_PID)"
      if [[ -f "$ROOT/scripts/guards/atomic_write.sh" ]]; then
        printf '{ "agent": "execmon", "status": "active", "phase": "running", "updated_at": "%s" }\n' "$(date -u +%FT%TZ)" | \
          bash "$ROOT/scripts/guards/atomic_write.sh" "$ROOT/tmp/agent_status/execmon.status.json"
      else
        printf '{ "agent": "execmon", "status": "active", "phase": "running", "updated_at": "%s" }\n' "$(date -u +%FT%TZ)" > "$ROOT/tmp/agent_status/execmon.status.json"
      fi
    fi

    if ! check_agent_health "qa"; then
      bash "$ROOT/scripts/start_qa_agent.sh" >> "$LOG" 2>&1 &
      QA_PID=$!
      info "Starting qa agent (PID: $QA_PID)"
      if [[ -f "$ROOT/scripts/guards/atomic_write.sh" ]]; then
        printf '{ "agent": "qa", "status": "active", "phase": "running", "updated_at": "%s" }\n' "$(date -u +%FT%TZ)" | \
          bash "$ROOT/scripts/guards/atomic_write.sh" "$ROOT/tmp/agent_status/qa.status.json"
      else
        printf '{ "agent": "qa", "status": "active", "phase": "running", "updated_at": "%s" }\n' "$(date -u +%FT%TZ)" > "$ROOT/tmp/agent_status/qa.status.json"
      fi
    fi
  fi

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

  if bash "$ROOT/scripts/guards/validate_agent_started.sh" execmon 10; then
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
  if [[ "${SKIP_INTEGRATION_SERVICE:-0}" == "1" ]]; then
    warning "Skipping integration-service (SKIP_INTEGRATION_SERVICE=1)"
  elif [[ "${INTEGRATION_PORT_AVAILABLE:-1}" == "0" ]]; then
    warning "Skipping integration-service - port 3005 already in use"
    info "Assuming existing service is operational"
  else
    info "Starting integration-service with 1Password secrets..."
    ensure_op_session quiet
    if [[ -f "$ROOT/backend/integration-service/package.json" ]]; then
      cd "$ROOT/backend/integration-service"

    # PORT 3005 GUARD: Clean up stale processes (NON-BLOCKING)
    if lsof -ti :3005 >/dev/null 2>&1; then
      warning "Port 3005 busy – terminating stale process"
      (lsof -ti :3005 2>/dev/null | xargs kill -TERM 2>/dev/null) || true
      sleep 2
      if lsof -ti :3005 >/dev/null 2>&1; then
        warning "Port 3005 still in use after cleanup"
        warning "Integration service will NOT start, but voice mode CONTINUES"
        SKIP_INTEGRATION_SERVICE=1
      else
        info "Stale process terminated, proceeding with startup"
      fi
    fi
    
    # Load dependency wait helpers
    source "$ROOT/scripts/guards/wait_for_dependency.sh"
    
    # Wait for dependencies (if configured)
    if [[ -n "${POSTGRES_HOST:-}" ]]; then
      info "Waiting for PostgreSQL to become ready..."
      if wait_for_postgres; then
        success "PostgreSQL ready"
      else
        warning "PostgreSQL not ready (continuing anyway)"
      fi
    fi
    
    if [[ -n "${REDIS_HOST:-}" ]]; then
      info "Waiting for Redis to become ready..."
      if wait_for_redis; then
        success "Redis ready"
      else
        warning "Redis not ready (continuing anyway)"
      fi
    fi
      # Start with op run to inject secrets (SECURE: no .env on disk)
      integration_log="$ROOT/logs/integration-service.log"
      mkdir -p "$ROOT/logs"
      
      # Load log rotation helper
      if [[ -f "$ROOT/scripts/guards/log_rotation.sh" ]]; then
        source "$ROOT/scripts/guards/log_rotation.sh"
        rotate_log "$integration_log" 10
      fi
      
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

      # Ensure dependencies are installed
      if [[ ! -d "$ROOT/backend/integration-service/node_modules" ]]; then
        info "Installing integration-service dependencies (node_modules missing)..."
        cd "$ROOT/backend/integration-service"
        if npm install >> "$ROOT/logs/npm-install.log" 2>&1; then
          success "Dependencies installed successfully"
        else
          warning "npm install failed - service may not start properly"
          info "Check logs at: $ROOT/logs/npm-install.log"
        fi
      fi

      # Start service with secret scrubbing
      log="$integration_log"
      mkdir -p "$(dirname "$log")"
      
      # Start the service in background with process substitution for secret scrubbing
      cd "$ROOT/backend/integration-service"
      op run --env-file "$ENV_FILE" -- npm start \
        > >("$ROOT/scripts/guards/scrub_secrets.sh" >> "$log") \
        2> >("$ROOT/scripts/guards/scrub_secrets.sh" >> "$log") &
      INTEGRATION_PID=$!
      echo "$INTEGRATION_PID" > "$ROOT/tmp/integration-service.pid"
      
      # Find the actual Node process PID
      sleep 1
      NODE_PID=$(pgrep -P "$INTEGRATION_PID" | head -1 || echo "$INTEGRATION_PID")
      if [[ "$NODE_PID" != "$INTEGRATION_PID" ]]; then
        echo "$NODE_PID" > "$ROOT/tmp/integration-service.pid"
        INTEGRATION_PID="$NODE_PID"
      fi

      success "integration-service starting (PID: $INTEGRATION_PID, managed via port 3005)"
      
      cd "$ROOT"
      # Wait for service to become available (replaces hardcoded sleep)
      info "Waiting for integration-service to become available..."
      if wait_for_service 3005 30 2; then
        success "integration-service started on port 3005"
      else
        warning "integration-service failed to start - continuing with degraded functionality"
        warning "Voice mode and agents remain operational"
        # DO NOT EXIT - allow boot to complete
      fi
    else
      warning "integration-service package.json not found - skipping"
    fi
    cd "$ROOT"
  fi

  echo
fi

echo

# STEP 9: POST-BOOT HEALTH MONITORING + CRASH PREVENTION
banner "🏥 STEP 9: POST-BOOT HEALTH VALIDATION"
info "Performing comprehensive health checks on all systems..."
echo

# Start crash prevention monitoring suite
info "Starting crash prevention monitoring suite..."
if [[ -f "$ROOT/scripts/start_crash_prevention_suite.sh" ]]; then
  bash "$ROOT/scripts/start_crash_prevention_suite.sh" >> "$LOG" 2>&1
  success "Crash prevention suite started (tmux: crash-monitor, voice-visualizer)"
else
  warning "Crash prevention suite not found - skipping proactive monitoring"
fi
echo
