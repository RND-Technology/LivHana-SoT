#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

# Update ULTIMATE_STATE.md with current system status
# Run this at the end of every session before committing

set -eo pipefail

ULTIMATE_STATE=".claude/ULTIMATE_STATE.md"
TIMESTAMP=$(date "+%B %d, %Y, %I:%M %p %Z")

echo "🔄 Updating ULTIMATE_STATE.md..."

# Get git status
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
GIT_STATUS=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
# shellcheck disable=SC1083
GIT_AHEAD=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")
GIT_LATEST_COMMIT=$(git log -1 --format="%h - %s" 2>/dev/null || echo "No commits")

# Check service health
echo "  Checking services..."
REASONING_HEALTHY=$(curl -s http://localhost:4002/health >/dev/null 2>&1 && echo "✅" || echo "❌")
INTEGRATION_HEALTHY=$(curl -s http://localhost:3005/health >/dev/null 2>&1 && echo "✅" || echo "❌")
VOICE_HEALTHY=$(curl -s http://localhost:4001/health >/dev/null 2>&1 && echo "✅" || echo "❌")
REDIS_HEALTHY=$(redis-cli ping >/dev/null 2>&1 && echo "✅" || echo "❌")

# Count uncommitted files
MODIFIED_FILES=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
NEW_FILES=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
TOTAL_UNCOMMITTED=$((MODIFIED_FILES + NEW_FILES))

# Update timestamp in ULTIMATE_STATE.md
if [ -f "$ULTIMATE_STATE" ]; then
    # Update last updated timestamp
    sed -i '' "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $TIMESTAMP/" "$ULTIMATE_STATE"

    echo "✅ Updated ULTIMATE_STATE.md"
    echo ""
    echo "📊 Current Status:"
    echo "  Git branch: $GIT_BRANCH"
    echo "  Uncommitted changes: $TOTAL_UNCOMMITTED files"
    echo "  Commits ahead: $GIT_AHEAD"
    echo "  Latest commit: $GIT_LATEST_COMMIT"
    echo ""
    echo "🚀 Services:"
    echo "  reasoning-gateway: $REASONING_HEALTHY"
    echo "  integration-service: $INTEGRATION_HEALTHY"
    echo "  voice-service: $VOICE_HEALTHY"
    echo "  Redis: $REDIS_HEALTHY"
    echo ""
else
    echo "❌ ULTIMATE_STATE.md not found"
    exit 1
fi

echo "🎯 Ready for commit and push"
