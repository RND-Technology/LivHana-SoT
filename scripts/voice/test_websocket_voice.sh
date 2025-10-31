#!/usr/bin/env bash
# Quick WebSocket Voice Connection Test
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 WebSocket Voice-to-Claude - Connection Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BASE_URL="${BASE_URL:-http://localhost:8080}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Service Health Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check voice service
echo ""
echo -n "Voice Service: "
if curl -s -f "$BASE_URL/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Running${NC}"

  # Get feature flags
  features=$(curl -s "$BASE_URL/health" | jq -r '.features')
  echo ""
  echo "Features:"
  echo "$features" | jq -r 'to_entries[] | "  \(.key): \(.value)"'

  # Check critical features
  has_websocket=$(echo "$features" | jq -r '.webSocketVoice')
  has_claude=$(echo "$features" | jq -r '.claude')

  echo ""
  if [[ "$has_websocket" == "true" ]]; then
    echo -e "${GREEN}✅ WebSocket Voice: Enabled${NC}"
  else
    echo -e "${RED}❌ WebSocket Voice: Disabled${NC}"
  fi

  if [[ "$has_claude" == "true" ]]; then
    echo -e "${GREEN}✅ Claude API: Configured${NC}"
  else
    echo -e "${YELLOW}⚠️  Claude API: Not configured (ANTHROPIC_API_KEY not set)${NC}"
    echo ""
    echo "To enable Claude API:"
    echo "  1. Get API key from: https://console.anthropic.com/"
    echo "  2. Add to .env: ANTHROPIC_API_KEY=your_key_here"
    echo "  3. Restart services: bash STOP.sh && bash START.sh"
  fi

else
  echo -e "${RED}❌ Not running${NC}"
  echo ""
  echo "Start the voice service first:"
  echo "  bash START.sh"
  exit 1
fi

# Check WebSocket stats endpoint
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. WebSocket Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -n "WebSocket Stats Endpoint: "
if stats=$(curl -s -f "$BASE_URL/api/voice/websocket/stats" 2>/dev/null); then
  echo -e "${GREEN}✅ Available${NC}"

  active_sessions=$(echo "$stats" | jq -r '.active_sessions | length')
  echo ""
  echo "Active WebSocket Sessions: $active_sessions"

  if [[ $active_sessions -gt 0 ]]; then
    echo ""
    echo "Session Details:"
    echo "$stats" | jq -r '.active_sessions[]'
  fi
else
  echo -e "${YELLOW}⚠️  Not available${NC}"
fi

# Check optional services
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Optional Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -n "Whisper Service: "
if curl -s -f http://localhost:9000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Running (port 9000)${NC}"
  whisper_status=$(curl -s http://localhost:9000/health | jq -r '.status')
  echo "  Status: $whisper_status"
else
  echo -e "${YELLOW}⚠️  Not running (will use OpenAI Whisper as fallback)${NC}"
  echo ""
  echo "To install and start Whisper:"
  echo "  bash scripts/voice/install_whisper.sh"
  echo "  bash scripts/voice/start_whisper_service.sh"
fi

echo ""
echo -n "Vocode Service: "
if curl -s -f http://localhost:9001/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Running (port 9001)${NC}"
  vocode_status=$(curl -s http://localhost:9001/health | jq -r '.status')
  echo "  Status: $vocode_status"
else
  echo -e "${YELLOW}⚠️  Not running (will use OpenAI TTS as fallback)${NC}"
  echo ""
  echo "To install and start Vocode:"
  echo "  bash scripts/voice/install_vocode.sh"
  echo "  bash scripts/voice/start_vocode_service.sh"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Ready to Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -e "${BLUE}WebSocket URL:${NC} ws://localhost:8080/ws/voice"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "  1. Open browser test client:"
echo "     open backend/voice-service/public/voice-to-claude.html"
echo ""
echo "  2. Or serve it via HTTP:"
echo "     cd backend/voice-service/public"
echo "     python3 -m http.server 8000"
echo "     open http://localhost:8000/voice-to-claude.html"
echo ""
echo "  3. Click 'Connect' and 'Start Recording'"
echo "  4. Start talking to Claude! 🔥"
echo ""

if [[ "$has_claude" != "true" ]]; then
  echo -e "${YELLOW}⚠️  IMPORTANT: Set ANTHROPIC_API_KEY to enable Claude API${NC}"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ System Check Complete${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
