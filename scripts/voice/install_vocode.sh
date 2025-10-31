#!/usr/bin/env bash
# Install Vocode Dependencies
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗣️  Vocode Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "❌ Python3 required but not found"
  echo "   Install Python 3.9+ first"
  exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✅ Python found: $PYTHON_VERSION"
echo ""

# Install Vocode
echo "Installing vocode-core..."
pip3 install --upgrade vocode-core

# Optional: Install provider-specific packages
echo ""
echo "Provider-specific packages (optional):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Install ElevenLabs support? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  pip3 install elevenlabs
  echo "✅ ElevenLabs support installed"
fi

read -p "Install Azure Speech support? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  pip3 install azure-cognitiveservices-speech
  echo "✅ Azure Speech support installed"
fi

read -p "Install PlayHT support? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  pip3 install pyht
  echo "✅ PlayHT support installed"
fi

# Verification
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 -c "import vocode; print(f'✅ vocode {vocode.__version__} installed')" 2>/dev/null || echo "⚠️  Vocode import failed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Vocode installation complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Environment variables to set:"
echo "  export VOCODE_PROVIDER=elevenlabs      # elevenlabs, azure, playht, coqui"
echo "  export VOCODE_VOICE_ID=<voice-id>      # Provider-specific voice ID"
echo "  export ELEVENLABS_API_KEY=<your-key>   # For ElevenLabs"
echo "  export AZURE_SPEECH_KEY=<your-key>     # For Azure"
echo "  export AZURE_SPEECH_REGION=<region>    # For Azure (e.g., eastus)"
echo ""
echo "Get ElevenLabs API key: https://elevenlabs.io/app/speech-synthesis"
echo "Get Azure Speech key: https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices"
