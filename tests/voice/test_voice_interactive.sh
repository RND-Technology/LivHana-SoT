#!/bin/bash
# VOICE-TEST-003: Interactive Voice Mode Conversation Test
# Created: 2025-10-27
# Purpose: Real-world interactive voice conversation testing

set -e

echo "=== VOICE MODE INTERACTIVE TEST ==="
echo "Timestamp: $(date)"
echo ""

echo "This test will have a natural conversation with you."
echo "It will ask you questions and listen for your responses."
echo ""
read -p "Press ENTER when ready..."

# Test Conversation 1: Simple Q&A
echo ""
echo "[CONVERSATION 1] Simple Question"
mcp__voicemode__converse "Hello! Can you tell me your name?" wait_for_response=true listen_duration_max=20 listen_duration_min=1

echo ""
echo "Waiting 2 seconds..."
sleep 2

# Test Conversation 2: Extended Response
echo ""
echo "[CONVERSATION 2] Extended Response"
mcp__voicemode__converse "Great! Now tell me about what you're working on today. Take your time." wait_for_response=true listen_duration_max=60 listen_duration_min=2

echo ""
echo "Waiting 2 seconds..."
sleep 2

# Test Conversation 3: Quick Confirmation
echo ""
echo "[CONVERSATION 3] Quick Confirmation"
mcp__voicemode__converse "Perfect! Just say yes or no - is voice mode working well for you?" wait_for_response=true listen_duration_max=15 listen_duration_min=1

echo ""
echo "=== INTERACTIVE TEST COMPLETE ==="
echo "If you were able to have natural conversations, voice mode is fully operational!"
echo ""
echo "Next steps:"
echo "1. Integrate voice mode into your workflow"
echo "2. Test with different voice commands"
echo "3. Experiment with speed and voice parameters"
