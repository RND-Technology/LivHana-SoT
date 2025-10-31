#!/usr/bin/env bash
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚨 EMERGENCY VS CODE FIX - AppTranslocation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Kill ALL VS Code processes
echo "🛑 Killing all VS Code processes..."
killall "Visual Studio Code" "Electron" "Code Helper" "Code Helper (Plugin)" "Code Helper (Renderer)" 2>/dev/null || true
sleep 3

# 2. Clear quarantine on actual app
if [ -d "/Applications/Visual Studio Code.app" ]; then
    echo "🔓 Removing quarantine attributes..."
    sudo xattr -rd com.apple.quarantine "/Applications/Visual Studio Code.app" 2>/dev/null || true
    
    echo "🔄 Resetting launch services database..."
    /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
        -kill -r -domain local -domain system -domain user 2>/dev/null || true
fi

# 3. Clear VS Code caches that may reference old path
echo "🧹 Clearing VS Code caches..."
rm -rf ~/Library/Caches/com.microsoft.VSCode* 2>/dev/null || true
rm -rf ~/Library/Application\ Support/Code/Cache* 2>/dev/null || true
rm -rf ~/Library/Application\ Support/Code/CachedData/* 2>/dev/null || true
rm -rf ~/Library/Saved\ Application\ State/com.microsoft.VSCode.savedState 2>/dev/null || true

# 4. Clear AppTranslocation cache
echo "🧹 Clearing AppTranslocation cache..."
rm -rf ~/Library/Caches/com.apple.appstore* 2>/dev/null || true

# 5. Verify clean state
echo "🔍 Verifying clean state..."
if pgrep -f "AppTranslocation.*Visual Studio Code" > /dev/null 2>&1; then
    echo "❌ VS Code processes still running from AppTranslocation!"
    echo "   Manual intervention required - force quit from Activity Monitor"
    exit 1
fi

echo ""
echo "✅ VS Code cleaned successfully"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open Finder (⌘+Space → 'Finder')"
echo "2. Press ⌘+Shift+A to go to Applications"
echo "3. Double-click 'Visual Studio Code.app'"
echo "4. After VS Code opens, verify with:"
echo "   bash scripts/verify_vscode_clean.sh"
echo ""
echo "⚠️  DO NOT use 'code' command or Alfred to open VS Code"
echo "⚠️  MUST open from Finder to avoid re-quarantine"
echo ""
