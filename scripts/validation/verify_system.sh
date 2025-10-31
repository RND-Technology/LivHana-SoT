#!/usr/bin/env bash
# System Verification Script - PROOF OF OPERATION
# Verifies all watchdogs, services, and auto-save mechanisms

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

passed=0
failed=0

check() {
  local name="$1"
  local command="$2"
  
  echo -n "Checking $name... "
  if eval "$command" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    passed=$((passed + 1))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC}"
    failed=$((failed + 1))
    return 1
  fi
}

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         LIVHANA SYSTEM VERIFICATION - PROOF OF OPERATION      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "=== WATCHDOG VERIFICATION ==="
check "Auto-commit watchdog" "tmux has-session -t auto-timestamp"
check "Dependency watchdog" "tmux has-session -t dependency-watch"
check "Dual tier-1 coordination" "tmux has-session -t dual-tier1"
echo ""

echo "=== SERVICE VERIFICATION ==="
check "Redis (6379)" "lsof -i :6379"
check "STT service (2022)" "lsof -i :2022"
check "TTS service (8880)" "lsof -i :8880"
check "Reasoning-gateway (4002)" "lsof -i :4002"
check "Orchestration (4010)" "lsof -i :4010"
echo ""

echo "=== FILE VERIFICATION ==="
check "Auto-commit log exists" "test -f $ROOT/logs/boot_script_auto_commit.log"
check "Dependency log exists" "test -f $ROOT/logs/dependency_auto_save.log"
check "Boot state file exists" "test -f $ROOT/tmp/boot_script_watch.state"
check "Dependency state file exists" "test -f $ROOT/tmp/dependency_watch.state"
echo ""

echo "=== RECENT ACTIVITY VERIFICATION ==="
check "Auto-commit log updated recently" "test \$(find $ROOT/logs/boot_script_auto_commit.log -mmin -5 2>/dev/null | wc -l) -gt 0"
check "Dependency log updated recently" "test \$(find $ROOT/logs/dependency_auto_save.log -mmin -5 2>/dev/null | wc -l) -gt 0"
echo ""

echo "=== GIT VERIFICATION ==="
check "Git working tree clean" "git -C $ROOT diff --quiet || git -C $ROOT diff --cached --quiet"
check "Branch tracking set" "git -C $ROOT rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                         RESULTS                                ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "  ${GREEN}Passed: $passed${NC}"
echo -e "  ${RED}Failed: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✅ ALL SYSTEMS OPERATIONAL${NC}"
  echo ""
  echo "🎖️ Marine Corps Standard: ACHIEVED"
  exit 0
else
  echo -e "${RED}❌ SYSTEM FAILURES DETECTED${NC}"
  echo ""
  echo "Run ./START.sh to restart failed services"
  exit 1
fi
