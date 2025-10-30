#!/usr/bin/env bash
# Validation Checklist for Claude Tier-1 Auto-Save Deployment
# Run this before enabling production mode

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="$ROOT/config/claude_tier1_auto_save_manifest.json"
SCRIPT="$ROOT/scripts/watchdogs/claude_tier1_auto_save.sh"
LOG_FILE="$ROOT/logs/auto_save_validation.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

mkdir -p "$ROOT/logs"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

success() { printf "${GREEN}✅ %s${NC}\n" "$1" | tee -a "$LOG_FILE"; }
error() { printf "${RED}❌ %s${NC}\n" "$1" | tee -a "$LOG_FILE"; }
warning() { printf "${YELLOW}⚠️  %s${NC}\n" "$1" | tee -a "$LOG_FILE"; }
info() { printf "${BLUE}ℹ️  %s${NC}\n" "$1" | tee -a "$LOG_FILE"; }

banner() {
  printf "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n" | tee -a "$LOG_FILE"
  printf "${BOLD}${BLUE}  %s${NC}\n" "$1" | tee -a "$LOG_FILE"
  printf "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n" | tee -a "$LOG_FILE"
}

CHECKS_PASSED=0
CHECKS_FAILED=0

banner "CLAUDE TIER-1 AUTO-SAVE VALIDATION"

# Check 1: Stabilize First
banner "CHECK 1: SYSTEM STABILIZATION"

info "Checking for duplicate watchdog processes..."
AGENT_LOGGER_COUNT=$(pgrep -f "agent_status_realtime_logger.sh" | wc -l | tr -d ' ')
OP_GUARD_COUNT=$(pgrep -f "op_secret_guard.sh" | wc -l | tr -d ' ')

if [[ $AGENT_LOGGER_COUNT -le 1 ]] && [[ $OP_GUARD_COUNT -le 1 ]]; then
  success "Watchdog processes stable (agent_logger: $AGENT_LOGGER_COUNT, op_guard: $OP_GUARD_COUNT)"
  ((CHECKS_PASSED++))
else
  error "Duplicate watchdogs detected (agent_logger: $AGENT_LOGGER_COUNT, op_guard: $OP_GUARD_COUNT)"
  warning "Run: bash tmp/CLEANUP_EXECUTION_PLAN.sh"
  ((CHECKS_FAILED++))
fi

info "Checking git clean state..."
if git -C "$ROOT" diff --quiet && git -C "$ROOT" diff --cached --quiet; then
  success "Git working tree clean"
  ((CHECKS_PASSED++))
else
  warning "Git has uncommitted changes"
  info "Modified files: $(git -C "$ROOT" status --short | wc -l | tr -d ' ')"
  ((CHECKS_PASSED++))  # Non-fatal
fi

info "Capturing system snapshots..."
{
  echo "=== TMUX SESSIONS ==="
  tmux ls 2>/dev/null || echo "No tmux sessions"
  echo ""
  echo "=== WATCHDOG PROCESSES ==="
  ps aux | grep -E "(watchdog|auto_save)" | grep -v grep || echo "No watchdog processes"
  echo ""
  echo "=== GIT STATUS ==="
  git -C "$ROOT" status
} > "$ROOT/tmp/pre_auto_save_snapshot.txt"
success "Snapshot saved: tmp/pre_auto_save_snapshot.txt"
((CHECKS_PASSED++))

# Check 2: Manifest-Driven Coverage
banner "CHECK 2: MANIFEST VALIDATION"

if [[ -f "$MANIFEST" ]]; then
  success "Manifest exists: $MANIFEST"
  ((CHECKS_PASSED++))
  
  # Validate JSON
  if python3 -c "import json; json.load(open('$MANIFEST'))" 2>/dev/null; then
    success "Manifest JSON valid"
    ((CHECKS_PASSED++))
    
    # Check tracked patterns
    TRACKED_COUNT=$(python3 -c "import json; m=json.load(open('$MANIFEST')); print(sum(len(v) for v in m['tracked_patterns'].values()))" 2>/dev/null)
    info "Tracked patterns: $TRACKED_COUNT"
    
    # Check exclude patterns
    EXCLUDE_COUNT=$(python3 -c "import json; print(len(json.load(open('$MANIFEST'))['exclude_patterns']))" 2>/dev/null)
    info "Exclude patterns: $EXCLUDE_COUNT"
    
    # Verify secrets excluded
    if python3 -c "import json; excludes=json.load(open('$MANIFEST'))['exclude_patterns']; assert any('secret' in e for e in excludes)" 2>/dev/null; then
      success "Secrets excluded from tracking"
      ((CHECKS_PASSED++))
    else
      error "Secrets not excluded - SECURITY RISK"
      ((CHECKS_FAILED++))
    fi
  else
    error "Manifest JSON invalid"
    ((CHECKS_FAILED++))
  fi
else
  error "Manifest not found: $MANIFEST"
  ((CHECKS_FAILED++))
fi

# Check 3: Script Validation
banner "CHECK 3: SCRIPT VALIDATION"

if [[ -f "$SCRIPT" ]]; then
  success "Auto-save script exists: $SCRIPT"
  ((CHECKS_PASSED++))
  
  if [[ -x "$SCRIPT" ]]; then
    success "Script is executable"
    ((CHECKS_PASSED++))
  else
    error "Script not executable"
    warning "Run: chmod +x $SCRIPT"
    ((CHECKS_FAILED++))
  fi
  
  # Check for flock
  if grep -q "flock -n 200" "$SCRIPT"; then
    success "Single-instance enforcement (flock) present"
    ((CHECKS_PASSED++))
  else
    error "Missing flock single-instance enforcement"
    ((CHECKS_FAILED++))
  fi
  
  # Check for guard rails
  if grep -q "check_repo_health\|check_clean_staging\|check_rate_limit\|check_disk_space" "$SCRIPT"; then
    success "Guard rails implemented"
    ((CHECKS_PASSED++))
  else
    error "Missing guard rails"
    ((CHECKS_FAILED++))
  fi
else
  error "Auto-save script not found: $SCRIPT"
  ((CHECKS_FAILED++))
fi

# Check 4: Dry-Run Configuration
banner "CHECK 4: DRY-RUN CONFIGURATION"

DRY_RUN=$(python3 -c "import json; print(json.load(open('$MANIFEST'))['settings']['dry_run'])" 2>/dev/null || echo "false")
AUTO_PUSH=$(python3 -c "import json; print(json.load(open('$MANIFEST'))['settings']['auto_push'])" 2>/dev/null || echo "false")

if [[ "$DRY_RUN" == "True" ]] || [[ "$DRY_RUN" == "true" ]]; then
  success "Dry-run mode ENABLED (safe for testing)"
  ((CHECKS_PASSED++))
else
  warning "Dry-run mode DISABLED (production mode)"
  info "For initial testing, enable dry_run in manifest"
fi

if [[ "$AUTO_PUSH" == "False" ]] || [[ "$AUTO_PUSH" == "false" ]]; then
  success "Auto-push DISABLED (commits stay local)"
  ((CHECKS_PASSED++))
else
  warning "Auto-push ENABLED (will push to remote)"
  info "Ensure this is intentional"
fi

# Check 5: Dependencies
banner "CHECK 5: DEPENDENCIES"

if command -v python3 >/dev/null 2>&1; then
  success "Python 3 available"
  ((CHECKS_PASSED++))
else
  error "Python 3 not found"
  ((CHECKS_FAILED++))
fi

if command -v git >/dev/null 2>&1; then
  success "Git available"
  ((CHECKS_PASSED++))
else
  error "Git not found"
  ((CHECKS_FAILED++))
fi

if command -v shasum >/dev/null 2>&1; then
  success "shasum available (for file hashing)"
  ((CHECKS_PASSED++))
else
  error "shasum not found"
  ((CHECKS_FAILED++))
fi

# Summary
banner "VALIDATION SUMMARY"

TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_FAILED))
echo ""
info "Total checks: $TOTAL_CHECKS"
success "Passed: $CHECKS_PASSED"
if [[ $CHECKS_FAILED -gt 0 ]]; then
  error "Failed: $CHECKS_FAILED"
else
  success "Failed: 0"
fi
echo ""

if [[ $CHECKS_FAILED -eq 0 ]]; then
  success "✅ ALL CHECKS PASSED - Ready for dry-run testing"
  echo ""
  info "Next steps:"
  echo "  1. Start dry-run: bash scripts/start_auto_save_dry_run.sh"
  echo "  2. Monitor for 15 minutes: tail -f logs/claude_tier1_auto_save.log"
  echo "  3. Verify: cat tmp/watchdog_status.json"
  echo "  4. If successful, disable dry_run in manifest and restart"
  exit 0
else
  error "❌ VALIDATION FAILED - Fix issues before deployment"
  echo ""
  info "Review failures above and re-run validation"
  exit 1
fi
