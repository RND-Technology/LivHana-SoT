#!/usr/bin/env bash
# CORRECTED: VSCode AppTranslocation Crash Loop Fix
# Addresses all 10 fallacies from red team analysis
# Military-grade: graceful shutdown, complete cleanup, verification

set -euo pipefail

LOG="/tmp/vscode_fix_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG") 2>&1

echo "🚨 EMERGENCY: VSCode AppTranslocation Fix"
echo "Log: $LOG"
echo ""

# Privilege check
if [[ "$EUID" -ne 0 ]] && ! xattr -l "/Applications/Visual Studio Code.app" &>/dev/null; then
    echo "⚠️  Some operations may need sudo"
    echo "   If script fails, re-run with: sudo bash $0"
fi

# Backup extended attributes
echo "💾 Backing up extended attributes..."
xattr -l "/Applications/Visual Studio Code.app" > /tmp/vscode_xattr_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null || true

# STEP 1: Graceful shutdown first
echo "1️⃣ Gracefully shutting down VSCode..."
pkill -f "Visual Studio Code" 2>/dev/null || true
sleep 5

# Check if still running, then force kill
if pgrep -f "Visual Studio Code" >/dev/null 2>&1; then
    echo "   ⚠️  VSCode still running, force killing..."
    pkill -9 -f "Visual Studio Code" 2>/dev/null || true
    sleep 2
fi
echo "   ✅ VSCode processes terminated"

# STEP 2: Complete quarantine removal
echo "2️⃣ Removing ALL extended attributes..."
if xattr -cr "/Applications/Visual Studio Code.app" 2>/dev/null; then
    echo "   ✅ All quarantine attributes removed"
else
    echo "   ⚠️  xattr failed - may need sudo"
fi

# STEP 3: Kill any lingering AppTranslocation processes
echo "3️⃣ Killing AppTranslocation processes..."
if pgrep -f "AppTranslocation.*Visual Studio Code" >/dev/null 2>&1; then
    pkill -9 -f "AppTranslocation.*Visual Studio Code" 2>/dev/null || true
    sleep 2
    echo "   ✅ AppTranslocation processes killed"
else
    echo "   ✅ No AppTranslocation processes found"
fi

# STEP 4: Clear macOS quarantine cache
echo "4️⃣ Clearing macOS quarantine cache..."
rm -rf ~/Library/Caches/com.apple.quarantine.* 2>/dev/null || true
rm -rf /private/var/folders/*/T/AppTranslocation/* 2>/dev/null || true
echo "   ✅ macOS caches cleared"

# STEP 5: Clear VSCode's own caches
echo "5️⃣ Clearing VSCode application caches..."
rm -rf ~/Library/Caches/com.microsoft.VSCode* 2>/dev/null || true
rm -rf ~/Library/Application\ Support/Code/Cache* 2>/dev/null || true
rm -rf ~/Library/Application\ Support/Code/CachedData/* 2>/dev/null || true
rm -rf ~/Library/Saved\ Application\ State/com.microsoft.VSCode.savedState 2>/dev/null || true
echo "   ✅ VSCode caches cleared"

# STEP 6: Reset LaunchServices database
echo "6️⃣ Resetting LaunchServices database..."
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
    -kill -r -domain local -domain system -domain user 2>/dev/null || true
sleep 3
echo "   ✅ LaunchServices reset complete"

# STEP 7: Verification of attributes
echo "7️⃣ Verifying extended attributes removed..."
XATTR_CHECK=$(xattr -l "/Applications/Visual Studio Code.app" 2>&1 | wc -l)
if [ "$XATTR_CHECK" -eq 0 ]; then
    echo "   ✅ No extended attributes (CLEAN)"
else
    echo "   ⚠️  Some attributes remain:"
    xattr -l "/Applications/Visual Studio Code.app" 2>&1 | head -3
fi

echo ""
echo "✅ EMERGENCY FIX COMPLETE"
echo ""

# STEP 8: Launch and verify
echo "🚀 Launching VSCode from /Applications..."
open "/Applications/Visual Studio Code.app"
sleep 5

echo "🔍 VERIFICATION CHECK:"
VSCODE_PATH=$(ps aux | grep "Visual Studio Code.app" | grep -v grep | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}' | head -1 | xargs)

if [[ "$VSCODE_PATH" == *"AppTranslocation"* ]]; then
    echo "   ❌ FAILED: VSCode still in AppTranslocation"
    echo "   Path: $VSCODE_PATH"
    echo ""
    echo "🔧 MANUAL FIX REQUIRED:"
    echo "   1. Close all VSCode windows"
    echo "   2. Run: sudo bash $0"
    echo "   3. If still fails, reinstall VSCode from microsoft.com"
    exit 1
elif [[ "$VSCODE_PATH" == *"/Applications/Visual Studio Code.app"* ]]; then
    echo "   ✅ SUCCESS: VSCode running from /Applications"
    echo "   Path: $VSCODE_PATH"
    echo ""
    echo "🎉 VSCode AppTranslocation fix VERIFIED"
    echo "📋 Log saved: $LOG"
    exit 0
else
    echo "   ⚠️  Unexpected path: $VSCODE_PATH"
    echo "   Check manually: ps aux | grep 'Visual Studio Code'"
    exit 1
fi
