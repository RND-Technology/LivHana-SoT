#!/usr/bin/env bash
# 🎼 Claude Tier-1 Doctor Script
# Diagnoses and auto-fixes common issues with the boot system
# One Shot, One Kill | Grow Baby Grow, Sell Baby Sell

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/logs/claude_tier1_doctor_$(date +%Y%m%d_%H%M%S).log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG")"

# Logging functions
success() { printf "${GREEN}✅ %s${NC}\n" "$1" | tee -a "$LOG"; }
warning() { printf "${YELLOW}⚠️  %s${NC}\n" "$1" | tee -a "$LOG"; }
error() { printf "${RED}❌ %s${NC}\n" "$1" | tee -a "$LOG"; }
info() { printf "${CYAN}🎯 %s${NC}\n" "$1" | tee -a "$LOG"; }
fix() { printf "${MAGENTA}🔧 %s${NC}\n" "$1" | tee -a "$LOG"; }

banner() {
  printf "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n" | tee -a "$LOG"
  printf "${BOLD}${MAGENTA}  🎼 %s${NC}\n" "$1" | tee -a "$LOG"
  printf "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n" | tee -a "$LOG"
}

# Track fixes applied
FIXES_APPLIED=0
ISSUES_FOUND=0

banner "CLAUDE TIER-1 DOCTOR"
echo "[DOCTOR] $(date) – Running diagnostics..." >> "$LOG"
info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
info "Root: $ROOT"
info "Log: $LOG"
echo

# ============================================================================
# DIAGNOSIS 1: Voice Services
# ============================================================================
banner "DIAGNOSIS 1: VOICE SERVICES"

info "Checking Whisper STT (port 2022)..."
if lsof -i :2022 2>/dev/null | grep -q LISTEN; then
  success "Whisper STT is running on port 2022"
else
  warning "Whisper STT is NOT running"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))

  fix "Attempting to start Whisper STT..."
  if command -v voicemode >/dev/null 2>&1; then
    if voicemode whisper start 2>&1 | tee -a "$LOG"; then
      success "Whisper STT started successfully"
      FIXES_APPLIED=$((FIXES_APPLIED + 1))
    else
      error "Failed to start Whisper STT"
      info "Manual fix: voicemode whisper start"
    fi
  else
    error "voicemode CLI not found"
    info "Manual fix: Install voicemode CLI or start service manually"
  fi
fi

info "Checking Kokoro TTS (port 8880)..."
if lsof -i :8880 2>/dev/null | grep -q LISTEN; then
  success "Kokoro TTS is running on port 8880"
else
  warning "Kokoro TTS is NOT running"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))

  fix "Attempting to start Kokoro TTS..."
  if command -v voicemode >/dev/null 2>&1; then
    if voicemode kokoro start 2>&1 | tee -a "$LOG"; then
      success "Kokoro TTS started successfully"
      FIXES_APPLIED=$((FIXES_APPLIED + 1))
    else
      error "Failed to start Kokoro TTS"
      info "Manual fix: voicemode kokoro start"
    fi
  else
    error "voicemode CLI not found"
    info "Manual fix: Install voicemode CLI or start service manually"
  fi
fi

echo

# ============================================================================
# DIAGNOSIS 2: Environment Variables
# ============================================================================
banner "DIAGNOSIS 2: ENVIRONMENT VARIABLES"

info "Checking OPENAI_API_KEY (optional)..."
if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  warning "OPENAI_API_KEY not set (Whisper is primary, this is OK)"
  info "OpenAI TTS is only a fallback, not critical"
else
  success "OPENAI_API_KEY is set"
fi

info "Checking ANTHROPIC_API_KEY..."
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  warning "ANTHROPIC_API_KEY not set"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))

  fix "Attempting to load from 1Password..."
  if command -v op >/dev/null 2>&1 && op whoami >/dev/null 2>&1; then
    API_KEY=$(op item get ANTHROPIC_API_KEY --vault LivHana-Ops-Keys --reveal --fields credential 2>/dev/null || echo "")
    if [[ -n "$API_KEY" ]]; then
      export ANTHROPIC_API_KEY="$API_KEY"
      success "ANTHROPIC_API_KEY loaded from 1Password"
      FIXES_APPLIED=$((FIXES_APPLIED + 1))
      info "Add to shell profile: export ANTHROPIC_API_KEY='...'"
    else
      error "Could not retrieve ANTHROPIC_API_KEY from 1Password"
      info "Manual fix: export ANTHROPIC_API_KEY='sk-ant-...'"
    fi
  else
    error "1Password CLI not available or not authenticated"
    info "Manual fix: op signin && export ANTHROPIC_API_KEY=$(op item get ANTHROPIC_API_KEY --reveal --fields credential)"
  fi
else
  success "ANTHROPIC_API_KEY is set"
fi

echo

# ============================================================================
# DIAGNOSIS 3: Dependencies
# ============================================================================
banner "DIAGNOSIS 3: DEPENDENCIES"

info "Checking Python 3..."
if command -v python3 >/dev/null 2>&1; then
  PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
  success "Python $PYTHON_VERSION available"
else
  error "Python 3 not found"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  info "Manual fix: brew install python3"
fi

info "Checking required Python packages..."
MISSING_PACKAGES=()
REQUIRED_PACKAGES=("yaml" "httpx" "pydantic")

for package in "${REQUIRED_PACKAGES[@]}"; do
  if python3 -c "import $package" 2>/dev/null; then
    true  # Package found
  else
    MISSING_PACKAGES+=("$package")
  fi
done

if [ ${#MISSING_PACKAGES[@]} -eq 0 ]; then
  success "All required Python packages installed"
else
  warning "Missing Python packages: ${MISSING_PACKAGES[*]}"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))

  fix "Attempting to install missing packages..."
  # Map package names for pip
  PIP_PACKAGES=()
  for pkg in "${MISSING_PACKAGES[@]}"; do
    case "$pkg" in
      yaml) PIP_PACKAGES+=("pyyaml") ;;
      *) PIP_PACKAGES+=("$pkg") ;;
    esac
  done

  if pip3 install "${PIP_PACKAGES[@]}" --quiet 2>&1 | tee -a "$LOG"; then
    success "Python packages installed successfully"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
  else
    error "Failed to install Python packages"
    info "Manual fix: pip3 install ${PIP_PACKAGES[*]}"
  fi
fi

echo

# ============================================================================
# DIAGNOSIS 4: File Permissions
# ============================================================================
banner "DIAGNOSIS 4: FILE PERMISSIONS"

info "Checking boot script permissions..."
BOOT_SCRIPT="$ROOT/scripts/claude_tier1_boot.sh"
if [[ -x "$BOOT_SCRIPT" ]]; then
  success "Boot script is executable"
else
  warning "Boot script is not executable"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))

  fix "Making boot script executable..."
  if chmod +x "$BOOT_SCRIPT" 2>&1 | tee -a "$LOG"; then
    success "Boot script made executable"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
  else
    error "Failed to make boot script executable"
    info "Manual fix: chmod +x $BOOT_SCRIPT"
  fi
fi

info "Checking global launcher..."
GLOBAL_LAUNCHER="$HOME/.local/bin/claude-tier1"
if [[ -f "$GLOBAL_LAUNCHER" ]]; then
  if [[ -x "$GLOBAL_LAUNCHER" ]]; then
    success "Global launcher is executable"
  else
    warning "Global launcher exists but is not executable"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))

    fix "Making global launcher executable..."
    if chmod +x "$GLOBAL_LAUNCHER" 2>&1 | tee -a "$LOG"; then
      success "Global launcher made executable"
      FIXES_APPLIED=$((FIXES_APPLIED + 1))
    else
      error "Failed to make global launcher executable"
    fi
  fi
else
  warning "Global launcher not found at $GLOBAL_LAUNCHER"
  info "Boot script can still be run directly from $BOOT_SCRIPT"
fi

echo

# ============================================================================
# DIAGNOSIS 5: Directory Structure
# ============================================================================
banner "DIAGNOSIS 5: DIRECTORY STRUCTURE"

info "Checking required directories..."
REQUIRED_DIRS=("tmp" "logs" "config" ".claude")

for dir in "${REQUIRED_DIRS[@]}"; do
  DIR_PATH="$ROOT/$dir"
  if [[ -d "$DIR_PATH" ]]; then
    success "Directory exists: $dir"
  else
    warning "Directory missing: $dir"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))

    fix "Creating directory: $dir"
    if mkdir -p "$DIR_PATH" 2>&1 | tee -a "$LOG"; then
      success "Directory created: $dir"
      FIXES_APPLIED=$((FIXES_APPLIED + 1))
    else
      error "Failed to create directory: $dir"
    fi
  fi
done

echo

# ============================================================================
# DIAGNOSIS 6: Autostart Configuration
# ============================================================================
banner "DIAGNOSIS 6: AUTOSTART CONFIGURATION"

info "Checking LaunchAgents for autostart..."
LAUNCHAGENTS_DIR="$HOME/Library/LaunchAgents"

# Check for Whisper LaunchAgent
WHISPER_PLIST="$LAUNCHAGENTS_DIR/com.livhana.whisper.plist"
if [[ -f "$WHISPER_PLIST" ]]; then
  success "Whisper LaunchAgent exists"

  # Check if loaded
  if launchctl list | grep -q com.livhana.whisper; then
    success "Whisper LaunchAgent is loaded"
  else
    warning "Whisper LaunchAgent exists but not loaded"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))

    fix "Loading Whisper LaunchAgent..."
    if launchctl load "$WHISPER_PLIST" 2>&1 | tee -a "$LOG"; then
      success "Whisper LaunchAgent loaded"
      FIXES_APPLIED=$((FIXES_APPLIED + 1))
    else
      error "Failed to load Whisper LaunchAgent"
    fi
  fi
else
  warning "Whisper LaunchAgent not configured (autostart disabled)"
  info "Run: claude-tier1 doctor --setup-autostart to configure"
fi

# Check for Kokoro LaunchAgent
KOKORO_PLIST="$LAUNCHAGENTS_DIR/com.livhana.kokoro.plist"
if [[ -f "$KOKORO_PLIST" ]]; then
  success "Kokoro LaunchAgent exists"

  # Check if loaded
  if launchctl list | grep -q com.livhana.kokoro; then
    success "Kokoro LaunchAgent is loaded"
  else
    warning "Kokoro LaunchAgent exists but not loaded"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))

    fix "Loading Kokoro LaunchAgent..."
    if launchctl load "$KOKORO_PLIST" 2>&1 | tee -a "$LOG"; then
      success "Kokoro LaunchAgent loaded"
      FIXES_APPLIED=$((FIXES_APPLIED + 1))
    else
      error "Failed to load Kokoro LaunchAgent"
    fi
  fi
else
  warning "Kokoro LaunchAgent not configured (autostart disabled)"
  info "Run: claude-tier1 doctor --setup-autostart to configure"
fi

echo

# ============================================================================
# FINAL REPORT
# ============================================================================
banner "DIAGNOSIS COMPLETE"

info "Issues found: $ISSUES_FOUND"
info "Fixes applied: $FIXES_APPLIED"
echo

if [[ $ISSUES_FOUND -eq 0 ]]; then
  success "🎉 System is healthy! No issues found."
  echo
  success "Ready to run: claude-tier1"
  exit 0
elif [[ $FIXES_APPLIED -eq $ISSUES_FOUND ]]; then
  success "🎉 All issues fixed automatically!"
  echo
  success "Ready to run: claude-tier1"
  exit 0
elif [[ $FIXES_APPLIED -gt 0 ]]; then
  warning "Some issues fixed, but manual intervention needed for others"
  echo
  info "Review the log above for manual fixes required"
  info "Then run: claude-tier1"
  exit 2
else
  error "Issues found but could not auto-fix"
  echo
  info "Review the log above for manual fixes required"
  exit 1
fi
