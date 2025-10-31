#!/bin/bash

# Run OpenAI Realtime Voice Test with proper API key

echo "Loading OpenAI API key from 1Password..."
export OPENAI_API_KEY=$(op item get "OPENAI_API_KEY" --fields credential --reveal 2>&1)

if [ -z "$OPENAI_API_KEY" ] || [ ${#OPENAI_API_KEY} -lt 50 ]; then
  echo "❌ Failed to load API key"
  exit 1
fi

echo "✅ API key loaded (length: ${#OPENAI_API_KEY})"
echo ""

# Run the test
node scripts/voice/realtime_voice_test.js "$@"
