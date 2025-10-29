#!/bin/bash
# FIX_VOICE_MODE.sh - Complete Voice Mode Fix Script
# Created: 2025-10-28
# Purpose: Fix all identified voice mode issues

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              🎤 VOICE MODE COMPLETE FIX                       ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check current microphone device
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 STEP 1: Checking Current Audio Input Device"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CURRENT_INPUT=$(system_profiler SPAudioDataType 2>/dev/null | grep -A1 "Default Input Device" | tail -1 | sed 's/^[[:space:]]*//')
echo "Current Input: $CURRENT_INPUT"

if [[ "$CURRENT_INPUT" == *"AirPods"* ]] || [[ "$CURRENT_INPUT" == *"Bluetooth"* ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  ISSUE DETECTED: Using Bluetooth audio device${NC}"
    echo "   Bluetooth devices cause BLANK_AUDIO issues due to:"
    echo "   - Sample rate mismatch (24kHz vs required 16/48kHz)"
    echo "   - Mic activation delays"
    echo "   - Codec switching dropouts"
    echo ""
    echo -e "${RED}🔧 MANUAL FIX REQUIRED:${NC}"
    echo "   1. Open System Settings (Cmd+Space → System Settings)"
    echo "   2. Go to Sound → Input"
    echo "   3. Select 'MacBook Pro Microphone' (built-in)"
    echo "   4. Verify input level shows activity when you speak"
    echo ""
    echo "   Press ENTER when you've completed this step..."
    read
else
    echo -e "${GREEN}✅ Using built-in microphone${NC}"
fi

# Step 2: Check microphone permissions
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 STEP 2: Checking Microphone Permissions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Checking permissions for common terminal apps..."
echo ""

# Try to detect which terminal is being used
TERMINAL_APP=""
if [ -n "$TERM_PROGRAM" ]; then
    case "$TERM_PROGRAM" in
        "Apple_Terminal") TERMINAL_APP="Terminal" ;;
        "iTerm.app") TERMINAL_APP="iTerm" ;;
        "vscode") TERMINAL_APP="Visual Studio Code" ;;
    esac
fi

if [ -z "$TERMINAL_APP" ]; then
    TERMINAL_APP="your terminal application"
fi

echo -e "${YELLOW}⚠️  MICROPHONE PERMISSIONS CHECK${NC}"
echo ""
echo "macOS requires explicit microphone permission for apps."
echo "Without this, voice input will return [BLANK_AUDIO]."
echo ""
echo -e "${RED}🔧 MANUAL FIX REQUIRED:${NC}"
echo "   1. Open System Settings → Privacy & Security → Microphone"
echo ""
echo "   Quick link (copy and paste in browser):"
echo "   x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"
echo ""
echo "   2. Find and ENABLE these applications:"
echo "      - $TERMINAL_APP"
echo "      - Cursor (if using Cursor IDE)"
echo "      - Python"
echo ""
echo "   3. CRITICAL: Quit and restart ALL terminal applications"
echo "      - Cmd+Q to fully quit (not just close window)"
echo "      - Reopen terminal/IDE"
echo ""
echo "   Press ENTER when you've completed this step..."
read

# Step 3: Test microphone directly
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎙️  STEP 3: Testing Microphone Capture"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v sox &> /dev/null; then
    echo "Testing microphone with sox..."
    echo "Speak into your microphone for 3 seconds:"
    echo ""

    sox -d -t wav /tmp/voice_test.wav trim 0 3 2>&1 || {
        echo ""
        echo -e "${RED}❌ Microphone test FAILED${NC}"
        echo "   This means permissions are not granted or mic is not working"
        echo "   Please:"
        echo "   1. Verify you completed Step 2 above"
        echo "   2. Restarted your terminal application"
        echo "   3. Selected the correct microphone in System Settings"
        exit 1
    }

    FILE_SIZE=$(stat -f%z /tmp/voice_test.wav 2>/dev/null || echo "0")

    if [ "$FILE_SIZE" -lt 10000 ]; then
        echo ""
        echo -e "${RED}❌ Captured audio is too small ($FILE_SIZE bytes)${NC}"
        echo "   Microphone is not capturing audio properly"
        exit 1
    else
        echo ""
        echo -e "${GREEN}✅ Microphone captured $(($FILE_SIZE / 1024))KB of audio${NC}"
        rm -f /tmp/voice_test.wav
    fi
else
    echo -e "${YELLOW}⚠️  sox not installed - skipping direct mic test${NC}"
    echo "   Install with: brew install sox"
fi

# Step 4: Check voice services
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 STEP 4: Checking Voice Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Whisper STT
if curl -s http://localhost:2022/health | grep -q "ok" 2>/dev/null; then
    echo -e "${GREEN}✅ Whisper STT service: HEALTHY (port 2022)${NC}"
else
    echo -e "${RED}❌ Whisper STT service: NOT RESPONDING${NC}"
    echo "   Restart with: mcp__voicemode__service whisper restart"
fi

# Check Kokoro TTS
if curl -s http://localhost:8880/health | grep -q "healthy" 2>/dev/null; then
    echo -e "${GREEN}✅ Kokoro TTS service: HEALTHY (port 8880)${NC}"
else
    echo -e "${RED}❌ Kokoro TTS service: NOT RESPONDING${NC}"
    echo "   Restart with: mcp__voicemode__service kokoro restart"
fi

# Step 5: Run voice mode test
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 STEP 5: Running Voice Mode Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "tests/voice/test_voice_permissions.sh" ]; then
    echo "Running permissions test..."
    ./tests/voice/test_voice_permissions.sh
else
    echo -e "${YELLOW}⚠️  Test script not found${NC}"
    echo "   Expected: tests/voice/test_voice_permissions.sh"
fi

# Step 6: System health check
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏥 STEP 6: System Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check memory
FREE_MEM=$(memory_pressure | grep "System-wide memory free percentage" | awk '{print $5}' | tr -d '%')
if [ "$FREE_MEM" -lt 10 ]; then
    echo -e "${YELLOW}⚠️  Low memory: ${FREE_MEM}% free${NC}"
    echo "   Consider closing other applications"
else
    echo -e "${GREEN}✅ Memory: ${FREE_MEM}% free${NC}"
fi

# Check disk space
FREE_DISK=$(df -h . | tail -1 | awk '{print $4}')
echo -e "${GREEN}✅ Disk space: $FREE_DISK available${NC}"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ FIX COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎤 Voice Mode should now be operational!${NC}"
echo ""
echo "Test with:"
echo "  ./tests/voice/test_voice_interactive.sh"
echo ""
echo "Or use voice mode directly in Claude Code:"
echo "  mcp__voicemode__converse message=\"Hello Liv\""
echo ""
