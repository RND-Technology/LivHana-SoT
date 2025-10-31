#!/usr/bin/env bash
# 🚀 PHASE 1: STABILIZE - Unfuckwithable Boot System
# Copy-Paste ONE-SHOT Solution | Jesse CEO | Marine Corps Precision

set -euo pipefail

ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
LOG="$ROOT/logs/phase1_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$(dirname "$LOG")"

# Colors
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; C='\033[0;36m'; B='\033[1m'; N='\033[0m'
ok() { printf "${G}✅ %s${N}\n" "$1" | tee -a "$LOG"; }
warn() { printf "${Y}⚠️  %s${N}\n" "$1" | tee -a "$LOG"; }
fail() { printf "${R}❌ %s${N}\n" "$1" | tee -a "$LOG"; }
note() { printf "${C}🎯 %s${N}\n" "$1" | tee -a "$LOG"; }

echo ""
printf "${B}${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}\n"
printf "${B}${C}  PHASE 1: STABILIZE (30 min)${N}\n"
printf "${B}${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}\n"
echo ""

# Task 1 & 2: Check ~/.zshrc configuration
note "Task 1 & 2: Checking ~/.zshrc configuration..."
ZSHRC="$HOME/.zshrc"
NEEDS_RELOAD=0

if grep -q "alias claude-tier1=" "$ZSHRC" 2>/dev/null; then
  ok "Bash alias already in ~/.zshrc"
else
  echo "" >> "$ZSHRC"
  echo "# Tier-1 boot via bash - eliminates BASH_SOURCE errors" >> "$ZSHRC"
  echo "alias claude-tier1='bash $ROOT/scripts/claude_tier1_boot.sh'" >> "$ZSHRC"
  ok "Bash alias ADDED to ~/.zshrc"
  NEEDS_RELOAD=1
fi

if grep -q "setopt interactivecomments" "$ZSHRC" 2>/dev/null; then
  ok "Interactive comments already in ~/.zshrc"
else
  echo "" >> "$ZSHRC"
  echo "# Enable interactive comments" >> "$ZSHRC"
  echo "setopt interactivecomments" >> "$ZSHRC"
  ok "Interactive comments ADDED to ~/.zshrc"
  NEEDS_RELOAD=1
fi

# Activate for current shell
alias claude-tier1="bash $ROOT/scripts/claude_tier1_boot.sh" 2>/dev/null || true
setopt interactivecomments 2>/dev/null || true
ok "Configuration active in current shell"
echo ""

# Task 3: 1Password hard-fail
note "Task 3: 1Password authentication check..."
export OP_ACCOUNT_SLUG="${OP_ACCOUNT_SLUG:-reggiedro.1password.com}"

if ! command -v op >/dev/null 2>&1; then
  fail "1Password CLI missing - install: brew install 1password-cli"
  exit 1
fi

WHO="$(op whoami 2>/dev/null || echo '')"
if [[ -z "$WHO" ]]; then
  fail "1Password NOT authenticated"
  fail "Run: op signin --account $OP_ACCOUNT_SLUG"
  exit 1
fi

ok "1Password authenticated: $(echo "$WHO" | head -1)"
echo ""

# Task 4: Port 3005 pre-clear
note "Task 4: Port 3005 pre-clear..."
if lsof -ti :3005 >/dev/null 2>&1; then
  note "Clearing port 3005..."
  lsof -ti :3005 | xargs kill -TERM 2>/dev/null || true
  sleep 1
  if lsof -ti :3005 >/dev/null 2>&1; then
    lsof -ti :3005 | xargs kill -KILL 2>/dev/null || true
    sleep 1
  fi
  ok "Port 3005 cleared"
else
  ok "Port 3005 already clean"
fi
echo ""

# Task 5: Model gate bypass
note "Task 5: Model gate bypass..."
export ALLOW_TEXT_ONLY=1
ok "ALLOW_TEXT_ONLY=1 exported for session"
echo ""

# Task 6: Log prep
note "Task 6: Log infrastructure..."
mkdir -p "$ROOT/logs" "$ROOT/logs/agents" "$ROOT/logs/voice"
touch "$ROOT/logs/integration-service.log"
chmod 600 "$ROOT/logs/integration-service.log" 2>/dev/null || true
ok "Logs directory ready: $ROOT/logs/"
ok "integration-service.log created with 600 permissions"
echo ""

# Acceptance Criteria
echo ""
printf "${B}${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}\n"
printf "${B}${C}  PHASE 1 ACCEPTANCE CRITERIA${N}\n"
printf "${B}${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}\n"
echo ""

PASS=0
[[ -n "$(type claude-tier1 2>/dev/null)" ]] && { ok "✅ Alias functional"; PASS=$((PASS+1)); } || warn "⚠️  Alias check"
[[ "$(setopt 2>&1 | grep interactivecomments)" ]] && { ok "✅ Interactive comments on"; PASS=$((PASS+1)); } || warn "⚠️  Comments check"
op whoami >/dev/null 2>&1 && { ok "✅ 1Password authenticated"; PASS=$((PASS+1)); } || warn "⚠️  1Password check"
[[ ! $(lsof -ti :3005 2>/dev/null) ]] && { ok "✅ Port 3005 clean"; PASS=$((PASS+1)); } || warn "⚠️  Port check"
[[ -f "$ROOT/logs/integration-service.log" ]] && { ok "✅ Logs prepared"; PASS=$((PASS+1)); } || warn "⚠️  Log check"

echo ""
if [[ $PASS -eq 5 ]]; then
  printf "${G}${B}🌟 ALL 5/5 CHECKS PASSED - STABLE${N}\n"
  echo ""
  note "READY FOR TESTING"
  echo ""
  printf "${C}Quick test:${N}\n"
  echo "  bash $ROOT/scripts/claude_tier1_boot.sh"
  echo ""
  exit 0
else
  warn "⚠️  $PASS/5 checks passed - review failures above"
  exit 1
fi
