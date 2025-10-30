#!/usr/bin/env bash
# Universal Auto-Save Script - Commits ALL changes every 60 seconds
# Created: 2025-10-29 for Jesse CEO
# Purpose: Keep local repo constantly synced with 1-minute auto-commits

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)"
LOG="$ROOT/logs/universal_auto_save.log"
INTERVAL=60  # 60 SECONDS

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1" | tee -a "$LOG"; }
warning() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️  $1" | tee -a "$LOG"; }

mkdir -p "$(dirname "$LOG")"

info "🚀 UNIVERSAL AUTO-SAVE STARTED (PID $$)"
info "Interval: ${INTERVAL}s | Root: $ROOT"

# Trap signals for graceful shutdown
trap 'info "Universal auto-save shutting down (PID $$)"; exit 0' SIGTERM SIGINT

cd "$ROOT"

while true; do
  TIMESTAMP=$(date '+%H:%M:%S')
  BRANCH=$(git branch --show-current)

  info "=== AUTO-SAVE CYCLE @ $TIMESTAMP ==="

  # Check for changes
  if ! git diff-index --quiet HEAD -- 2>/dev/null || [[ -n "$(git ls-files --others --exclude-standard)" ]]; then
    info "Changes detected - staging and committing..."

    # Stage all changes
    git add -A 2>&1 | tee -a "$LOG" || true

    # Check if there's anything staged
    if ! git diff --cached --quiet 2>/dev/null; then
      # Commit with dynamic timestamp
      COMMIT_MSG="⏱️  AUTO-SAVE: $TIMESTAMP - Continuous sync

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

      if git commit -m "$COMMIT_MSG" 2>&1 | tee -a "$LOG"; then
        success "Committed @ $TIMESTAMP"

        # Push to remote
        info "Pushing to origin/$BRANCH..."
        if git push origin "$BRANCH" 2>&1 | tee -a "$LOG"; then
          success "Pushed to origin/$BRANCH"
        else
          warning "Push failed (check network/permissions)"
        fi
      else
        warning "Commit failed or nothing to commit"
      fi
    else
      info "No staged changes after git add"
    fi
  else
    info "No changes detected - clean working tree"
  fi

  info "Next cycle in ${INTERVAL}s..."
  sleep "$INTERVAL"
done
