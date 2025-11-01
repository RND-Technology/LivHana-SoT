#!/bin/bash
# Verify TTS (Text-to-Speech) readiness
# Part of EA_PRECISION audit infrastructure
set -euo pipefail

echo "=== TTS Verification ==="
echo "Date: $(date)"
echo ""

# Check environment variables
echo "1. Checking environment variables..."
if [ -z "${ELEVENLABS_API_KEY:-}" ]; then
    echo "❌ ELEVENLABS_API_KEY not set"
    ENV_OK=false
else
    echo "✅ ELEVENLABS_API_KEY is set (${#ELEVENLABS_API_KEY} chars)"
    ENV_OK=true
fi

# Check voice service
echo ""
echo "2. Checking voice service availability..."
if curl -s -f http://localhost:4001/health > /dev/null 2>&1; then
    echo "✅ Voice service is running"
    VOICE_OK=true
else
    echo "❌ Voice service is not running at http://localhost:4001"
    VOICE_OK=false
fi

# Test synthesis endpoint (if service is up)
if [ "$VOICE_OK" = true ] && [ "$ENV_OK" = true ]; then
    echo ""
    echo "3. Testing voice synthesis..."
    
    RESPONSE=$(curl -s -X POST http://localhost:4001/api/elevenlabs/synthesize \
        -H "Content-Type: application/json" \
        -d '{"text":"Test audio synthesis"}' \
        -o /tmp/tts-test.mp3 \
        -w "%{http_code}" 2>/dev/null || echo "000")
    
    if [ "$RESPONSE" = "200" ] && [ -f /tmp/tts-test.mp3 ]; then
        FILE_SIZE=$(stat -f%z /tmp/tts-test.mp3 2>/dev/null || stat -c%s /tmp/tts-test.mp3 2>/dev/null || echo "0")
        if [ "$FILE_SIZE" -gt 1000 ]; then
            echo "✅ Voice synthesis successful (${FILE_SIZE} bytes)"
            rm /tmp/tts-test.mp3
        else
            echo "❌ Audio file too small (${FILE_SIZE} bytes)"
        fi
    else
        echo "❌ Voice synthesis failed (HTTP $RESPONSE)"
    fi
    
    # Test voice list
    echo ""
    echo "4. Testing voice list retrieval..."
    VOICES=$(curl -s http://localhost:4001/api/elevenlabs/voices 2>/dev/null | jq -r '.voices | length' 2>/dev/null || echo "0")
    if [ "$VOICES" -gt 0 ]; then
        echo "✅ Retrieved $VOICES voices"
    else
        echo "❌ Failed to retrieve voice list"
    fi
else
    echo ""
    echo "⚠️  Skipping synthesis tests (service not ready or API key missing)"
fi

echo ""
echo "=== TTS Verification Summary ==="
echo "Environment: $([ "$ENV_OK" = true ] && echo "✅ OK" || echo "❌ Failed")"
echo "Voice Service: $([ "$VOICE_OK" = true ] && echo "✅ OK" || echo "❌ Failed")"
echo ""

if [ "$ENV_OK" = true ] && [ "$VOICE_OK" = true ]; then
    echo "✅ TTS system is ready"
    exit 0
else
    echo "❌ TTS system is NOT ready"
    exit 1
fi
