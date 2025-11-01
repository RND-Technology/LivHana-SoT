#!/usr/bin/env bash
# Install Whisper Dependencies
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎤 Whisper Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS="linux"
else
  echo "❌ Unsupported OS: $OSTYPE"
  exit 1
fi

echo "📍 Operating System: $OS"
echo ""

# Option 1: Python Whisper (recommended for accuracy)
echo "Option 1: Python Whisper (OpenAI official)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v python3 &>/dev/null; then
  PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
  echo "✅ Python found: $PYTHON_VERSION"

  echo "Installing OpenAI Whisper..."
  pip3 install --upgrade openai-whisper

  # Install ffmpeg if needed
  if ! command -v ffmpeg &>/dev/null; then
    echo "Installing ffmpeg..."
    if [[ "$OS" == "macos" ]]; then
      brew install ffmpeg
    elif [[ "$OS" == "linux" ]]; then
      sudo apt-get update && sudo apt-get install -y ffmpeg
    fi
  fi

  echo "✅ Python Whisper installed"
else
  echo "⚠️  Python3 not found, skipping Python Whisper"
fi

echo ""

# Option 2: whisper.cpp (faster, C++ implementation)
echo "Option 2: whisper.cpp (faster, lower latency)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

WHISPER_CPP_DIR="$HOME/.whisper-cpp"

if [[ -d "$WHISPER_CPP_DIR" ]]; then
  echo "  ℹ️  whisper.cpp already installed at $WHISPER_CPP_DIR"
else
  echo "Cloning whisper.cpp..."
  git clone https://github.com/ggerganov/whisper.cpp.git "$WHISPER_CPP_DIR"

  cd "$WHISPER_CPP_DIR"

  echo "Building whisper.cpp..."
  make

  # Download base.en model
  echo "Downloading base.en model..."
  bash ./models/download-ggml-model.sh base.en

  echo "✅ whisper.cpp installed at $WHISPER_CPP_DIR"
  echo "   Executable: $WHISPER_CPP_DIR/main"
fi

echo ""

# Verification
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v whisper &>/dev/null; then
  echo "✅ Python Whisper CLI available"
fi

if [[ -f "$WHISPER_CPP_DIR/main" ]]; then
  echo "✅ whisper.cpp binary available at $WHISPER_CPP_DIR/main"
fi

if command -v ffmpeg &>/dev/null; then
  echo "✅ ffmpeg available"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Whisper installation complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Environment variables to set:"
echo "  export WHISPER_CPP_PATH=$WHISPER_CPP_DIR/main"
echo "  export WHISPER_USE_CPP=true  # Use C++ (faster)"
echo "  export WHISPER_USE_CPP=false # Use Python (more accurate)"
echo "  export WHISPER_MODEL=base.en  # tiny.en, base.en, small.en, medium.en, large"
