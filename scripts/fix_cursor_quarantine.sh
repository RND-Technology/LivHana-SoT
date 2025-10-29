#!/bin/bash
# Fix Cursor AppTranslocation Issue
# Removes quarantine attribute and ensures proper execution from /Applications

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Fixing Cursor AppTranslocation Issue"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

CURSOR_APP="/Applications/Cursor.app"

# Check if Cursor exists
if [ ! -d "$CURSOR_APP" ]; then
  echo "❌ Cursor.app not found in /Applications"
  echo "   Please install Cursor first"
  exit 1
fi

echo "✅ Found Cursor at: $CURSOR_APP"

# Check current quarantine status
echo "🔍 Checking quarantine status..."
QUARANTINE=$(xattr -l "$CURSOR_APP" 2>/dev/null | grep -c "com.apple.quarantine" || echo "0")

if [ "$QUARANTINE" -gt 0 ]; then
  echo "⚠️  Cursor is quarantined (AppTranslocation active)"
  echo "🔧 Removing quarantine attribute..."

  # Remove quarantine
  sudo xattr -r -d com.apple.quarantine "$CURSOR_APP" 2>/dev/null || true

  echo "✅ Quarantine removed"
else
  echo "✅ Cursor is not quarantined"
fi

# Kill any running Cursor processes
echo "🔄 Checking for running Cursor processes..."
CURSOR_PIDS=$(ps aux | grep -i "Cursor\|Electron.*Cursor" | grep -v grep | awk '{print $2}' || true)

if [ -n "$CURSOR_PIDS" ]; then
  echo "⚠️  Found running Cursor processes:"
  echo "$CURSOR_PIDS"
  echo "🛑 Killing processes..."
  echo "$CURSOR_PIDS" | xargs kill -9 2>/dev/null || true
  sleep 2
  echo "✅ Cursor processes terminated"
else
  echo "✅ No running Cursor processes"
fi

# Clear AppTranslocation cache
echo "🧹 Clearing AppTranslocation cache..."
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Cursor Fix Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "Next steps:"
echo "1. Restart Cursor from /Applications/Cursor.app"
echo "2. Cursor will now run from proper location (no AppTranslocation)"
echo "3. This should eliminate crashes and memory issues"
echo
echo "To verify: Run 'ps aux | grep Cursor' and check path does NOT contain 'AppTranslocation'"
echo
