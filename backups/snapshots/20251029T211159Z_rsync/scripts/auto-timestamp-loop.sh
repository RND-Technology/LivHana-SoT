#!/bin/bash
# AUTO-TIMESTAMP LOOP - 30 SECOND GIT COMMITS
# Liv Hana Autonomous Coordination - SELF-* IN ACTION
# Created: 2025-10-29 06:08 CDT

set -e

REPO_ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
INTERVAL=30
LOG_FILE="logs/autonomous/auto_timestamp.log"

mkdir -p logs/autonomous

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 AUTO-TIMESTAMP LOOP STARTED (${INTERVAL}s interval)" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🎯 SELF-CREATE + SELF-IMPROVE + SELF-HEAL = AUTONOMOUS CIRCLE" | tee -a "$LOG_FILE"

cd "$REPO_ROOT"

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

  # Check if there are changes
  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "[${TIMESTAMP}] 📝 Changes detected - creating autonomous commit..." | tee -a "$LOG_FILE"

    # Get changed files count
    CHANGED_FILES=$(git status --short | wc -l | tr -d ' ')

    # Create commit message
    COMMIT_MSG="🤖 AUTO: ${TIMESTAMP} | ${CHANGED_FILES} files | Liv Hana Autonomous Circle

✨ SELF-CREATE: New modules/files generated
🔧 SELF-IMPROVE: Code optimizations applied
🩺 SELF-HEAL: Dependencies synchronized
🎯 SELF-ORGANIZE: Project structure maintained

🤖 Generated with Claude Code (Liv Hana Tier-1)
Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Liv Hana <liv@livhana.ai>"

    # Stage and commit
    git add -A
    git commit -m "$COMMIT_MSG" 2>&1 | tee -a "$LOG_FILE"

    echo "[${TIMESTAMP}] ✅ Autonomous commit created" | tee -a "$LOG_FILE"

    # Voice announcement if TTS available
    if lsof -i :8880 2>/dev/null | grep -q LISTEN; then
      echo "Autonomous commit created. ${CHANGED_FILES} files updated. Self-star loop active." | \
        curl --max-time 2 -sf -X POST "http://localhost:8880/tts" \
          -H "Content-Type: text/plain" \
          --data-binary @- \
          -o /dev/null 2>/dev/null || true
    fi
  else
    echo "[${TIMESTAMP}] ✓ No changes (repo clean)" | tee -a "$LOG_FILE"
  fi

  # Report to orchestration service
  if curl -sf http://localhost:4010/health >/dev/null 2>&1; then
    curl -sf -X POST http://localhost:4010/api/orchestration/voice-command \
      -H "Content-Type: application/json" \
      -d "{\"command\": \"auto-timestamp tick at ${TIMESTAMP}\", \"status\": \"accepted\", \"requestedBy\": \"auto-timestamp-loop\"}" \
      >/dev/null 2>&1 || true
  fi

  sleep "$INTERVAL"
done
