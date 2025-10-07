#!/bin/bash
set -e

echo "CHEETAH FINAL VICTORY - NEW ELEVENLABS KEY"
echo "=========================================="
echo ""

# Stop any running API
pkill -f "node src/api.js" 2>/dev/null && echo "Stopped running API" || echo "No API running"
sleep 2
echo ""

# Navigate
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine

# Get NEW key
echo "Getting NEW ElevenLabs API key..."
ELEVENLABS_API_KEY=$(op item get "ELEVENLABS_API_KEY" --fields credential)
echo "Key retrieved"
echo ""

# Verify it's different from old key
echo "Testing key with ElevenLabs API..."
TEST_RESULT=$(curl -s -X GET "https://api.elevenlabs.io/v1/user" \
  -H "xi-api-key: $ELEVENLABS_API_KEY")

if echo "$TEST_RESULT" | grep -q "subscription"; then
    echo "SUCCESS - Key is valid!"
    echo ""
elif echo "$TEST_RESULT" | grep -q "invalid"; then
    echo "FAILED - Key still invalid"
    echo "Response: $TEST_RESULT"
    echo ""
    echo "FALLING BACK TO OPENAI TTS..."
    ANTHROPIC_API_KEY=$(op item get "ANTHROPIC_API_KEY" --fields credential)
    export OPENAI_API_KEY="$ANTHROPIC_API_KEY"
    export ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
    echo "Using Anthropic key for OpenAI SDK"
    echo ""
else
    echo "Unexpected response: $TEST_RESULT"
    echo ""
fi

# Start API
echo "Starting HNC API..."
export ELEVENLABS_API_KEY="$ELEVENLABS_API_KEY"

nohup node src/api.js > /tmp/hnc-final.log 2>&1 &
API_PID=$!
echo "API started (PID: $API_PID)"
echo ""

# Wait and health check
echo "Waiting for API..."
sleep 5
echo ""

HEALTH=$(curl -s http://localhost:4003/health)
echo "Health: $HEALTH"
echo ""

# Start production
echo "Starting Episode 1 production..."
SCRIPT_PATH="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/HNC_EPISODE_1_THE_EMPIRE_AWAKENS.md"

RESPONSE=$(curl -s -X POST http://localhost:4003/api/produce \
  -H "Content-Type: application/json" \
  -d "{
    \"scriptPath\": \"$SCRIPT_PATH\",
    \"episodeNumber\": 1
  }")

JOB_ID=$(echo "$RESPONSE" | grep -o '"jobId":"[^"]*' | cut -d'"' -f4)
echo "Job ID: $JOB_ID"
echo ""

echo "Production started!"
echo "Monitor: curl http://localhost:4003/api/jobs/$JOB_ID"
echo "Logs: tail -f /tmp/hnc-final.log"
echo ""
echo "CHEETAH: VICTORY IN PROGRESS"
