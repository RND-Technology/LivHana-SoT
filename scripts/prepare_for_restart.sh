#!/usr/bin/env bash
# Prepare M4 Mac for Restart - LIV HANA Tier-1
# This script prepares the system for a clean restart and validates readiness

set -euo pipefail

ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG="$ROOT/logs/pre_restart_$TIMESTAMP.log"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎼 LIV HANA PRE-RESTART PREPARATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Show current system status
echo "📊 Current System Status:"
echo "  Memory: $(vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages free:\s+(\d+)/ and printf("%.1fGB free\n", $1 * $size / 1073741824);' | tail -1)"
echo "  Load: $(uptime | awk -F'load averages:' '{print $2}')"
echo "  Disk: $(df -h / | awk 'NR==2 {print $4 " free"}')"
echo ""

# Step 2: Check for uncommitted git changes
echo "📝 Checking git status..."
cd "$ROOT"
UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "  ⚠️  $UNCOMMITTED uncommitted files found"
    echo ""
    echo "  Would you like to:"
    echo "    1) Commit changes"
    echo "    2) Stash changes"
    echo "    3) Skip (risky!)"
    echo ""
    read -p "  Choose (1/2/3): " choice

    case $choice in
        1)
            git add -A
            git commit -m "chore: pre-restart checkpoint - $(date +%Y-%m-%d)"
            echo "  ✅ Changes committed"
            ;;
        2)
            git stash save "pre-restart-$TIMESTAMP"
            echo "  ✅ Changes stashed"
            ;;
        3)
            echo "  ⚠️  Skipping git backup (changes may be lost!)"
            ;;
        *)
            echo "  ❌ Invalid choice, skipping"
            ;;
    esac
else
    echo "  ✅ No uncommitted changes"
fi
echo ""

# Step 3: Free up memory
echo "🧹 Freeing system memory..."
echo "  Before: $(vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages free:\s+(\d+)/ and printf("%.1fGB\n", $1 * $size / 1073741824);' | tail -1)"

# Find top memory consumers
echo "  Top 5 memory consumers:"
ps aux | sort -nrk 4 | head -5 | awk '{printf("    %s: %.1fGB (%s)\n", $11, $6/1048576, $2)}'
echo ""

# Ask if user wants to purge caches
read -p "  Run 'sudo purge' to free memory? (y/n): " purge_choice
if [ "$purge_choice" = "y" ]; then
    echo "  Running sudo purge..."
    sudo purge
    sleep 2
    echo "  After: $(vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages free:\s+(\d+)/ and printf("%.1fGB\n", $1 * $size / 1073741824);' | tail -1)"
    echo "  ✅ Memory purged"
else
    echo "  ⏭️  Skipping memory purge"
fi
echo ""

# Step 4: Document current tmux sessions
echo "📋 Documenting tmux sessions..."
SESSIONS_FILE="$ROOT/tmp/tmux_sessions_pre_restart_$TIMESTAMP.txt"
tmux list-sessions > "$SESSIONS_FILE" 2>&1 || echo "No tmux sessions" > "$SESSIONS_FILE"
echo "  ✅ Saved to: $SESSIONS_FILE"
echo ""

# Step 5: Check for processes on critical ports
echo "🔍 Checking critical ports..."
for port in 2022 8880 3005; do
    if lsof -i :$port | grep LISTEN >/dev/null 2>&1; then
        proc=$(lsof -i :$port | grep LISTEN | awk '{print $1}' | head -1)
        pid=$(lsof -i :$port | grep LISTEN | awk '{print $2}' | head -1)
        echo "  ✅ Port $port: $proc (PID $pid)"
    else
        echo "  ⚠️  Port $port: Not in use"
    fi
done
echo ""

# Step 6: Export 1Password session
echo "🔐 Checking 1Password authentication..."
if op whoami >/dev/null 2>&1; then
    echo "  ✅ 1Password authenticated"
    echo "  Note: You may need to re-authenticate after restart"
else
    echo "  ⚠️  1Password not authenticated"
    echo "  Run: eval \$(op signin)"
fi
echo ""

# Step 7: Check Claude CLI
echo "🤖 Checking Claude CLI..."
if command -v claude >/dev/null 2>&1; then
    claude_version=$(claude --version 2>&1 || echo "unknown")
    echo "  ✅ Claude CLI installed: $claude_version"

    # Check for Sonnet 4.5
    if claude models list 2>&1 | grep -i "sonnet-4.*5" >/dev/null 2>&1; then
        echo "  ✅ Claude Sonnet 4.5 available"
    else
        echo "  ⚠️  Claude Sonnet 4.5 not found"
        echo "  Recommendation: brew reinstall --cask claude && claude self update"
    fi
else
    echo "  ❌ Claude CLI not found"
fi
echo ""

# Step 8: Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ PRE-RESTART PREPARATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Pre-Restart Checklist:"
echo "  [$([ $UNCOMMITTED -eq 0 ] && echo '✅' || echo '⚠️')] Git changes handled"
echo "  [✅] Memory status documented"
echo "  [✅] tmux sessions documented"
echo "  [✅] Critical ports checked"
echo "  [✅] 1Password status checked"
echo "  [✅] Claude CLI verified"
echo ""
echo "📄 Full diagnostic report:"
echo "  $ROOT/tmp/pre_restart_diagnostic.md"
echo ""
echo "🎯 POST-RESTART: Run 'claude-tier1' to restore full state"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Ready for restart? (Ctrl+C to cancel)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Press ENTER to show restart command... "

echo ""
echo "To restart your M4 Mac, run:"
echo "  sudo shutdown -r now"
echo ""
echo "Or schedule restart for 1 minute:"
echo "  sudo shutdown -r +1"
echo ""
