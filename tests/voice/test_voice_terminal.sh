#!/usr/bin/env bash
# filepath: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tests/voice/test_voice_terminal.sh
# Terminal-compatible voice mode test (no MCP required)
# Version: 1.6.3.2

set -euo pipefail

echo "╔══════════════════════════════════════════════════════╗"
echo "║  🎤 VOICE MODE TERMINAL TEST                         ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check voice services
echo "Checking voice services..."
if ! nc -z localhost 2022 2>/dev/null; then
    echo "❌ Whisper STT not running (port 2022)"
    echo "   Start with: ./START.sh"
    exit 1
fi

if ! nc -z localhost 8880 2>/dev/null; then
    echo "❌ Kokoro TTS not running (port 8880)"
    echo "   Start with: ./START.sh"
    exit 1
fi

echo "✅ Whisper STT: HEALTHY (port 2022)"
echo "✅ Kokoro TTS: HEALTHY (port 8880)"
echo ""

# Test STT via direct HTTP call
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Whisper STT Direct API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create test audio
python3 - << 'PYPYTHON'
import wave
test_file = "/tmp/livhana_voice_test.wav"
with wave.open(test_file, "w") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(16000)
    w.writeframes(b"\0" * 32000)
print(f"Created test audio: {test_file}")
PYPYTHON

echo ""
echo "Testing Whisper API..."
RESPONSE=$(curl -s -X POST "http://localhost:2022/v1/audio/transcriptions" \
    -F "model=whisper-1" \
    -F "file=@/tmp/livhana_voice_test.wav" || echo "ERROR")

if [[ "$RESPONSE" == "ERROR" ]]; then
    echo "❌ Whisper API call failed"
    exit 1
elif [[ "$RESPONSE" == *"[BLANK_AUDIO]"* ]]; then
    echo "⚠️  Whisper returned [BLANK_AUDIO] (expected for silent test file)"
    echo "   Real voice input will transcribe properly"
else
    echo "✅ Whisper API response: $RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: TTS Direct API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Testing TTS API..."
curl -s -X POST "http://localhost:8880/v1/audio/speech" \
    -H "Content-Type: application/json" \
    -d '{"model":"kokoro","input":"Hello, this is Liv Hana voice mode test","voice":"af_sky"}' \
    -o /tmp/livhana_tts_test.wav

if [ -f /tmp/livhana_tts_test.wav ] && [ -s /tmp/livhana_tts_test.wav ]; then
    echo "✅ TTS generated audio: /tmp/livhana_tts_test.wav"
    
    if command -v afplay &>/dev/null; then
        echo "   Playing audio..."
        afplay /tmp/livhana_tts_test.wav
    fi
else
    echo "❌ TTS API call failed"
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ VOICE MODE TERMINAL TEST COMPLETE                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Both STT and TTS APIs are functional."
echo ""
echo "For MCP-based testing (in Claude Code CLI):"
echo "  1. Restart Claude Code CLI (Cmd+Q, reopen)"
echo "  2. Run: mcp__voicemode__converse message=\"Test\""
echo ""
