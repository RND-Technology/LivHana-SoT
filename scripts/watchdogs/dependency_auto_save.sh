#!/usr/bin/env bash
# Dependency Auto-Save Watchdog - ULTRA AGGRESSIVE MODE
# Updates ALL package-lock.json files every 30 seconds
# Created: 2025-10-29 by Liv Hana (Claude Code Tier-1)

set -euo pipefail
shopt -s nullglob

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)"
CHECK_INTERVAL=30  # 30 SECONDS - RELENTLESS
LOG="$ROOT/logs/dependency_auto_save.log"
STATE_FILE="$ROOT/tmp/dependency_watch.state"

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

mkdir -p "$(dirname "$LOG")" "$(dirname "$STATE_FILE")"

info "🚀 DEPENDENCY AUTO-SAVE WATCHDOG STARTED (PID $$)"
info "Mode: ULTRA AGGRESSIVE (30s intervals)"
info "Root: $ROOT"

# Find all package.json and package-lock.json files
find_dependency_files() {
  find "$ROOT" -type f \( -name "package.json" -o -name "package-lock.json" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/tmp/*" \
    ! -path "*/backups/*" \
    2>/dev/null
}

# Initialize state file with current hashes
initialize_state() {
  info "Initializing dependency file tracking..."
  > "$STATE_FILE"
  
  local count=0
  while IFS= read -r file; do
    if [[ -f "$file" ]]; then
      hash=$(shasum -a 256 "$file" 2>/dev/null | awk '{print $1}')
      echo "$file:$hash" >> "$STATE_FILE"
      count=$((count + 1))
    fi
  done < <(find_dependency_files)
  
  success "State initialized: $count dependency files tracked"
}

# Check for changes
check_for_changes() {
  local changes=()
  
  while IFS= read -r file; do
    if [[ ! -f "$file" ]]; then
      continue
    fi
    
    current_hash=$(shasum -a 256 "$file" 2>/dev/null | awk '{print $1}')
    stored_hash=$(grep "^$file:" "$STATE_FILE" 2>/dev/null | cut -d: -f2)
    
    if [[ "$current_hash" != "$stored_hash" ]]; then
      changes+=("$file")
      # Update stored hash
      if grep -q "^$file:" "$STATE_FILE" 2>/dev/null; then
        sed -i.bak "s|^$file:.*|$file:$current_hash|" "$STATE_FILE" 2>/dev/null
      else
        echo "$file:$current_hash" >> "$STATE_FILE"
      fi
    fi
  done < <(find_dependency_files)
  
  if [[ ${#changes[@]} -gt 0 ]]; then
    echo "${changes[@]}"
  fi
}

# Update all dependencies (npm install + lock regeneration)
update_all_dependencies() {
  info "🔄 RUNNING COMPREHENSIVE DEPENDENCY UPDATE..."
  
  local updated_count=0
  
  # Find all directories with package.json
  while IFS= read -r dir; do
    if [[ -f "$dir/package.json" ]]; then
      info "Updating dependencies: $dir"
      
      cd "$dir"
      
      # Update package-lock.json
      if npm install --package-lock-only --no-audit --no-fund 2>&1 | tee -a "$LOG"; then
        success "Updated: $dir/package-lock.json"
        updated_count=$((updated_count + 1))
      else
        warning "Failed to update: $dir"
      fi
      
      cd "$ROOT"
    fi
  done < <(find "$ROOT" -type f -name "package.json" ! -path "*/node_modules/*" -exec dirname {} \; 2>/dev/null | sort -u)
  
  success "Dependency update complete: $updated_count locations updated"
  return 0
}

# Generate commit message
generate_commit_message() {
  local changed_files=("$@")
  local message="🔄 AUTO: Dependency updates (30s watchdog)

Updated dependency files:
"
  
  for file in "${changed_files[@]}"; do
    local relpath=$(echo "$file" | sed "s|$ROOT/||")
    message+="- $relpath
"
  done
  
  message+="
**Auto-committed by dependency watchdog**
- Check interval: ${CHECK_INTERVAL}s
- Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
  
  echo "$message"
}

# Commit and push changes
auto_commit_and_push() {
  local changed_files=("$@")
  
  if [[ ${#changed_files[@]} -eq 0 ]]; then
    return 0
  fi
  
  info "Detected changes in ${#changed_files[@]} dependency file(s)"
  
  cd "$ROOT"
  
  # Stage changed files
  for file in "${changed_files[@]}"; do
    git add "$file" 2>&1 | tee -a "$LOG" || true
    success "Staged: $(basename "$file")"
  done
  
  # Check if there's anything to commit
  if git diff --cached --quiet; then
    info "No changes to commit after staging"
    return 0
  fi
  
  # Generate commit message
  local commit_msg=$(generate_commit_message "${changed_files[@]}")
  
  # Commit
  if git commit -m "$commit_msg" 2>&1 | tee -a "$LOG"; then
    success "Committed dependency updates"
  else
    warning "Commit skipped (no changes or error)"
    return 0
  fi
  
  # Push to current branch
  local current_branch=$(git branch --show-current)
  info "Pushing to origin/$current_branch..."
  
  if git push origin "$current_branch" 2>&1 | tee -a "$LOG"; then
    success "Pushed to origin/$current_branch"
    return 0
  else
    warning "Push failed (check logs)"
    return 1
  fi
}

# Main watch loop
watch_loop() {
  local iteration=0
  
  while true; do
    iteration=$((iteration + 1))
    
    info "=== CYCLE $iteration ==="
    
    # Update all dependencies
    update_all_dependencies
    
    # Check for changes
    changed_files=($(check_for_changes))
    
    if [[ ${#changed_files[@]} -gt 0 ]]; then
      info "Changes detected in ${#changed_files[@]} file(s)"
      
      # Wait a bit to ensure all writes are complete
      sleep 3
      
      # Re-check to confirm changes are stable
      changed_files=($(check_for_changes))
      
      if [[ ${#changed_files[@]} -gt 0 ]]; then
        auto_commit_and_push "${changed_files[@]}"
      else
        info "Changes were transient - skipping commit"
      fi
    else
      info "No changes detected"
    fi
    
    info "Next check in ${CHECK_INTERVAL}s..."
    sleep "$CHECK_INTERVAL"
  done
}

# Trap signals for graceful shutdown
trap 'info "Dependency watchdog shutting down (PID $$)"; exit 0' SIGTERM SIGINT

# Start watchdog
if [[ ! -f "$STATE_FILE" ]] || [[ ! -s "$STATE_FILE" ]]; then
  initialize_state
fi

success "Dependency auto-save watchdog ready"
info "Will update and check dependencies every ${CHECK_INTERVAL}s"
info "Press Ctrl+C to stop"
echo ""

watch_loop
