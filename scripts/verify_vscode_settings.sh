#!/bin/bash

echo "=== Verifying VS Code Settings ==="
echo ""

if [ ! -f ".vscode/settings.json" ]; then
    echo "❌ ERROR: .vscode/settings.json not found"
    exit 1
fi

echo "Current VS Code workspace settings:"
echo ""
cat .vscode/settings.json

echo ""
echo "Key settings verification:"

# Check autosave delay
AUTOSAVE_DELAY=$(grep -o '"files.autoSaveDelay": [0-9]*' .vscode/settings.json | grep -o '[0-9]*')
if [ -n "$AUTOSAVE_DELAY" ] && [ "$AUTOSAVE_DELAY" -ge 5000 ]; then
    echo "✓ Autosave delay: ${AUTOSAVE_DELAY}ms (optimized)"
elif [ -n "$AUTOSAVE_DELAY" ]; then
    echo "⚠️  Autosave delay: ${AUTOSAVE_DELAY}ms (may be too frequent)"
else
    echo "⚠️  Autosave delay not configured"
fi

# Check watcher exclusions
WATCHER_EXCLUSIONS=$(grep -c '"files.watcherExclude"' .vscode/settings.json)
if [ "$WATCHER_EXCLUSIONS" -gt 0 ]; then
    echo "✓ File watcher exclusions configured"
else
    echo "⚠️  No file watcher exclusions found"
fi

# Check search exclusions
SEARCH_EXCLUSIONS=$(grep -c '"search.exclude"' .vscode/settings.json)
if [ "$SEARCH_EXCLUSIONS" -gt 0 ]; then
    echo "✓ Search exclusions configured"
else
    echo "⚠️  No search exclusions found"
fi

echo ""
echo "=== Verification Complete ==="
