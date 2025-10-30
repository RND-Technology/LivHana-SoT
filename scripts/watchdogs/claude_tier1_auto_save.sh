#!/usr/bin/env bash
# Claude Tier-1 Auto-Save - Manifest-Driven with Guard Rails
# Tracks critical boot dependencies with 5-minute intervals
# Production-grade: flock locking, hash-based change detection, rollback support

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MANIFEST="$ROOT/config/claude_tier1_auto_save_manifest.json"
STATE_FILE="$ROOT/tmp/claude_tier1_auto_save.state"
STATUS_FILE="$ROOT/tmp/claude_tier1_auto_save_status.json"
LOCK_FILE="$ROOT/tmp/claude_tier1_auto_save.lock"
LOG_FILE="$ROOT/logs/claude_tier1_auto_save.log"

# Ensure directories exist
mkdir -p "$ROOT/tmp" "$ROOT/logs" "$ROOT/config"

# Single-instance enforcement via flock
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  echo "ERROR: Another auto-save instance running (PID $(cat "$LOCK_FILE" 2>/dev/null || echo unknown))"
  exit 1
fi
echo $$ > "$LOCK_FILE"

# Cleanup on exit - preserve actual exit code
# Capture exit code at trap invocation, not inside handler
cleanup() {
  local exit_code=${1:-0}
  rm -f "$LOCK_FILE"
  if [[ $exit_code -eq 0 ]]; then
    log "Auto-save stopped cleanly (PID $$)"
  else
    log_error "Auto-save stopped with error code $exit_code (PID $$)"
  fi
  exit $exit_code
}
trap 'cleanup $?' EXIT
trap 'cleanup 143' SIGTERM
trap 'cleanup 130' SIGINT

# Logging
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"
}

log_error() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: $*" | tee -a "$LOG_FILE" >&2
}

# Load manifest settings
load_settings() {
  if [[ ! -f "$MANIFEST" ]]; then
    log_error "Manifest not found: $MANIFEST"
    exit 1
  fi

  INTERVAL=$(python3 -c "import json; print(json.load(open('$MANIFEST'))['settings']['interval_seconds'])" 2>/dev/null || echo 300)
  MAX_COMMITS_PER_HOUR=$(python3 -c "import json; print(json.load(open('$MANIFEST'))['settings']['max_commits_per_hour'])" 2>/dev/null || echo 12)
  MIN_DISK_SPACE_GB=$(python3 -c "import json; print(json.load(open('$MANIFEST'))['settings']['min_disk_space_gb'])" 2>/dev/null || echo 5)
  AUTO_PUSH=$(python3 -c "import json; print(str(json.load(open('$MANIFEST'))['settings']['auto_push']).lower())" 2>/dev/null || echo "false")
  DRY_RUN=$(python3 -c "import json; print(str(json.load(open('$MANIFEST'))['settings']['dry_run']).lower())" 2>/dev/null || echo "false")
}

# Expand manifest patterns to file list
expand_manifest() {
  python3 - "$ROOT" "$MANIFEST" <<'PY'
import json, sys, pathlib

root = pathlib.Path(sys.argv[1])
manifest = json.loads(pathlib.Path(sys.argv[2]).read_text())
files = set()

def matches_exclude(path, excludes):
    p = str(path)
    return any(pathlib.Path(p).match(ex.replace('**/', '')) or ex in p for ex in excludes)

excludes = manifest.get("exclude_patterns", [])

# Expand all tracked patterns
for category, patterns in manifest.get("tracked_patterns", {}).items():
    for pattern in patterns:
        for match in root.glob(pattern):
            if match.is_file() and not matches_exclude(match, excludes):
                files.add(str(match.relative_to(root)))

for f in sorted(files):
    print(f)
PY
}

# Initialize state file with file hashes
init_state() {
  log "Initializing state file..."
  > "$STATE_FILE"
  local count=0
  
  while IFS= read -r file; do
    local fullpath="$ROOT/$file"
    [[ -f "$fullpath" ]] || continue
    
    local hash=$(shasum -a 256 "$fullpath" 2>/dev/null | awk '{print $1}')
    echo "$file:$hash" >> "$STATE_FILE"
    ((count++))
  done < <(expand_manifest)
  
  log "State initialized: tracking $count files"
  echo "$count"
}

# Guard Rail 1: Check git repo health
check_repo_health() {
  if ! git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
    log_error "Not a git repository"
    return 1
  fi
  
  if ! git -C "$ROOT" fsck --quick 2>/dev/null; then
    log_error "Git repo health check failed"
    return 1
  fi
  
  return 0
}

# Guard Rail 2: Check for existing staged changes
check_clean_staging() {
  if ! git -C "$ROOT" diff --cached --quiet 2>/dev/null; then
    log_error "Staged changes already exist - aborting to avoid conflicts"
    return 1
  fi
  return 0
}

# Guard Rail 3: Rate limiting
check_rate_limit() {
  local commit_count=$(git -C "$ROOT" log --since="1 hour ago" --oneline 2>/dev/null | wc -l | tr -d ' ')
  
  if [[ $commit_count -ge $MAX_COMMITS_PER_HOUR ]]; then
    log "RATE LIMIT: $commit_count commits in last hour (max: $MAX_COMMITS_PER_HOUR)"
    return 1
  fi
  
  return 0
}

# Guard Rail 4: Disk space check
check_disk_space() {
  local available_gb=$(df -h / | tail -1 | awk '{print $4}' | sed 's/Gi//')
  
  if [[ "$available_gb" =~ ^[0-9]+$ ]] && [[ $available_gb -lt $MIN_DISK_SPACE_GB ]]; then
    log_error "Low disk space: ${available_gb}GB < ${MIN_DISK_SPACE_GB}GB threshold"
    return 1
  fi
  
  return 0
}

# Detect changed files using cached hashes
detect_changes() {
  local changes=()
  
  while IFS= read -r file; do
    local fullpath="$ROOT/$file"
    [[ -f "$fullpath" ]] || continue
    
    local current_hash=$(shasum -a 256 "$fullpath" 2>/dev/null | awk '{print $1}')
    local stored_hash=$(grep "^${file}:" "$STATE_FILE" 2>/dev/null | cut -d: -f2-)
    
    if [[ "$current_hash" != "$stored_hash" ]]; then
      changes+=("$file")
      
      # Update state file
      if grep -q "^${file}:" "$STATE_FILE" 2>/dev/null; then
        # Use temp file for atomic update
        grep -v "^${file}:" "$STATE_FILE" > "$STATE_FILE.tmp"
        echo "${file}:${current_hash}" >> "$STATE_FILE.tmp"
        mv "$STATE_FILE.tmp" "$STATE_FILE"
      else
        echo "${file}:${current_hash}" >> "$STATE_FILE"
      fi
    fi
  done < <(expand_manifest)
  
  # Return changed files as array
  printf '%s\n' "${changes[@]}"
}

# Stage and commit changes
commit_changes() {
  local -a changed_files=("$@")
  local change_count=${#changed_files[@]}
  
  if [[ $change_count -eq 0 ]]; then
    return 0
  fi
  
  cd "$ROOT"
  
  # Stage changed files
  for file in "${changed_files[@]}"; do
    git add "$file" 2>/dev/null || {
      log_error "Failed to stage: $file"
      git reset --quiet 2>/dev/null || true
      return 1
    }
  done
  
  # Verify staging worked
  if git diff --cached --quiet 2>/dev/null; then
    log "No changes to commit after staging"
    return 0
  fi
  
  # Create commit message
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S %Z')
  local commit_msg="🔄 AUTO: Claude Tier-1 dependencies update

Changed files: $change_count
Timestamp: $timestamp

Files modified:"
  
  for file in "${changed_files[@]}"; do
    commit_msg="$commit_msg
  - $file"
  done
  
  commit_msg="$commit_msg

Co-Authored-By: Claude Tier-1 Auto-Save <noreply@anthropic.com>"
  
  # Commit (or dry-run)
  if [[ "$DRY_RUN" == "true" ]]; then
    log "🧪 DRY-RUN: Would commit $change_count files"
    for file in "${changed_files[@]}"; do
      log "  - $file"
    done
    git reset --quiet 2>/dev/null || true
    return 0
  fi
  
  if ! git commit -m "$commit_msg" 2>/dev/null; then
    log_error "Commit failed - resetting staged changes"
    git reset --quiet 2>/dev/null || true
    return 1
  fi
  
  local commit_hash=$(git rev-parse --short HEAD 2>/dev/null)
  log "✅ Committed $change_count files (${commit_hash})"
  
  # Optional push
  if [[ "$AUTO_PUSH" == "true" ]]; then
    local branch=$(git branch --show-current 2>/dev/null)
    if git push origin "$branch" 2>/dev/null; then
      log "✅ Pushed to origin/$branch"
    else
      log_error "Push failed - commit is local only"
      return 1
    fi
  fi
  
  return 0
}

# Update watchdog status JSON (atomic write to prevent corruption)
update_status() {
  local changed_count=$1
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local commit_hash=$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo "null")
  local tracked=$(wc -l < "$STATE_FILE" 2>/dev/null || echo 0)
  local commits_last_hour=$(git -C "$ROOT" log --since="1 hour ago" --oneline 2>/dev/null | wc -l | tr -d ' ')

  # Write to temp file first, then atomic move
  cat > "$STATUS_FILE.tmp" <<EOF
{
  "watchdog": "claude_tier1_auto_save",
  "status": "active",
  "last_check": "$timestamp",
  "files_tracked": $tracked,
  "last_commit": "$commit_hash",
  "changed_files_count": $changed_count,
  "commits_last_hour": $commits_last_hour,
  "interval_seconds": $INTERVAL,
  "max_commits_per_hour": $MAX_COMMITS_PER_HOUR,
  "auto_push_enabled": $AUTO_PUSH,
  "dry_run_mode": $DRY_RUN,
  "pid": $$,
  "uptime_seconds": $SECONDS
}
EOF
  mv "$STATUS_FILE.tmp" "$STATUS_FILE"
}

# Main execution
main() {
  load_settings
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log "🧪 DRY-RUN MODE ENABLED - No commits will be made"
  fi
  
  log "Claude Tier-1 Auto-Save started (PID $$)"
  log "Settings: interval=${INTERVAL}s, max_commits/hr=$MAX_COMMITS_PER_HOUR, auto_push=$AUTO_PUSH, dry_run=$DRY_RUN"
  
  # Initialize state if needed
  if [[ ! -f "$STATE_FILE" ]]; then
    init_state
  else
    local tracked=$(wc -l < "$STATE_FILE" | tr -d ' ')
    log "Resuming: tracking $tracked files"
  fi
  
  # Main loop
  while true; do
    # Run all guard rails
    if ! check_repo_health; then
      log "Skipping cycle: repo health check failed"
      sleep "$INTERVAL"
      continue
    fi
    
    if ! check_clean_staging; then
      log "Skipping cycle: staged changes exist"
      sleep "$INTERVAL"
      continue
    fi
    
    if ! check_rate_limit; then
      log "Skipping cycle: rate limit reached"
      sleep "$INTERVAL"
      continue
    fi
    
    if ! check_disk_space; then
      log "Skipping cycle: low disk space"
      sleep "$INTERVAL"
      continue
    fi
    
    # Detect and commit changes
    mapfile -t changed_files < <(detect_changes)
    
    if [[ ${#changed_files[@]} -gt 0 ]]; then
      if commit_changes "${changed_files[@]}"; then
        update_status "${#changed_files[@]}"
      else
        log_error "Commit failed - will retry next cycle"
        update_status 0
      fi
    else
      update_status 0
    fi
    
    sleep "$INTERVAL"
  done
}

# Start
main
