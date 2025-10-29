#!/usr/bin/env bash
# Boot Script Auto-Commit Watchdog
# Automatically commits and pushes boot script improvements during sessions
# Created: 2025-10-28 by Liv Hana (Tier-1)
# Owner: Jesse CEO

set -euo pipefail

# Configuration
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)"
WATCH_FILES=(
  "$ROOT/scripts/claude_tier1_boot.sh"
  "$ROOT/START.sh"
  "$ROOT/.vscode/launch.json"
  "$ROOT/.vscode/tasks.json"
  "$ROOT/.vscode/settings.json"
  "$ROOT/.claude/RUNBOOK_VSCODE_STABILITY_PROTOCOL.md"
  "$ROOT/scripts/agents/dual_tier1_loop.sh"
  "$ROOT/backend/reasoning-gateway/src/routes/agentStatus.ts"
  "$ROOT/backend/reasoning-gateway/src/routes/agentStatus.js"
  "$ROOT/backend/reasoning-gateway/src/index.js"
  "$ROOT/.claude/INTER_AGENT_COMMUNICATION_PROTOCOL.md"
  "$ROOT/package.json"
)
CHECK_INTERVAL="${BOOT_SCRIPT_WATCH_INTERVAL:-30}"  # 30 seconds TURBO MODE
LOG="$ROOT/logs/boot_script_auto_commit.log"
STATE_FILE="$ROOT/tmp/boot_script_watch.state"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1" | tee -a "$LOG"; }
warning() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️  $1" | tee -a "$LOG"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1" | tee -a "$LOG"; }

# Initialize
mkdir -p "$(dirname "$LOG")" "$(dirname "$STATE_FILE")"

info "Boot script auto-commit watchdog started (PID $$)"
info "Monitoring files: ${#WATCH_FILES[@]} boot-related files"
info "Check interval: ${CHECK_INTERVAL}s"

# Initialize state file with current file hashes
initialize_state() {
  info "Initializing file state tracking..."
  > "$STATE_FILE"
  for file in "${WATCH_FILES[@]}"; do
    if [[ -f "$file" ]]; then
      hash=$(shasum -a 256 "$file" 2>/dev/null | awk '{print $1}')
      echo "$file:$hash" >> "$STATE_FILE"
    fi
  done
  success "State file initialized: $STATE_FILE"
}

# Check if any watched files have changed
check_for_changes() {
  local changes=()

  for file in "${WATCH_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
      continue
    fi

    current_hash=$(shasum -a 256 "$file" 2>/dev/null | awk '{print $1}')
    stored_hash=$(grep "^$file:" "$STATE_FILE" 2>/dev/null | cut -d: -f2)

    if [[ "$current_hash" != "$stored_hash" ]]; then
      changes+=("$file")
      # Update stored hash
      sed -i.bak "s|^$file:.*|$file:$current_hash|" "$STATE_FILE" 2>/dev/null || \
        echo "$file:$current_hash" >> "$STATE_FILE"
    fi
  done

  # Handle empty array safely with set -u
  if [[ ${#changes[@]} -gt 0 ]]; then
    echo "${changes[@]}"
  fi
}

# Generate commit message based on changed files
generate_commit_message() {
  local changed_files=("$@")
  local message="feat(boot): Auto-commit boot script improvements

Session improvements detected in:
"

  for file in "${changed_files[@]}"; do
    local basename=$(basename "$file")
    message+="- $basename
"
  done

  message+="
**Auto-committed by boot script watchdog**
- Check interval: ${CHECK_INTERVAL}s
- Session timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

  echo "$message"
}

# Commit and push changes
auto_commit_and_push() {
  local changed_files=("$@")

  info "Detected changes in ${#changed_files[@]} file(s)"

  cd "$ROOT"

  # Check if there are already staged changes
  if git diff --cached --quiet; then
    # No staged changes - stage our files
    for file in "${changed_files[@]}"; do
      git add "$file"
      success "Staged: $(basename "$file")"
    done
  else
    info "Using existing staged changes"
  fi

  # Check if there's anything to commit
  if git diff --cached --quiet; then
    warning "No changes to commit after staging"
    return 0
  fi

  # Generate commit message
  local commit_msg=$(generate_commit_message "${changed_files[@]}")

  # Commit
  if git commit -m "$commit_msg" 2>&1 | tee -a "$LOG"; then
    success "Committed boot script improvements"
  else
    error "Commit failed - check logs"
    return 1
  fi

  # Push to current branch
  local current_branch=$(git branch --show-current)
  info "Pushing to origin/$current_branch..."

  if git push origin "$current_branch" 2>&1 | tee -a "$LOG"; then
    success "Pushed to origin/$current_branch"

    # Log to session progress
    {
      echo ""
      echo "## $(date '+%Y-%m-%d %H:%M:%S %Z') — Auto-Committed Boot Improvements"
      echo ""
      echo "**Files Updated:**"
      for file in "${changed_files[@]}"; do
        echo "- $(basename "$file")"
      done
      echo ""
      echo "**Branch:** $current_branch"
      echo "**Commit:** $(git rev-parse --short HEAD)"
      echo ""
    } >> "$ROOT/.claude/SESSION_PROGRESS.md"

    return 0
  else
    error "Push failed - check logs"
    return 1
  fi
}

# Main watch loop
watch_loop() {
  while true; do
    sleep "$CHECK_INTERVAL"

    # Check for changes
    changed_files=($(check_for_changes))

    if [[ ${#changed_files[@]} -gt 0 ]]; then
      info "Boot script changes detected"

      # Wait a bit to ensure all writes are complete
      sleep 5

      # Re-check to confirm changes are stable
      changed_files=($(check_for_changes))

      if [[ ${#changed_files[@]} -gt 0 ]]; then
        auto_commit_and_push "${changed_files[@]}"
      else
        info "Changes were transient - skipping commit"
      fi
    fi
  done
}

# Trap signals for graceful shutdown
trap 'info "Boot script watchdog shutting down (PID $$)"; exit 0' SIGTERM SIGINT

# Start watchdog
if [[ ! -f "$STATE_FILE" ]] || [[ ! -s "$STATE_FILE" ]]; then
  initialize_state
fi

success "Boot script watchdog ready"
info "Will check for changes every ${CHECK_INTERVAL}s"
echo ""

watch_loop
