#!/usr/bin/env bash
# 🛡️ VS CODE CRASH PREVENTION & STABILITY FIXES
# Liv Hana | Tier-1 System Hardening
# Prevents VS Code crashes through memory management and process monitoring

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

success() { printf "${GREEN}✅ %s${NC}\n" "$1"; }
warning() { printf "${YELLOW}⚠️  %s${NC}\n" "$1"; }
error() { printf "${RED}❌ %s${NC}\n" "$1"; }
info() { printf "${CYAN}🎯 %s${NC}\n" "$1"; }

banner() {
  printf "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "${BOLD}${CYAN}  🛡️  %s${NC}\n" "$1"
  printf "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n"
}

banner "VS CODE CRASH PREVENTION SYSTEM"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"

# Fix 1: Memory Pressure Monitoring
info "Setting up memory pressure monitoring..."
if command -v memory_pressure >/dev/null 2>&1; then
  MEM_FREE=$(memory_pressure 2>/dev/null | grep "System-wide memory free percentage" | awk '{print $NF}' | tr -d '%' || echo "50")
  if [[ ${MEM_FREE:-50} -lt 20 ]]; then
    warning "CRITICAL: Low memory detected (${MEM_FREE}% free)"
    warning "Consider closing other applications to prevent VS Code crashes"
  else
    success "Memory pressure healthy: ${MEM_FREE}% free"
  fi
fi

# Fix 2: Clean VS Code workspace storage to prevent corruption
info "Cleaning VS Code workspace storage..."
VSCODE_WORKSPACE_STORAGE="$HOME/Library/Application Support/Code/User/workspaceStorage"
if [[ -d "$VSCODE_WORKSPACE_STORAGE" ]]; then
  # Find and remove corrupted workspace storage (over 500MB)
  LARGE_WORKSPACES=$(find "$VSCODE_WORKSPACE_STORAGE" -type d -mindepth 1 -maxdepth 1 2>/dev/null | while read dir; do
    size=$(du -sm "$dir" 2>/dev/null | awk '{print $1}')
    if [[ ${size:-0} -gt 500 ]]; then
      echo "$dir"
    fi
  done)

  if [[ -n "$LARGE_WORKSPACES" ]]; then
    warning "Found large workspace storage directories (potential corruption)"
    echo "$LARGE_WORKSPACES" | while read dir; do
      size=$(du -sh "$dir" | awk '{print $1}')
      warning "  $dir ($size)"
    done
    info "To clean: rm -rf '$VSCODE_WORKSPACE_STORAGE/<workspace-id>'"
  else
    success "VS Code workspace storage healthy"
  fi
else
  info "VS Code workspace storage not found (fresh install or different location)"
fi

# Fix 3: Disable problematic VS Code settings that cause crashes
info "Checking VS Code settings for crash-prone configurations..."
VSCODE_SETTINGS="$HOME/Library/Application Support/Code/User/settings.json"
if [[ -f "$VSCODE_SETTINGS" ]]; then
  # Check for problematic settings
  PROBLEMS=0

  # files.hotExit can cause raw file accumulation
  if grep -q '"files.hotExit".*"onExitAndWindowClose"' "$VSCODE_SETTINGS" 2>/dev/null; then
    warning "files.hotExit set to 'onExitAndWindowClose' - can cause memory issues"
    PROBLEMS=$((PROBLEMS + 1))
  fi

  # Large file.watcher.excludes is good, check if missing
  if ! grep -q '"files.watcherExclude"' "$VSCODE_SETTINGS" 2>/dev/null; then
    warning "files.watcherExclude not configured - can cause high CPU usage"
    PROBLEMS=$((PROBLEMS + 1))
  fi

  if [[ $PROBLEMS -eq 0 ]]; then
    success "VS Code settings healthy"
  else
    warning "Found $PROBLEMS potential configuration issues"
    info "Recommended settings in: $ROOT/docs/VSCODE_RECOMMENDED_SETTINGS.json"
  fi
else
  info "VS Code settings not found (default configuration)"
fi

# Fix 4: Clean zombie VS Code processes
info "Checking for zombie VS Code processes..."
ZOMBIE_PROCS=$(ps aux | grep "[C]ode Helper" | grep -v grep | wc -l | tr -d ' ')
if [[ ${ZOMBIE_PROCS:-0} -gt 10 ]]; then
  warning "Found ${ZOMBIE_PROCS} VS Code Helper processes (potential leak)"
  warning "Consider restarting VS Code to clean up processes"
else
  success "VS Code process count healthy: ${ZOMBIE_PROCS} helpers"
fi

# Fix 5: Check disk space (VS Code crashes with low disk)
info "Checking disk space availability..."
AVAILABLE_GB=$(df -h / | tail -1 | awk '{print $4}' | sed 's/Gi//')
if [[ "$AVAILABLE_GB" =~ ^[0-9]+$ ]]; then
  if [[ $AVAILABLE_GB -lt 10 ]]; then
    error "CRITICAL: Low disk space (${AVAILABLE_GB}GB available)"
    error "VS Code will likely crash - free up space immediately"
  elif [[ $AVAILABLE_GB -lt 20 ]]; then
    warning "Disk space getting low: ${AVAILABLE_GB}GB available"
    warning "Consider freeing space to prevent VS Code instability"
  else
    success "Disk space healthy: ${AVAILABLE_GB}GB available"
  fi
fi

# Fix 6: Extension bloat check
info "Checking VS Code extension count..."
EXTENSIONS_DIR="$HOME/.vscode/extensions"
if [[ -d "$EXTENSIONS_DIR" ]]; then
  EXT_COUNT=$(ls -1 "$EXTENSIONS_DIR" 2>/dev/null | wc -l | tr -d ' ')
  if [[ ${EXT_COUNT:-0} -gt 50 ]]; then
    warning "High extension count: ${EXT_COUNT} extensions"
    warning "Too many extensions can cause crashes and slowdowns"
    info "Consider disabling unused extensions"
  else
    success "Extension count healthy: ${EXT_COUNT} extensions"
  fi
fi

# Fix 7: Clean node_modules bloat (causes VS Code file watcher crashes)
info "Checking for node_modules bloat..."
NODE_MODULES_SIZE=0
if [[ -d "$ROOT/node_modules" ]]; then
  NODE_MODULES_SIZE=$(du -sm "$ROOT/node_modules" 2>/dev/null | awk '{print $1}')
fi

if [[ ${NODE_MODULES_SIZE:-0} -gt 2000 ]]; then
  warning "Large node_modules: ${NODE_MODULES_SIZE}MB"
  warning "Can cause VS Code file watcher crashes"
  info "Consider: npm prune && npm dedupe"
else
  success "node_modules size healthy: ${NODE_MODULES_SIZE}MB"
fi

# Fix 8: Prevent AppTranslocation issues (NOT applicable to VS Code, only Electron apps from DMG)
# VS Code installed via Homebrew or direct download to /Applications doesn't have this issue

# Fix 9: Recommended VS Code restart interval
info "Calculating VS Code uptime..."
if pgrep -x "Code" >/dev/null 2>&1; then
  VSCODE_PID=$(pgrep -x "Code" | head -1)
  VSCODE_START=$(ps -p "$VSCODE_PID" -o lstart= 2>/dev/null || echo "")
  if [[ -n "$VSCODE_START" ]]; then
    info "VS Code running since: $VSCODE_START"
    # Calculate uptime in hours (approximation)
    START_EPOCH=$(date -j -f "%a %b %d %H:%M:%S %Y" "$VSCODE_START" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    UPTIME_HOURS=$(( (NOW_EPOCH - START_EPOCH) / 3600 ))

    if [[ ${UPTIME_HOURS:-0} -gt 48 ]]; then
      warning "VS Code has been running for ${UPTIME_HOURS} hours"
      warning "Recommend restart for optimal stability (every 24-48 hours)"
    else
      success "VS Code uptime healthy: ${UPTIME_HOURS} hours"
    fi
  fi
else
  info "VS Code not currently running"
fi

# Fix 10: Create recommended settings file
info "Creating recommended VS Code settings..."
RECOMMENDED_SETTINGS="$ROOT/docs/VSCODE_RECOMMENDED_SETTINGS.json"
mkdir -p "$(dirname "$RECOMMENDED_SETTINGS")"

cat > "$RECOMMENDED_SETTINGS" <<'EOF'
{
  "// STABILITY SETTINGS": "Prevents VS Code crashes and memory issues",

  "files.hotExit": "onExit",
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,

  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/tmp/**": true,
    "**/out/**": true,
    "**/out_mirror/**": true,
    "**/.cursor-backups/**": true,
    "**/logs/**": true,
    "**/*.raw": true
  },

  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/*.code-search": true,
    "**/tmp": true,
    "**/out": true,
    "**/out_mirror": true,
    "**/.cursor-backups": true,
    "**/logs": true
  },

  "// PERFORMANCE SETTINGS": "Reduces CPU and memory usage",

  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {},

  "typescript.tsserver.maxTsServerMemory": 4096,
  "typescript.disableAutomaticTypeAcquisition": false,

  "// CLAUDE CODE INTEGRATION": "Optimal settings for voice-first workflow",

  "claudecode.voiceMode.enabled": true,
  "claudecode.voiceMode.autoActivate": true,
  "claudecode.voiceMode.sttPort": 2022,
  "claudecode.voiceMode.ttsPort": 8880,

  "// TERMINAL SETTINGS": "Stability for long-running processes",

  "terminal.integrated.persistentSessionReviveProcess": "never",
  "terminal.integrated.enablePersistentSessions": false
}
EOF

success "Created: $RECOMMENDED_SETTINGS"
info "To apply: Copy settings to $HOME/Library/Application Support/Code/User/settings.json"

# Summary
echo
banner "CRASH PREVENTION SUMMARY"

HEALTH_SCORE=100

# Memory check (-20 if low)
if [[ ${MEM_FREE:-50} -lt 20 ]]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 20))
fi

# Disk check (-30 if critical, -15 if low)
if [[ ${AVAILABLE_GB:-50} -lt 10 ]]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 30))
elif [[ ${AVAILABLE_GB:-50} -lt 20 ]]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 15))
fi

# Extension bloat (-10 if excessive)
if [[ ${EXT_COUNT:-0} -gt 50 ]]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 10))
fi

# node_modules bloat (-15 if excessive)
if [[ ${NODE_MODULES_SIZE:-0} -gt 2000 ]]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 15))
fi

# Zombie processes (-10 if excessive)
if [[ ${ZOMBIE_PROCS:-0} -gt 10 ]]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 10))
fi

# Uptime (-10 if excessive)
if [[ ${UPTIME_HOURS:-0} -gt 48 ]]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 10))
fi

echo "VS Code Stability Score: ${HEALTH_SCORE}/100"
echo

if [[ $HEALTH_SCORE -ge 90 ]]; then
  success "🌟 EXCELLENT - VS Code configured for maximum stability"
elif [[ $HEALTH_SCORE -ge 70 ]]; then
  success "✅ GOOD - Minor optimizations recommended"
elif [[ $HEALTH_SCORE -ge 50 ]]; then
  warning "⚠️  FAIR - Stability issues likely, apply fixes above"
else
  error "❌ POOR - VS Code will likely crash, immediate action required"
fi

echo
success "🛡️ Crash prevention checks complete"
echo
info "Recommended actions:"
echo "  1. Apply settings from: $RECOMMENDED_SETTINGS"
echo "  2. Restart VS Code every 24-48 hours"
echo "  3. Monitor memory pressure before long sessions"
echo "  4. Clean node_modules regularly: npm prune && npm dedupe"
echo "  5. Disable unused extensions"
echo
