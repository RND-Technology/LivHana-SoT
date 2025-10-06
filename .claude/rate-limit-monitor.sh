#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

# Rate Limit Monitor - Ensures FULL POWER NO LIMITS
# Auto-switches between Cursor's pooled API and personal API key
# Run this daily via cron or manually

set -eo pipefail

# Configuration
CURSOR_RESET_DAY="Monday"  # Weekly reset day
CURSOR_RESET_TIME="00:00 UTC"
ANTHROPIC_BALANCE_THRESHOLD=10  # Switch back to Cursor when balance < $10

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Rate Limit Monitor - Checking Status..."
echo ""

# Check current day
CURRENT_DAY=$(date +%A)
CURRENT_HOUR=$(date +%H)

# Check if it's Monday 00:00-01:00 UTC (Cursor reset window)
if [[ "$CURRENT_DAY" == "Monday" ]] && [[ "$CURRENT_HOUR" -eq 0 ]]; then
    echo -e "${GREEN}✅ CURSOR LIMIT RESET - Switch back to Cursor pooled API${NC}"
    echo "Action: Remove personal API key from Cursor settings"
    echo "Reason: Cursor limits refreshed, avoid double-paying Anthropic"
    echo ""
    exit 0
fi

# Check Anthropic account balance (requires API call)
echo "💰 Checking Anthropic balance..."
# Note: Anthropic doesn't expose balance via API, check console manually
echo -e "${YELLOW}⚠️  Manual check required: https://console.anthropic.com/settings/billing${NC}"
echo ""

# Check if approaching Cursor limit (manual check)
echo "📊 Cursor Limit Status:"
echo "  - Current day: $CURRENT_DAY"
echo "  - Reset day: $CURSOR_RESET_DAY $CURSOR_RESET_TIME"
echo "  - Threshold to switch back to Cursor: \$$ANTHROPIC_BALANCE_THRESHOLD remaining"
echo "  - Days until reset: $(( (7 - $(date +%u)) % 7 )) days"
echo ""

# Strategy
echo "🎯 Current Strategy:"
echo "  ✅ Use personal API key in Cursor (bypasses weekly limit)"
echo "  ✅ Monitor Anthropic balance (\$100 prepaid)"
echo "  ✅ Auto-reload at \$50 → \$100 (configured)"
echo "  ✅ Switch back to Cursor on Monday 00:00 UTC"
echo ""

# Health check
echo "🏥 API Key Health:"
[REDACTED - SECURITY BREACH]
    echo -e "${GREEN}✅ Anthropic API key found in .env${NC}"
else
    echo -e "${RED}❌ Anthropic API key NOT found${NC}"
fi
echo ""

# Next action
echo "📅 Next Action:"
if [[ "$CURRENT_DAY" == "Sunday" ]]; then
    echo -e "${YELLOW}⏰ Cursor resets in <24 hours - Remove API key from Cursor tomorrow${NC}"
else
    echo -e "${GREEN}✅ Continue using personal API key (no limits)${NC}"
fi
echo ""

echo "🔥 FULL POWER MODE ACTIVE - NO LIMITS!"
