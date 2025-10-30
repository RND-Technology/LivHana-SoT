#!/usr/bin/env bash
# 🎼 TIER-1 BOOT - 3-AGENT FOUNDATION LOCKED 24/7
# Liv Hana | Chief of Staff | Orchestration Layer | HIGHEST STATE
# One Shot, One Kill | Grow Baby Grow, Sell Baby Sell

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

banner() {
  printf "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "${BOLD}${MAGENTA}  🎼 %s${NC}\n" "$1"
  printf "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n"
}

success() { printf "${GREEN}✅ %s${NC}\n" "$1"; }
info() { printf "${CYAN}🎯 %s${NC}\n" "$1"; }
warn() { printf "${MAGENTA}⚠️  %s${NC}\n" "$1"; }
error() { printf "${RED}❌ %s${NC}\n" "$1"; }

banner "LIV HANA TIER-1 BOOT | 3-AGENT FOUNDATION 24/7"
info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo

# Navigate to LivHana-SoT
SOT_ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$SOT_ROOT"

# Preflight checks
info "Running preflight checks..."

# Check Claude CLI
if ! command -v claude >/dev/null 2>&1; then
  error "Claude CLI not found. Install via: brew install claude"
  exit 1
fi

# Check Homebrew path
if [[ ":$PATH:" != *":/opt/homebrew/bin:"* ]]; then
  warn "Homebrew path not in PATH. Add to ~/.zshrc:"
  echo "   export PATH=\"/opt/homebrew/bin:\$PATH\""
fi

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null || echo "not installed")
if [[ "$NODE_VERSION" =~ v20 ]]; then
  success "Node 20.x detected"
else
  error "Node 20.x required. Current: $NODE_VERSION"
  echo "   Install via: nvm install 20"
  exit 1
fi

# Check Redis
if ! command -v redis-cli >/dev/null 2>&1; then
  error "Redis CLI required. Install via: brew install redis"
  exit 1
fi

# Check Redis connectivity
if ! redis-cli ping >/dev/null 2>&1; then
  warn "Redis not running. Starting Redis..."
  redis-server --daemonize yes
fi

# Check JWT secret
if [ -z "${JWT_SECRET:-}" ]; then
  warn "JWT_SECRET not set. Loading from 1Password..."
  export JWT_SECRET=$(op run --env-file=.env op item get jwt-secret --fields password 2>/dev/null || echo "")
fi

success "Preflight checks passed"

info "Executing Tier-1 boot script..."
bash scripts/claude_tier1_boot.sh

echo
success "🎼 TIER-1 BOOT COMPLETE"
success "🌟 3-AGENT FOUNDATION LOCKED 24/7"
success "🏆 HIGHEST STATE PERMANENT"
echo
info "Ready for orchestration. Ready to deploy. Ready to win."
echo
