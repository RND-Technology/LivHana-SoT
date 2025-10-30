#!/bin/bash
# TEST_VOICE.sh - Quick voice mode test after fixing permissions

echo "╔══════════════════════════════════════════════════════╗"
echo "║           🎤 VOICE MODE TEST                         ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check services
echo "Checking voice services..."
echo ""

WHISPER_OK=false
KOKORO_OK=false

if curl -s http://localhost:2022/health | grep -q "ok" 2>/dev/null; then
    echo "✅ Whisper STT: HEALTHY (port 2022)"
    WHISPER_OK=true
else
    echo "❌ Whisper STT: NOT RESPONDING"
fi

if curl -s http://localhost:8880/health | grep -q "healthy" 2>/dev/null; then
    echo "✅ Kokoro TTS: HEALTHY (port 8880)"
    KOKORO_OK=true
else
    echo "❌ Kokoro TTS: NOT RESPONDING"
fi

echo ""

if [ "$WHISPER_OK" = false ] || [ "$KOKORO_OK" = false ]; then
    echo "❌ Voice services not ready. Restart them:"
    echo "   mcp__voicemode__service whisper restart"
    echo "   mcp__voicemode__service kokoro restart"
    exit 1
fi

# Check microphone input
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing microphone input..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CURRENT_INPUT=$(system_profiler SPAudioDataType 2>/dev/null | grep -A1 "Default Input Device" | tail -1 | sed 's/^[[:space:]]*//')
echo "Current input device: $CURRENT_INPUT"

if [[ "$CURRENT_INPUT" == *"AirPods"* ]] || [[ "$CURRENT_INPUT" == *"Bluetooth"* ]]; then
    echo ""
    echo "⚠️  WARNING: Still using Bluetooth device!"
    echo "   This will cause poor voice input quality."
    echo "   Run ./QUICK_VOICE_FIX.sh to fix."
    echo ""
fi

# Test with sox if available
if command -v sox &> /dev/null; then
    echo ""
    echo "Recording 3 seconds of audio..."
    echo "Say: 'Hello, this is Christopher testing voice mode'"
    echo ""

    sox -d -t wav /tmp/voice_test_$(date +%s).wav trim 0 3 2>&1

    TEST_FILE=$(ls -t /tmp/voice_test_*.wav | head -1)
    FILE_SIZE=$(stat -f%z "$TEST_FILE" 2>/dev/null || echo "0")

    if [ "$FILE_SIZE" -lt 10000 ]; then
        echo ""
        echo "❌ FAILED: Audio capture too small ($FILE_SIZE bytes)"
        echo "   Microphone permissions not granted or wrong mic selected"
        echo ""
        echo "Fix by:"
        echo "   1. Run ./QUICK_VOICE_FIX.sh"
        echo "   2. Restart terminal after granting permissions"
        exit 1
    else
        echo ""
        echo "✅ SUCCESS: Captured $(($FILE_SIZE / 1024))KB of audio"
        echo ""

        # Try to transcribe with Whisper
        echo "Testing transcription with Whisper..."
        TRANSCRIPTION=$(curl -s -X POST http://localhost:2022/v1/audio/transcriptions \
            -F "file=@$TEST_FILE" \
            -F "model=whisper-1" | jq -r '.text // empty' 2>/dev/null)

        if [ -n "$TRANSCRIPTION" ]; then
            echo "✅ Transcription: \"$TRANSCRIPTION\""
        else
            echo "⚠️  Transcription returned empty (check Whisper service)"
        fi

        rm -f "$TEST_FILE"
    fi
else
    echo "⚠️  sox not installed - skipping audio capture test"
    echo "   Install with: brew install sox"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FINAL TEST: Full voice conversation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If all checks passed, test with Claude Code:"
echo ""
echo "  mcp__voicemode__converse message=\"Hello Liv, voice mode test\""
echo ""
echo "Or use the interactive test:"
echo "  ./tests/voice/test_voice_interactive.sh"
echo ""
