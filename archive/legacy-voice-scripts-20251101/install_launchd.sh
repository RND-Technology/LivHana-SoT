#!/usr/bin/env bash
# Install voice LaunchDaemons (requires sudo for system-level)
# and LaunchAgent (watchdog, user-level)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLIST_DIR="$REPO_ROOT/scripts/voice/launchd"

echo "Installing voice LaunchDaemons (requires sudo)..."

# System-level daemons (root context)
for svc in stt tts; do
  src="$PLIST_DIR/com.livhana.voice.${svc}.plist"
  dst="/Library/LaunchDaemons/com.livhana.voice.${svc}.plist"
  
  if [[ ! -f "$src" ]]; then
    echo "ERROR: Source plist not found: $src"
    exit 1
  fi
  
  sudo cp "$src" "$dst"
  sudo chown root:wheel "$dst"
  sudo chmod 644 "$dst"
  
  # Bootstrap and enable
  sudo launchctl bootstrap system "$dst" 2>/dev/null || echo "Already bootstrapped: $dst"
  sudo launchctl enable "system/com.livhana.voice.${svc}"
  sudo launchctl kickstart -k "system/com.livhana.voice.${svc}"
  
  echo "Installed: com.livhana.voice.${svc}"
done

# User-level watchdog
WATCHDOG_SRC="$PLIST_DIR/com.livhana.watchdog.voice.plist"
WATCHDOG_DST="$HOME/Library/LaunchAgents/com.livhana.watchdog.voice.plist"

mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$HOME/Library/Logs/LivHana"

cp "$WATCHDOG_SRC" "$WATCHDOG_DST"
chmod 644 "$WATCHDOG_DST"

launchctl bootstrap "gui/$UID" "$WATCHDOG_DST" 2>/dev/null || echo "Already bootstrapped: watchdog"
launchctl enable "gui/$UID/com.livhana.watchdog.voice"
launchctl kickstart -k "gui/$UID/com.livhana.watchdog.voice"

echo "Installed: com.livhana.watchdog.voice"
echo
echo "Voice services installed. Verify with:"
echo "  sudo launchctl list | grep livhana.voice"
echo "  launchctl list | grep livhana.watchdog"
echo "  curl -sf http://localhost:2022/health"
echo "  curl -sf http://localhost:8880/health"

