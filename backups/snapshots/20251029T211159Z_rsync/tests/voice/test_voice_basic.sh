#!/bin/bash
# VOICE-TEST-001: Basic Voice Mode Functionality Test
# Created: 2025-10-27
# Purpose: Verify core voice mode operations and service health

set -e

echo "=== VOICE MODE BASIC TEST SUITE ==="
echo "Timestamp: $(date)"
echo ""

# Test 1: Service Health Check
echo "[TEST 1] Service Health Check"
echo "Checking Whisper service..."
whisper_status=$(mcp__voicemode__service whisper status 2>&1 || echo "FAILED")
echo "$whisper_status"

echo ""
echo "Checking Kokoro service..."
kokoro_status=$(mcp__voicemode__service kokoro status 2>&1 || echo "FAILED")
echo "$kokoro_status"

# Test 2: Simple TTS Test (no microphone needed)
echo ""
echo "[TEST 2] Text-to-Speech Test (No Microphone)"
echo "Testing TTS without listening for response..."
tts_result=$(mcp__voicemode__converse "This is a test of the text to speech system. If you can hear this, TTS is working." wait_for_response=false 2>&1 || echo "TTS_FAILED")
echo "$tts_result"

# Test 3: Service Logs Check
echo ""
echo "[TEST 3] Recent Service Logs"
echo "Last 10 lines of Whisper logs:"
whisper_logs=$(mcp__voicemode__service whisper logs lines=10 2>&1 || echo "LOG_FAILED")
echo "$whisper_logs"

echo ""
echo "Last 10 lines of Kokoro logs:"
kokoro_logs=$(mcp__voicemode__service kokoro logs lines=10 2>&1 || echo "LOG_FAILED")
echo "$kokoro_logs"

# Summary
echo ""
echo "=== TEST SUMMARY ==="
echo "Test 1 (Service Health): $(echo "$whisper_status" | grep -q "running" && echo "✓ PASS" || echo "✗ FAIL")"
echo "Test 2 (TTS Only): $(echo "$tts_result" | grep -q "TTS_FAILED" && echo "✗ FAIL" || echo "✓ PASS")"
echo "Test 3 (Logs): $(echo "$whisper_logs" | grep -q "LOG_FAILED" && echo "✗ FAIL" || echo "✓ PASS")"
echo ""
echo "=== NEXT STEP ==="
echo "If services are running but TTS fails, check microphone permissions."
echo "Run: test_voice_permissions.sh"
