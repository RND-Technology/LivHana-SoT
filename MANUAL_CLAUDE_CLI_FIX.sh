#!/usr/bin/env bash
# Manual fix for Claude Code CLI update (requires sudo)

set -e

echo "🔧 Fixing Claude Code CLI installation..."
echo ""

# Option 1: Force remove and reinstall
echo "Option 1: Clean reinstall (requires password)"
sudo rm -rf /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code
sudo npm install -g @anthropic-ai/claude-code@latest

# Verify
echo ""
echo "✅ Verification:"
claude --version

echo ""
echo "✅ Claude Code CLI fixed!"


