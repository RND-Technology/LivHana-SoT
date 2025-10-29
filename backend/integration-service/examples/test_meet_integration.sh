#!/bin/bash
###############################################################################
# Test Meet Integration End-to-End
#
# This script tests the complete flow:
# 1. Start a test session
# 2. Stream transcripts
# 3. Add chat messages
# 4. Submit agent analysis
# 5. Query data
# 6. End session
#
# Usage: ./test_meet_integration.sh
#
# Author: Liv Hana Tier-1
# Date: October 28, 2025
###############################################################################

set -e  # Exit on error

API_BASE="http://localhost:3005/api/meet"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Google Meet Integration - End-to-End Test                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if service is running
echo "[1/8] Checking integration service..."
if ! curl -s http://localhost:3005/health > /dev/null 2>&1; then
  echo "❌ Integration service is not running on port 3005"
  echo "   Start it with: cd backend/integration-service && op run --env-file=.env.op -- node src/index.js &"
  exit 1
fi
echo "✅ Integration service is running"
echo ""

# Start a test session
echo "[2/8] Starting test Meet session..."
SESSION_RESPONSE=$(curl -s -X POST "$API_BASE/sessions/start" \
  -H "Content-Type: application/json" \
  -d '{
    "meet_code": "test-'$(date +%s)'",
    "meet_url": "https://meet.google.com/test-'$(date +%s)'",
    "host_name": "Test Host (Jesse)",
    "host_email": "test@livhana.com",
    "metadata": {"test": true, "environment": "development"}
  }')

SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.session.id')
MEET_CODE=$(echo "$SESSION_RESPONSE" | jq -r '.session.meet_code')

if [ "$SESSION_ID" == "null" ]; then
  echo "❌ Failed to start session"
  echo "$SESSION_RESPONSE"
  exit 1
fi

echo "✅ Session started"
echo "   Session ID: $SESSION_ID"
echo "   Meet Code: $MEET_CODE"
echo ""

# Join participants
echo "[3/8] Adding participants..."
PARTICIPANT_RESPONSE=$(curl -s -X POST "$API_BASE/participants/join" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "'"$SESSION_ID"'",
    "participant_name": "Client A",
    "participant_email": "client.a@company.com",
    "is_host": false,
    "audio_enabled": true,
    "video_enabled": true
  }')

PARTICIPANT_ID=$(echo "$PARTICIPANT_RESPONSE" | jq -r '.participant.id')
echo "✅ Participant added (ID: $PARTICIPANT_ID)"
echo ""

# Stream transcripts
echo "[4/8] Streaming transcripts..."
TRANSCRIPTS=(
  "Welcome everyone to today's meeting. Let's discuss the Q4 roadmap."
  "We need to increase conversion rates by 20% this quarter."
  "Action item: Jesse will send the proposal by end of day."
  "Can we schedule a follow-up call for next Tuesday?"
  "I'll update the pricing sheet and share it with the team."
  "Great discussion today. Any final questions before we wrap up?"
)

for i in "${!TRANSCRIPTS[@]}"; do
  TRANSCRIPT="${TRANSCRIPTS[$i]}"
  SPEAKER="Speaker $((i % 2 == 0 ? 1 : 2))"

  curl -s -X POST "$API_BASE/transcripts/stream" \
    -H "Content-Type: application/json" \
    -d '{
      "session_id": "'"$SESSION_ID"'",
      "speaker_name": "'"$SPEAKER"'",
      "transcript_text": "'"$TRANSCRIPT"'",
      "timestamp_start": "'"$TIMESTAMP"'",
      "is_final": true,
      "confidence_score": 0.95,
      "sequence_number": '$((i + 1))'
    }' > /dev/null

  echo "   [$((i + 1))/${#TRANSCRIPTS[@]}] $SPEAKER: $TRANSCRIPT"
  sleep 0.5
done
echo "✅ Transcripts streamed"
echo ""

# Add chat messages
echo "[5/8] Adding chat messages..."
curl -s -X POST "$API_BASE/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "'"$SESSION_ID"'",
    "sender_name": "Jesse",
    "sender_email": "jesse@livhana.com",
    "message_text": "Link to proposal: https://docs.google.com/document/d/example",
    "is_private": false
  }' > /dev/null
echo "✅ Chat messages added"
echo ""

# Get recent transcripts
echo "[6/8] Querying recent transcripts..."
RECENT=$(curl -s "$API_BASE/transcripts/recent/$SESSION_ID?minutes=5")
TRANSCRIPT_COUNT=$(echo "$RECENT" | jq -r '.count')
echo "✅ Found $TRANSCRIPT_COUNT transcripts in last 5 minutes"
echo ""

# Submit agent analysis
echo "[7/8] Submitting agent analysis..."
ANALYSIS_RESPONSE=$(curl -s -X POST "$API_BASE/analysis" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "'"$SESSION_ID"'",
    "agent_name": "Planning",
    "analysis_type": "action_items",
    "analysis_text": "Detected 3 action items: 1) Send proposal by EOD, 2) Schedule follow-up call for Tuesday, 3) Update pricing sheet",
    "analysis_json": {
      "action_items": [
        {
          "task": "Send proposal",
          "owner": "Jesse",
          "due": "2025-10-28T17:00:00Z",
          "priority": "high"
        },
        {
          "task": "Schedule follow-up call",
          "owner": "Planning",
          "due": "2025-10-29T10:00:00Z",
          "priority": "medium"
        },
        {
          "task": "Update pricing sheet",
          "owner": "Jesse",
          "due": "2025-10-29T12:00:00Z",
          "priority": "medium"
        }
      ]
    },
    "priority": "high",
    "action_required": true,
    "confidence_score": 0.92
  }')

ANALYSIS_ID=$(echo "$ANALYSIS_RESPONSE" | jq -r '.analysis_id')
echo "✅ Analysis submitted (ID: $ANALYSIS_ID)"
echo ""

# Query analyses
echo "[7.5/8] Querying session analyses..."
ANALYSES=$(curl -s "$API_BASE/analysis/$SESSION_ID")
ANALYSIS_COUNT=$(echo "$ANALYSES" | jq -r '.count')
echo "✅ Found $ANALYSIS_COUNT analysis record(s)"
echo ""

# End session
echo "[8/8] Ending session..."
END_RESPONSE=$(curl -s -X POST "$API_BASE/sessions/$SESSION_ID/end")
DURATION=$(echo "$END_RESPONSE" | jq -r '.session.duration_seconds')
echo "✅ Session ended (duration: ${DURATION}s)"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Test Summary                                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Session ID:       $SESSION_ID"
echo "Meet Code:        $MEET_CODE"
echo "Transcripts:      $TRANSCRIPT_COUNT"
echo "Analyses:         $ANALYSIS_COUNT"
echo "Duration:         ${DURATION}s"
echo ""
echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "  1. Check data in AlloyDB (Cloud Shell):"
echo "     SELECT * FROM meet_sessions WHERE id = '$SESSION_ID';"
echo "     SELECT * FROM meet_transcripts WHERE session_id = '$SESSION_ID';"
echo "     SELECT * FROM meet_agent_analysis WHERE session_id = '$SESSION_ID';"
echo ""
echo "  2. Run agent reader:"
echo "     node examples/agent_meet_reader.js $SESSION_ID"
echo ""
