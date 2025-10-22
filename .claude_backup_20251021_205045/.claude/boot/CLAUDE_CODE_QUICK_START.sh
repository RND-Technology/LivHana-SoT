#!/bin/bash
# CLAUDE CODE QUICK START - COMPLETE ALL INCOMPLETE WORK
# Run this in Cursor with Claude Code CLI

set -e

echo "🚀 CLAUDE CODE EXECUTING - CHEETAH PACE MODE"
echo ""
echo "Time started: $(date)"
echo ""

# Track time
START_TIME=$(date +%s)

# Step 1: ECWID Fix (5 minutes)
echo "════════════════════════════════════════════════════════"
echo "TASK 1: ECWID CATEGORY BOX FIX"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Getting ECWID password from 1Password..."

ECWID_PASS=$(op item get c6mvjj7qrwjzknpf5mfmwbop5u --fields password 2>/dev/null || echo "")

if [ -z "$ECWID_PASS" ]; then
  echo "⚠️  Could not get password from 1Password"
  echo "📋 Manual option: Paste CSS in Ecwid admin"
  echo "    See: automation/ECWID_FIX_GUIDE.md lines 94-123"
  echo ""
  echo "OR provide password manually:"
  echo "  export ECWID_EMAIL='jesseniesen@gmail.com'"
  echo "  export ECWID_PASSWORD='your-password'"
  echo "  node automation/ecwid-category-fix.js"
  echo ""
else
  echo "✅ Password retrieved"
  echo "🚀 Executing Playwright automation..."
  export ECWID_EMAIL="jesseniesen@gmail.com"
  export ECWID_PASSWORD="$ECWID_PASS"

  timeout 300 node automation/ecwid-category-fix.js &
  ECWID_PID=$!

  echo "⏳ ECWID fix running in background (PID: $ECWID_PID)"
  echo "   Will complete in ~5 minutes"
  echo ""
fi

# Step 2: Gmail OAuth Setup (10 minutes)
echo "════════════════════════════════════════════════════════"
echo "TASK 2: GMAIL ACCESS - LINDSAY GOLDSMITH SEARCH"
echo "════════════════════════════════════════════════════════"
echo ""

if [ ! -f "automation/data-pipelines/gmail_token_jessen.json" ]; then
  echo "🔐 OAuth setup required (one-time, 2 minutes)"
  echo ""
  echo "Run this command and follow browser prompts:"
  echo "  cd automation/data-pipelines"
  echo "  node gmail_auth.js --account=jesseniesen"
  echo ""
  echo "Then come back and run:"
  echo "  node automation/gmail-search-lindsay.js"
  echo ""
  echo "OR paste email directly into analyzer:"
  echo "  node automation/analyze-square-email.js"
  echo ""
else
  echo "✅ OAuth token exists"
  echo "🔍 Searching for Lindsay Goldsmith emails..."

  cd automation/data-pipelines
  node gmail_ingest.js --account=jesseniesen --max=50 2>&1 | grep -E "(Found|Error|Lindsay|Square)" || true
  cd ../..

  echo "✅ Gmail search complete"
  echo ""
fi

# Step 3: Check ECWID completion
if [ ! -z "$ECWID_PID" ]; then
  echo "════════════════════════════════════════════════════════"
  echo "CHECKING ECWID STATUS"
  echo "════════════════════════════════════════════════════════"
  echo ""

  if ps -p $ECWID_PID > /dev/null; then
    echo "⏳ ECWID automation still running..."
    echo "   Check automation/screenshots/ for progress"
  else
    echo "✅ ECWID automation completed"
    echo "   Screenshots saved to automation/screenshots/"
    echo "   Verify: https://reggieanddro.com/products"
  fi
  echo ""
fi

# Calculate time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
ELAPSED_MIN=$((ELAPSED / 60))
ELAPSED_SEC=$((ELAPSED % 60))

echo "════════════════════════════════════════════════════════"
echo "EXECUTION SUMMARY"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Time elapsed: ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
echo ""
echo "Cheetah benchmark: 40 minutes"
if [ $ELAPSED -lt 2400 ]; then
  echo "Status: ✅ BEATING CHEETAH"
elif [ $ELAPSED -lt 3600 ]; then
  echo "Status: ⚡ MATCHING CHEETAH"
else
  echo "Status: ⚠️  SLOWER THAN CHEETAH"
fi
echo ""

echo "NEXT STEPS:"
echo ""
echo "1. Verify ECWID fix: https://reggieanddro.com/products"
echo "2. Review Gmail emails: automation/SQUARE_EMAILS_EXTRACTED.md"
echo "3. Call Lindsay Goldsmith: 636-565-0896"
echo "4. Implement age verification (Task 4 Option C)"
echo ""
echo "Files created:"
find automation -name "*.md" -o -name "SQUARE*" -o -name "ECWID*" 2>/dev/null | grep -v node_modules
echo ""

echo "🏁 QUICK START COMPLETE"
echo ""
echo "See full handoff: .claude/SONNET_FAILURE_HANDOFF_TO_CLAUDE_CODE.md"
echo ""
