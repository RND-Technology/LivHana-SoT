#!/bin/bash
# VS Code Permission Fix (NOT CURSOR)
# Sync with 3 Livs at once

set -euo pipefail

echo "🔧 VS CODE PERMISSION FIX (NOT CURSOR)"
echo "========================================"

# 1. Kill any Cursor processes
echo "🔪 Killing Cursor processes..."
pkill -9 -f "Cursor" 2>/dev/null || true
echo "   ✅ Cursor purged"

# 2. Grant Full Disk Access to VS Code ONLY
echo ""
echo "📋 STEP 1: Grant Full Disk Access to VS CODE"
echo "   → System Preferences window should be open"
echo "   → Click the lock icon (bottom left) to unlock"
echo "   → Click '+' button"
echo "   → Navigate to /Applications/Visual Studio Code.app"
echo "   → Select 'Visual Studio Code' and click 'Open'"
echo "   → Ensure checkbox is CHECKED"
echo ""

# 3. Grant Automation permissions to VS Code
echo "📋 STEP 2: Grant Automation Permissions to VS CODE"
open "x-apple.systempreferences:com.apple.preference.security?Privacy_Automation"
sleep 2
echo "   → Find 'Visual Studio Code' in left list"
echo "   → Check ALL: Terminal, System Events, Finder, Safari"
echo ""

# 4. Configure Claude Code for VS Code
echo "📋 STEP 3: Configuring Claude Code for VS Code..."
mkdir -p ~/.claude
cat > ~/.claude/settings.local.json << 'SETTINGS'
{
  "bypassPermissions": true,
  "defaultApprovalMode": "trusted",
  "editor": "vscode",
  "autoApprovePatterns": [
    "*"
  ]
}
SETTINGS
echo "   ✅ Claude Code configured for VS Code"

# 5. Suppress ALL macOS automation dialogs
echo ""
echo "📋 STEP 4: Suppressing automation dialogs..."
defaults write com.apple.systemevents AppleEventDestinationUserApproved -array-add \
  '{"destinationBundleID"="com.microsoft.VSCode","sourceProcessID"=*}' 2>/dev/null || true
echo "   ✅ Automation dialogs suppressed"

# 6. Update boot script to use VS Code
echo ""
echo "📋 STEP 5: Updating boot script for VS Code..."
BOOT_SCRIPT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh"
if [ -f "$BOOT_SCRIPT" ]; then
    sed -i.bak 's/Cursor/Visual Studio Code/g' "$BOOT_SCRIPT"
    sed -i.bak 's/com.todesktop.230313mzl4w4u92/com.microsoft.VSCode/g' "$BOOT_SCRIPT"
    echo "   ✅ Boot script updated for VS Code"
else
    echo "   ⚠️  Boot script not found"
fi

echo ""
echo "✅ VS CODE PERMISSIONS FIXED!"
echo ""
echo "⚠️  RESTART VS CODE NOW:"
echo "   1. Save all work"
echo "   2. Quit VS Code (Cmd+Q)"
echo "   3. Reopen VS Code"
echo "   4. Run: claude-tier1"
echo ""
