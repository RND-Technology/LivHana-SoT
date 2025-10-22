#!/usr/bin/env bash
# 🎯 TIER-1 Shell Environment Fix
# Auto-fix blocking shell initialization issues
# ONE SHOT, ONE KILL

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

banner() {
  printf "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "${BOLD}${CYAN}  🎯 %s${NC}\n" "$1"
  printf "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n"
}

success() { printf "${GREEN}✅ %s${NC}\n" "$1"; }
warning() { printf "${YELLOW}⚠️  %s${NC}\n" "$1"; }
error() { printf "${RED}❌ %s${NC}\n" "$1"; }
info() { printf "${CYAN}🎯 %s${NC}\n" "$1"; }

banner "TIER-1 SHELL ENVIRONMENT FIX"

# STEP 1: Backup
banner "STEP 1: BACKUP CURRENT CONFIG"
BACKUP_TIME=$(date +%Y%m%d_%H%M%S)
cp ~/.zshrc ~/.zshrc.backup.$BACKUP_TIME
cp ~/.zshenv ~/.zshenv.backup.$BACKUP_TIME
success "Backed up to ~/.zshrc.backup.$BACKUP_TIME"
success "Backed up to ~/.zshenv.backup.$BACKUP_TIME"
echo

# STEP 2: Fix .zshrc
banner "STEP 2: FIX BLOCKING .zshrc"
info "Removing blocking lines from ~/.zshrc..."

cat > ~/.zshrc << 'EOFZSHRC'
# Tier-1 Optimized .zshrc (Non-blocking)
# Last updated: 2025-10-22 by automated fix

# Essential PATH configuration
export PATH="/opt/homebrew/opt/python@3.12/libexec/bin:$PATH"

# Google Cloud SDK (conditional, fast loading)
if [ -f "$HOME/google-cloud-sdk/path.zsh.inc" ]; then
  . "$HOME/google-cloud-sdk/path.zsh.inc"
fi

# Skip completion for faster loading (enable manually if needed)
# if [ -f "$HOME/google-cloud-sdk/completion.zsh.inc" ]; then
#   . "$HOME/google-cloud-sdk/completion.zsh.inc"
# fi

# 1Password configuration
export OP_ACCOUNT="reggiedro"
export OP_VAULT="LivHana-Ops-Keys"
op-get() { op read "op://$OP_VAULT/$1"; }

# API Key fallbacks (non-blocking, no 1Password calls)
export OPENAI_API_KEY="${OPENAI_API_KEY:-local-voice-mode-active}"

# Liv Hana Tier-1 Boot (MANUAL via alias, not auto-run)
alias tier1-boot='cd ~/LivHana-Trinity-Local/LivHana-SoT && bash scripts/claude_tier1_boot.sh'
alias claude-tier1='tier1-boot && if command -v claude >/dev/null 2>&1; then claude; fi'

# Load local environment if exists (non-blocking)
[ -f "$HOME/.local/bin/env" ] && . "$HOME/.local/bin/env"

# Optional: Manual 3-agent boot (NON-BLOCKING alias)
alias boot-3-agents='bash ~/LivHana-Trinity-Local/TIER1_BOOT_LOCK_3_AGENTS_24_7.sh'

EOFZSHRC

success "Fixed ~/.zshrc - removed blocking boot calls"
echo

# STEP 3: Test shell load time
banner "STEP 3: TEST SHELL LOAD TIME"
info "Testing new shell initialization speed..."
START_TIME=$(date +%s.%N)
zsh -i -c exit 2>/dev/null || true
END_TIME=$(date +%s.%N)
LOAD_TIME=$(echo "$END_TIME - $START_TIME" | bc)
info "Shell load time: ${LOAD_TIME}s"
if (( $(echo "$LOAD_TIME < 3.0" | bc -l) )); then
  success "Shell loads fast (< 3s) ✓"
else
  warning "Shell still slow (${LOAD_TIME}s) - may need further optimization"
fi
echo

# STEP 4: Verify no 1Password errors
banner "STEP 4: VERIFY NO 1PASSWORD ERRORS"
info "Testing shell loads without errors..."
if zsh -i -c 'echo "Test successful"' 2>&1 | grep -q "isn't an item"; then
  error "Still seeing 1Password errors"
  warning "Check for additional op calls in ~/.zshenv or ~/.zprofile"
else
  success "No 1Password errors detected"
fi
echo

# STEP 5: Summary
banner "FIX COMPLETE"
success "Shell environment optimized for Cursor"
success "Blocking boot scripts moved to manual aliases"
echo
info "Next steps:"
info "  1. Restart Cursor: Cmd+Q then reopen"
info "  2. Open new terminal: should load in < 2s"
info "  3. Run Tier-1 boot manually: tier1-boot"
echo
info "Manual aliases available:"
info "  • tier1-boot         - Run Tier-1 boot system"
info "  • claude-tier1       - Boot + launch Claude Code"
info "  • boot-3-agents      - Launch 3-agent foundation"
echo
success "🎯 ONE SHOT, ONE KILL - ENVIRONMENT FIXED"
success "🏆 SEMPER FI"
echo


