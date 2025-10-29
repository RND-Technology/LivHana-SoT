#!/usr/bin/env bash
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VS Code Environment Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check process location
vscode_proc=$(ps aux | grep "Visual Studio Code.app" | grep -v grep | head -1 || echo "not_running")

if [[ "$vscode_proc" == "not_running" ]]; then
    echo "⚠️  VS Code not running"
    exit 0
fi

echo "📍 Process Path:"
vscode_path=$(echo "$vscode_proc" | awk '{print $NF}')
echo "   $vscode_path"
echo ""

if echo "$vscode_path" | grep -q "AppTranslocation"; then
    echo "❌ CRITICAL: VS Code running from AppTranslocation!"
    echo ""
    echo "🔧 FIX: Run 'sudo bash scripts/emergency_vscode_fix.sh'"
    echo "   Then restart from Finder: /Applications/Visual Studio Code.app"
    exit 1
fi

if echo "$vscode_path" | grep -q "/Applications/Visual Studio Code.app"; then
    echo "✅ VS Code running from /Applications (CLEAN)"
else
    echo "⚠️  VS Code running from unexpected location"
fi

# Check environment variables
echo ""
echo "🌍 Environment Check:"
if env | grep -q "AppTranslocation"; then
    echo "   ⚠️  Environment variables contain AppTranslocation paths"
    echo "   (Will clear after next restart)"
else
    echo "   ✅ No AppTranslocation references in environment"
fi

# Check quarantine attributes
echo ""
echo "🔒 Quarantine Status:"
if xattr -l "/Applications/Visual Studio Code.app" 2>/dev/null | grep -q "com.apple.quarantine"; then
    echo "   ⚠️  Quarantine attribute still present"
    echo "   Run: sudo xattr -rd com.apple.quarantine '/Applications/Visual Studio Code.app'"
else
    echo "   ✅ No quarantine attributes"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
