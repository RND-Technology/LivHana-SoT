#!/bin/bash
set -euo pipefail

PLIST_SRC="$(cd "$(dirname "$0")/.." && pwd)/launchd/com.livhana.cursor-chat-backup.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.livhana.cursor-chat-backup.plist"

if [ ! -f "$PLIST_SRC" ]; then
  echo "LaunchAgent plist not found at $PLIST_SRC" >&2
  exit 1
fi

mkdir -p "$(dirname "$PLIST_DEST")"
cp "$PLIST_SRC" "$PLIST_DEST"

# Unload if already active
launchctl unload "$PLIST_DEST" >/dev/null 2>&1 || true

launchctl load -w "$PLIST_DEST"

echo "LaunchAgent installed. Daily backups scheduled at 02:00 local time." 
echo "Use 'launchctl list | grep com.livhana.cursor-chat-backup' to verify." 
