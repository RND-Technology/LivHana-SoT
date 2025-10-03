#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

# RPM Priority Check Script
# Quickly view current empire priorities
# Run anytime to see what you should be working on

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT"

echo ""
echo "🎯 EMPIRE PRIORITIES - $(date +%Y-%m-%d)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show top 10 priorities
TOP_10=$(ls -1 | grep -E "^[0-9]-" | head -10)

if [ -z "$TOP_10" ]; then
  echo "❌ No RPM DNA formatted folders found at root level"
  echo ""
  echo "💡 Create your first priority folder:"
  echo "   mkdir 2-BIZ.RND.010.DEPLOY.your-project.$(date +%Y%m%d)"
  echo ""
  exit 1
fi

echo "$TOP_10" | nl -w2 -s'. ' -v1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💪 THIS WEEK: Focus on top 3"
echo "📅 NEXT REVIEW: Monday $(date -d 'next Monday' +%Y-%m-%d 2>/dev/null || date -v+Mon +%Y-%m-%d 2>/dev/null || echo '[Next Monday]')"
echo ""

# Show priority breakdown
echo "📊 PRIORITY BREAKDOWN:"
MUST=$(ls -1 | grep -E "^[0-9]-.*\.0[0-9]{2}\." | wc -l | tr -d ' ')
RESULTS=$(ls -1 | grep -E "^[0-9]-.*\.1[0-9]{2}\." | wc -l | tr -d ' ')
PROGRESS=$(ls -1 | grep -E "^[0-9]-.*\.2[0-9]{2}\." | wc -l | tr -d ' ')
BACKLOG=$(ls -1 | grep -E "^[0-9]-.*\.[8-9][0-9]{2}\." | wc -l | tr -d ' ')

echo "   MUST (001-099):      $MUST folders"
echo "   RESULTS (100-199):   $RESULTS folders"
echo "   PROGRESS (200-299):  $PROGRESS folders"
echo "   BACKLOG (800-999):   $BACKLOG folders"
echo ""

# Show what's blocked/waiting
WAITING=$(ls -1 | grep -E "^[0-9]-.*\.7[0-9]{2}\." | wc -l | tr -d ' ')
if [ "$WAITING" -gt 0 ]; then
  echo "⏳ WAITING/BLOCKED: $WAITING folders"
  ls -1 | grep -E "^[0-9]-.*\.7[0-9]{2}\." | sed 's/^/   - /'
  echo ""
fi

# Git status check
if git rev-parse --git-dir > /dev/null 2>&1; then
  UNCOMMITTED=$(git status --short | wc -l | tr -d ' ')
  if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "🔧 UNCOMMITTED CHANGES: $UNCOMMITTED files"
    echo "   Run 'git status' to review"
    echo ""
  fi
fi

echo "💡 TIP: 'ls -1 | head -3' = instant priority check"
echo ""
