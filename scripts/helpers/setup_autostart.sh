#!/usr/bin/env bash
# 🎼 Setup Autostart for Voice Services
# Creates LaunchAgents for Whisper and Kokoro to start at login
# One Shot, One Kill | Grow Baby Grow, Sell Baby Sell

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

success() { printf "${GREEN}✅ %s${NC}\n" "$1"; }
warning() { printf "${YELLOW}⚠️  %s${NC}\n" "$1"; }
error() { printf "${RED}❌ %s${NC}\n" "$1"; }
info() { printf "${CYAN}🎯 %s${NC}\n" "$1"; }

banner() {
  printf "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "${BOLD}${MAGENTA}  🎼 %s${NC}\n" "$1"
  printf "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n"
}

banner "SETUP AUTOSTART FOR VOICE SERVICES"

LAUNCHAGENTS_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$LAUNCHAGENTS_DIR"

# ============================================================================
# Create Whisper LaunchAgent
# ============================================================================
info "Creating Whisper STT LaunchAgent..."

WHISPER_PLIST="$LAUNCHAGENTS_DIR/com.livhana.whisper.plist"

cat > "$WHISPER_PLIST" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.livhana.whisper</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>command -v voicemode >/dev/null 2>&1 && voicemode whisper start || echo "voicemode not found"</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <dict>
        <key>NetworkState</key>
        <true/>
    </dict>

    <key>StandardOutPath</key>
    <string>/tmp/whisper-stdout.log</string>

    <key>StandardErrorPath</key>
    <string>/tmp/whisper-stderr.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>
</dict>
</plist>
EOF

success "Created: $WHISPER_PLIST"

# ============================================================================
# Create Kokoro LaunchAgent
# ============================================================================
info "Creating Kokoro TTS LaunchAgent..."

KOKORO_PLIST="$LAUNCHAGENTS_DIR/com.livhana.kokoro.plist"

cat > "$KOKORO_PLIST" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.livhana.kokoro</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>command -v voicemode >/dev/null 2>&1 && voicemode kokoro start || echo "voicemode not found"</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <dict>
        <key>NetworkState</key>
        <true/>
    </dict>

    <key>StandardOutPath</key>
    <string>/tmp/kokoro-stdout.log</string>

    <key>StandardErrorPath</key>
    <string>/tmp/kokoro-stderr.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>
</dict>
</plist>
EOF

success "Created: $KOKORO_PLIST"

# ============================================================================
# Load LaunchAgents
# ============================================================================
banner "LOADING LAUNCHAGENTS"

info "Unloading existing agents (if any)..."
launchctl unload "$WHISPER_PLIST" 2>/dev/null || true
launchctl unload "$KOKORO_PLIST" 2>/dev/null || true
sleep 1

info "Loading Whisper LaunchAgent..."
if launchctl load "$WHISPER_PLIST"; then
  success "Whisper LaunchAgent loaded successfully"
else
  error "Failed to load Whisper LaunchAgent"
fi

info "Loading Kokoro LaunchAgent..."
if launchctl load "$KOKORO_PLIST"; then
  success "Kokoro LaunchAgent loaded successfully"
else
  error "Failed to load Kokoro LaunchAgent"
fi

echo
info "Waiting 3 seconds for services to start..."
sleep 3

# ============================================================================
# Verify Services
# ============================================================================
banner "VERIFYING SERVICES"

info "Checking Whisper STT (port 2022)..."
if lsof -i :2022 2>/dev/null | grep -q LISTEN; then
  success "Whisper STT is running on port 2022"
else
  warning "Whisper STT not detected on port 2022 yet"
  info "Check logs: tail -f /tmp/whisper-stderr.log"
fi

info "Checking Kokoro TTS (port 8880)..."
if lsof -i :8880 2>/dev/null | grep -q LISTEN; then
  success "Kokoro TTS is running on port 8880"
else
  warning "Kokoro TTS not detected on port 8880 yet"
  info "Check logs: tail -f /tmp/kokoro-stderr.log"
fi

# ============================================================================
# Final Report
# ============================================================================
banner "SETUP COMPLETE"

success "Voice services configured for autostart at login"
echo
info "LaunchAgents created:"
echo "  • $WHISPER_PLIST"
echo "  • $KOKORO_PLIST"
echo
info "Service logs:"
echo "  • Whisper: /tmp/whisper-{stdout,stderr}.log"
echo "  • Kokoro: /tmp/kokoro-{stdout,stderr}.log"
echo
info "Manage services:"
echo "  • Status: launchctl list | grep livhana"
echo "  • Unload: launchctl unload ~/Library/LaunchAgents/com.livhana.*.plist"
echo "  • Reload: launchctl load ~/Library/LaunchAgents/com.livhana.*.plist"
echo
success "🎼 Voice services will now start automatically at login!"
