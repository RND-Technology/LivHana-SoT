#!/bin/bash
# Add Missing API Keys to Environment
# Usage: ./add_missing_api_keys.sh [DEEPSEEK_KEY] [PERPLEXITY_KEY]

set -e

ZSHRC="$HOME/.zshrc"
BACKUP="$HOME/.zshrc.backup.$(date +%Y%m%d_%H%M%S)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Adding Missing API Keys to Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Backup .zshrc
cp "$ZSHRC" "$BACKUP"
echo "✅ Backup created: $BACKUP"

# Check if keys are provided as arguments or prompt for them
if [ -z "$1" ]; then
  echo "🔑 Enter DEEPSEEK_API_KEY (or press Enter to skip):"
  read -r DEEPSEEK_KEY
else
  DEEPSEEK_KEY="$1"
fi

if [ -z "$2" ]; then
  echo "🔑 Enter PERPLEXITY_API_KEY (or press Enter to skip):"
  read -r PERPLEXITY_KEY
else
  PERPLEXITY_KEY="$2"
fi

# Add DEEPSEEK_API_KEY if provided
if [ -n "$DEEPSEEK_KEY" ]; then
  if grep -q "DEEPSEEK_API_KEY" "$ZSHRC"; then
    # Update existing key
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|export DEEPSEEK_API_KEY=.*|export DEEPSEEK_API_KEY=\"$DEEPSEEK_KEY\"|" "$ZSHRC"
    else
      sed -i "s|export DEEPSEEK_API_KEY=.*|export DEEPSEEK_API_KEY=\"$DEEPSEEK_KEY\"|" "$ZSHRC"
    fi
    echo "✅ Updated DEEPSEEK_API_KEY in $ZSHRC"
  else
    # Add new key
    echo "" >> "$ZSHRC"
    echo "# DEEPSEEK API Key (added $(date +%Y-%m-%d))" >> "$ZSHRC"
    echo "export DEEPSEEK_API_KEY=\"$DEEPSEEK_KEY\"" >> "$ZSHRC"
    echo "✅ Added DEEPSEEK_API_KEY to $ZSHRC"
  fi
  export DEEPSEEK_API_KEY="$DEEPSEEK_KEY"
fi

# Add PERPLEXITY_API_KEY if provided
if [ -n "$PERPLEXITY_KEY" ]; then
  if grep -q "PERPLEXITY_API_KEY" "$ZSHRC"; then
    # Update existing key
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|export PERPLEXITY_API_KEY=.*|export PERPLEXITY_API_KEY=\"$PERPLEXITY_KEY\"|" "$ZSHRC"
    else
      sed -i "s|export PERPLEXITY_API_KEY=.*|export PERPLEXITY_API_KEY=\"$PERPLEXITY_KEY\"|" "$ZSHRC"
    fi
    echo "✅ Updated PERPLEXITY_API_KEY in $ZSHRC"
  else
    # Add new key
    echo "" >> "$ZSHRC"
    echo "# PERPLEXITY API Key (added $(date +%Y-%m-%d))" >> "$ZSHRC"
    echo "export PERPLEXITY_API_KEY=\"$PERPLEXITY_KEY\"" >> "$ZSHRC"
    echo "✅ Added PERPLEXITY_API_KEY to $ZSHRC"
  fi
  export PERPLEXITY_API_KEY="$PERPLEXITY_KEY"
fi

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ API Keys Updated"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "Keys are now active in current session."
echo "They will be loaded automatically in new terminal sessions."
echo
echo "To verify:"
echo "  echo \$DEEPSEEK_API_KEY"
echo "  echo \$PERPLEXITY_API_KEY"
echo
