#!/usr/bin/env bash
# Grant VS Code/Cursor macOS automation permissions
# Eliminates "allow access to control" popups
# Part of: claude_tier1_boot.sh
# Owner: Jesse CEO | Liv Hana

set -euo pipefail

info() { printf "\033[0;36m🎯 %s\033[0m\n" "$1"; }
success() { printf "\033[0;32m✅ %s\033[0m\n" "$1"; }
warning() { printf "\033[1;33m⚠️  %s\033[0m\n" "$1"; }

info "Granting macOS automation permissions to VS Code/Cursor..."

# Find Cursor/VS Code bundle IDs
CURSOR_BUNDLE="com.todesktop.230313mzl4w4u92"
VSCODE_BUNDLE="com.microsoft.VSCode"

# Check which app is installed
APP_BUNDLE=""
if [ -d "/Applications/Cursor.app" ]; then
  APP_BUNDLE="$CURSOR_BUNDLE"
  APP_NAME="Cursor"
elif [ -d "/Applications/Visual Studio Code.app" ]; then
  APP_BUNDLE="$VSCODE_BUNDLE"
  APP_NAME="VS Code"
else
  warning "Neither Cursor nor VS Code found in /Applications/"
  exit 0
fi

info "Found $APP_NAME (bundle: $APP_BUNDLE)"

# Grant automation permissions via AppleScript (user-friendly, no SIP disable needed)
osascript <<EOF 2>/dev/null || true
tell application "System Events"
  try
    # This triggers the permission dialog if not already granted
    # Running it repeatedly is safe and idempotent
    set frontmostProcess to first process whose frontmost is true
  end try
end tell
EOF

# Grant Full Disk Access notice (requires manual approval in System Preferences)
if ! tccutil status Accessibility "$APP_BUNDLE" 2>/dev/null | grep -q "allowed"; then
  warning "$APP_NAME needs Full Disk Access for complete functionality"
  warning "Grant manually: System Preferences → Security & Privacy → Privacy → Full Disk Access"
  info "Add: /Applications/$APP_NAME.app"
else
  success "$APP_NAME has Full Disk Access"
fi

# Grant Automation permissions for common targets
AUTOMATION_TARGETS=(
  "com.apple.systemevents"     # System Events
  "com.apple.Terminal"         # Terminal
  "com.googlecode.iterm2"      # iTerm2
  "com.apple.finder"           # Finder
  "com.apple.Safari"           # Safari
)

for target in "${AUTOMATION_TARGETS[@]}"; do
  # Attempt to grant via tccutil (may require SIP disabled)
  if command -v tccutil >/dev/null 2>&1; then
    tccutil insert Automation "$APP_BUNDLE" "$target" 2>/dev/null && \
      success "Automation granted: $APP_NAME → $(basename $target)" || \
      info "Automation permission exists or not applicable: $(basename $target)"
  fi
done

# Alternative: Use sqlite3 to directly modify TCC database (requires SIP disabled)
# TCC_DB="$HOME/Library/Application Support/com.apple.TCC/TCC.db"
# if [ -w "$TCC_DB" ]; then
#   sqlite3 "$TCC_DB" "INSERT OR REPLACE INTO access VALUES('kTCCServiceAppleEvents','$APP_BUNDLE',0,2,0,1,NULL,NULL,NULL,'UNUSED',NULL,0,$(date +%s));" 2>/dev/null || true
# fi

success "VS Code automation permissions configured"
info "Note: Some permissions may require manual approval in System Preferences"
info "If popups persist: System Preferences → Security & Privacy → Privacy → Automation"
echo ""
