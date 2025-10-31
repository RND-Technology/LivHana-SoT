#!/bin/bash
# Fix claude-tier1 zsh function to handle BASH_SOURCE properly

cat >> ~/.zshrc << 'FIXEOF'

# Updated claude-tier1 function with bash exec fix
claude-tier1() {
    cd ~/LivHana-Trinity-Local/LivHana-SoT || return 1
    if ! op whoami > /dev/null 2>&1
    then
        echo "🔐 1Password session required..."
        op signin || return 1
    fi
    if [ -f boot ]
    then
        # Use bash explicitly to avoid BASH_SOURCE issues in zsh
        bash boot || return 1
    else
        echo "⚠️  boot file not found, trying tier1-boot instead..."
        bash scripts/claude_tier1_boot.sh || return 1
    fi
    if command -v claude > /dev/null 2>&1
    then
        printf '\n🚀 Launching Claude Code...\n\n'
        claude "$@"
    else
        printf '\n❌ Claude Code CLI not installed.\n'
        printf 'Install: npm install -g @anthropic-ai/claude-code\n'
        printf 'Then run: claude-tier1\n\n'
    fi
}
FIXEOF

echo "✅ Added updated claude-tier1 function to ~/.zshrc"
echo "⚠️  You need to remove the old function from ~/.zshrc first"
echo "📝 Run: source ~/.zshrc to reload"

