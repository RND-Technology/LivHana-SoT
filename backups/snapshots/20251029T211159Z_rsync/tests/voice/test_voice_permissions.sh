#!/bin/bash
# VOICE-TEST-002: Voice Permissions Verification Test
# Created: 2025-10-27
# Purpose: Test microphone access and full voice mode with STT

set -e

echo "=== VOICE MODE PERMISSIONS TEST ==="
echo "Timestamp: $(date)"
echo ""

echo "[PREREQUISITE CHECK]"
echo "This test requires:"
echo "1. Microphone permissions granted to terminal/application"
echo "2. Both Whisper and Kokoro services running"
echo ""
read -p "Press ENTER to continue or Ctrl+C to abort..."

# Test 1: Check system permissions
echo ""
echo "[TEST 1] System Permission Check"
echo "Checking if microphone access is available..."

# macOS specific check
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detected macOS - checking TCC database..."
    # Check if terminal has microphone access
    tcc_check=$(sqlite3 ~/Library/Application\ Support/com.apple.TCC/TCC.db "SELECT service, client, auth_value FROM access WHERE service='kTCCServiceMicrophone';" 2>&1 || echo "UNABLE_TO_CHECK")
    echo "$tcc_check"
fi

# Test 2: Full Voice Mode Test (TTS + STT)
echo ""
echo "[TEST 2] Full Voice Mode Test (TTS + STT)"
echo "This will speak a prompt and wait for your response..."
echo "When you hear the prompt, speak clearly into your microphone."
echo ""
read -p "Press ENTER to start voice test..."

echo "Starting voice conversation..."
voice_result=$(mcp__voicemode__converse "Please say 'voice mode is working' so I can verify the microphone is functioning correctly." wait_for_response=true listen_duration_max=30 listen_duration_min=1 2>&1 || echo "VOICE_FAILED")
echo ""
echo "Voice Result:"
echo "$voice_result"

# Test 3: STT-specific test
echo ""
echo "[TEST 3] Speech-to-Text Verification"
if echo "$voice_result" | grep -qi "voice mode"; then
    echo "✓ STT appears to be working - detected speech input"
else
    echo "✗ STT may not be working - no clear speech detected"
    echo "Possible issues:"
    echo "  - Microphone permissions not granted"
    echo "  - Wrong microphone selected"
    echo "  - Whisper service not running properly"
fi

# Summary
echo ""
echo "=== TEST SUMMARY ==="
echo "System Permissions: $(echo "$tcc_check" | grep -q "UNABLE" && echo "⚠ Unable to verify" || echo "✓ Checked")"
echo "Full Voice Mode: $(echo "$voice_result" | grep -q "VOICE_FAILED" && echo "✗ FAIL" || echo "✓ PASS")"
echo "STT Detection: $(echo "$voice_result" | grep -qi "voice mode" && echo "✓ PASS" || echo "✗ FAIL")"
echo ""
echo "=== TROUBLESHOOTING ==="
if echo "$voice_result" | grep -q "VOICE_FAILED" || ! echo "$voice_result" | grep -qi "voice mode"; then
    echo "If test failed, try these steps:"
    echo "1. Open System Settings → Privacy & Security → Microphone"
    echo "2. Ensure your terminal application is listed and enabled"
    echo "3. Restart the terminal after granting permissions"
    echo "4. Verify services are running: mcp__voicemode__service whisper status"
    echo "5. Check service logs: mcp__voicemode__service whisper logs"
fi
