#!/usr/bin/env bash
# Test Custom Voice System End-to-End
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 Custom Voice System - End-to-End Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BASE_URL="${BASE_URL:-http://localhost:8080}"
VOICE_API="$BASE_URL/api/voice/custom"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"

  echo ""
  echo "Testing: $name"
  echo "────────────────────────────────────────────────────────────────"

  local start=$(date +%s%3N)

  if [[ "$method" == "GET" ]]; then
    response=$(curl -s -w "\n%{http_code}" "$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  local end=$(date +%s%3N)
  local latency=$((end - start))

  local body=$(echo "$response" | head -n -1)
  local status=$(echo "$response" | tail -n 1)

  if [[ "$status" =~ ^2 ]]; then
    echo -e "${GREEN}✅ PASS${NC} - HTTP $status - ${latency}ms"
    echo "Response: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body")"
    PASSED=$((PASSED + 1))
    echo "$body"
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} - HTTP $status - ${latency}ms"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# 1. Health Checks
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Health Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Voice Service Health" "GET" "$BASE_URL/health" ""
test_endpoint "Whisper Service Health" "GET" "http://localhost:9000/health" "" || \
  echo -e "${YELLOW}⚠️  Whisper not running (optional)${NC}"
test_endpoint "Vocode Service Health" "GET" "http://localhost:9001/health" "" || \
  echo -e "${YELLOW}⚠️  Vocode not running (optional)${NC}"

# 2. Create Session
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Session Management"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

session_response=$(test_endpoint "Create Voice Session" "POST" "$VOICE_API/session" '{
  "voice_config": {
    "voice_id": "default",
    "stability": 0.75,
    "speed": 1.0
  },
  "system_prompt": "You are a helpful AI assistant. Be concise."
}')

SESSION_ID=$(echo "$session_response" | jq -r '.session_id' 2>/dev/null || echo "")

if [[ -n "$SESSION_ID" && "$SESSION_ID" != "null" ]]; then
  echo -e "${GREEN}✅ Session created: $SESSION_ID${NC}"

  # Get session status
  test_endpoint "Get Session Status" "GET" "$VOICE_API/session/$SESSION_ID" ""

  # 3. Reasoning Test
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "3. ChatGPT Reasoning"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  reason_response=$(test_endpoint "Get AI Response" "POST" "$VOICE_API/reason" "{
    \"message\": \"Say exactly: Hello from custom voice system!\",
    \"session_id\": \"$SESSION_ID\",
    \"stream\": false
  }")

  AI_RESPONSE=$(echo "$reason_response" | jq -r '.response' 2>/dev/null || echo "")

  if [[ -n "$AI_RESPONSE" && "$AI_RESPONSE" != "null" ]]; then
    echo -e "${GREEN}AI Response: \"$AI_RESPONSE\"${NC}"

    # 4. Voice Config Update
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "4. Voice Configuration"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    test_endpoint "Update Voice Config" "POST" "$VOICE_API/config" "{
      \"session_id\": \"$SESSION_ID\",
      \"voice_config\": {
        \"speed\": 1.2,
        \"pitch\": 0.9,
        \"stability\": 0.8
      }
    }"

    # 5. Interruption Test
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "5. Interruption Control"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    test_endpoint "Interrupt Speech" "POST" "$VOICE_API/interrupt" "{
      \"session_id\": \"$SESSION_ID\"
    }"

    # 6. Stats
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "6. System Statistics"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    test_endpoint "Get System Stats" "GET" "$VOICE_API/stats" ""

    # 7. Cleanup
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "7. Cleanup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    test_endpoint "Delete Session" "DELETE" "$VOICE_API/session/$SESSION_ID" ""
  fi
else
  echo -e "${RED}❌ Failed to create session${NC}"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [[ $FAILED -eq 0 ]]; then
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ ALL TESTS PASSED! Custom Voice System Ready!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # WebSocket Test Information
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🚀 WebSocket Streaming Test"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "To test WebSocket streaming:"
  echo "  1. Open browser to: http://localhost:8080/websocket-test-client.html"
  echo "  2. Click 'Connect' button"
  echo "  3. Hold '🎤 Hold to Talk' button and speak"
  echo "  4. Release button to process"
  echo "  5. Listen to Liv Hana's response!"
  echo ""
  echo "WebSocket URL: ws://localhost:8080/api/voice/custom/ws/{sessionId}"
  echo ""
  echo "Features:"
  echo "  ✅ Real-time audio streaming (no base64 REST API delays)"
  echo "  ✅ Bidirectional communication (talk while listening)"
  echo "  ✅ True interruption support (mid-sentence)"
  echo "  ✅ Live performance metrics display"
  echo "  ✅ Visual waveform feedback"
  echo ""
  
  exit 0
else
  echo ""
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ Some tests failed. Check output above.${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
fi

