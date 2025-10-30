#!/usr/bin/env bash
# 💬 Slack Integration Smoke Test
# Liv Hana | Notification Layer Validation
# Tests Slack webhook connectivity and message delivery

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$ROOT/logs/slack_smoke_$(date +%Y%m%d_%H%M%S).log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

printf "\n${BOLD}${CYAN}💬 SLACK SMOKE TEST${NC}\n"
printf "${CYAN}═══════════════════════════════════════════${NC}\n\n"

# Check for Slack webhook URL
if [[ -z "${SLACK_WEBHOOK_URL:-}" ]]; then
  printf "${YELLOW}⚠️  SLACK_WEBHOOK_URL not set${NC}\n"
  printf "${CYAN}Set via: export SLACK_WEBHOOK_URL='https://hooks.slack.com/...'${NC}\n"
  printf "${YELLOW}Or load from 1Password/Secret Manager${NC}\n\n"
  WEBHOOK_STATUS="not_configured"
else
  printf "${GREEN}✅ SLACK_WEBHOOK_URL configured${NC}\n"
  WEBHOOK_STATUS="configured"
fi

# Test message payload
TEST_MESSAGE=$(cat <<EOF
{
  "text": "🧪 Slack Smoke Test - $(date '+%Y-%m-%d %H:%M:%S')",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🎼 Liv Hana Tier-1 Smoke Test*\n\nSlack integration operational."
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Environment: $(hostname) | Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
        }
      ]
    }
  ]
}
EOF
)

printf "\n${CYAN}📨 Test payload prepared${NC}\n"
echo "$TEST_MESSAGE" | tee -a "$LOG_FILE"
echo ""

if [[ "$WEBHOOK_STATUS" == "configured" ]]; then
  printf "${CYAN}🔄 Sending test message to Slack...${NC}\n"

  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H 'Content-type: application/json' \
    --data "$TEST_MESSAGE" \
    "$SLACK_WEBHOOK_URL")

  if [[ "$RESPONSE" == "200" ]]; then
    printf "${GREEN}✅ Slack message delivered (HTTP 200)${NC}\n"
    log "SUCCESS: Slack smoke test passed"
    exit 0
  else
    printf "${RED}❌ Slack delivery failed (HTTP $RESPONSE)${NC}\n"
    log "FAILURE: Slack smoke test failed (HTTP $RESPONSE)"
    exit 1
  fi
else
  printf "${YELLOW}⚠️  SCAFFOLD MODE - Webhook not configured${NC}\n"
  printf "${CYAN}This script will validate:${NC}\n"
  echo "  • Webhook URL configuration"
  echo "  • Message payload formatting"
  echo "  • Delivery confirmation"
  echo "  • Error handling"
  echo ""
  printf "${GREEN}✅ Smoke test scaffold ready${NC}\n"
  printf "${CYAN}Configure SLACK_WEBHOOK_URL to run full test${NC}\n\n"
  log "Smoke test scaffold executed (webhook not configured)"
  exit 0
fi
