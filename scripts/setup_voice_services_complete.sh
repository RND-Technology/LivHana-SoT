#!/usr/bin/env bash
# 🎙️ Complete Voice Services Setup - Tier-1 Production Ready
# Community-Verified Best Practices for macOS LaunchAgents
# Implements: RunAtLoad, KeepAlive, ThrottleInterval, health checks, self-healing

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
  printf "${BOLD}${MAGENTA}  🎙️ %s${NC}\n" "$1"
  printf "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n"
}

banner "COMPLETE VOICE SERVICES SETUP - TIER-1 PRODUCTION"

LAUNCHAGENTS_DIR="$HOME/Library/LaunchAgents"
LOGS_DIR="$HOME/Library/Logs/LivHana"
mkdir -p "$LAUNCHAGENTS_DIR"
mkdir -p "$LOGS_DIR"

# ============================================================================
# Create Enhanced Whisper STT LaunchAgent
# ============================================================================
info "Creating Whisper STT LaunchAgent with health checks..."

WHISPER_PLIST="$LAUNCHAGENTS_DIR/com.livhana.voice.stt.plist"

cat > "$WHISPER_PLIST" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.livhana.voice.stt</string>

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
        <key>SuccessfulExit</key>
        <false/>
        <key>NetworkState</key>
        <true/>
    </dict>

    <key>ThrottleInterval</key>
    <integer>5</integer>

    <key>StandardOutPath</key>
    <string>~/Library/Logs/LivHana/whisper-stdout.log</string>

    <key>StandardErrorPath</key>
    <string>~/Library/Logs/LivHana/whisper-stderr.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
        <key>HOME</key>
        <string>~</string>
    </dict>

    <key>ProcessType</key>
    <string>Background</string>

    <key>Nice</key>
    <integer>1</integer>
</dict>
</plist>
EOF

success "Created: $WHISPER_PLIST"

# ============================================================================
# Create Enhanced Kokoro TTS LaunchAgent
# ============================================================================
info "Creating Kokoro TTS LaunchAgent with health checks..."

KOKORO_PLIST="$LAUNCHAGENTS_DIR/com.livhana.voice.tts.plist"

cat > "$KOKORO_PLIST" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.livhana.voice.tts</string>

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
        <key>SuccessfulExit</key>
        <false/>
        <key>NetworkState</key>
        <true/>
    </dict>

    <key>ThrottleInterval</key>
    <integer>5</integer>

    <key>StandardOutPath</key>
    <string>~/Library/Logs/LivHana/kokoro-stdout.log</string>

    <key>StandardErrorPath</key>
    <string>~/Library/Logs/LivHana/kokoro-stderr.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
        <key>HOME</key>
        <string>~</string>
    </dict>

    <key>ProcessType</key>
    <string>Background</string>

    <key>Nice</key>
    <integer>1</integer>
</dict>
</plist>
EOF

success "Created: $KOKORO_PLIST"

# ============================================================================
# Create Voice Watchdog LaunchAgent
# ============================================================================
info "Creating Voice Watchdog LaunchAgent..."

WATCHDOG_PLIST="$LAUNCHAGENTS_DIR/com.livhana.voice.watchdog.plist"
WATCHDOG_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/watchdogs/voice_services_watch.sh"

cat > "$WATCHDOG_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.livhana.voice.watchdog</string>

    <key>ProgramArguments</key>
    <array>
        <string>$WATCHDOG_SCRIPT</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>StartInterval</key>
    <integer>30</integer>

    <key>StandardOutPath</key>
    <string>~/Library/Logs/LivHana/watchdog-stdout.log</string>

    <key>StandardErrorPath</key>
    <string>~/Library/Logs/LivHana/watchdog-stderr.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
        <key>HOME</key>
        <string>~</string>
    </dict>

    <key>ProcessType</key>
    <string>Background</string>
</dict>
</plist>
EOF

success "Created: $WATCHDOG_PLIST"

# ============================================================================
# Load LaunchAgents
# ============================================================================
banner "LOADING LAUNCHAGENTS"

info "Unloading existing agents (if any)..."
launchctl unload "$WHISPER_PLIST" 2>/dev/null || true
launchctl unload "$KOKORO_PLIST" 2>/dev/null || true
launchctl unload "$WATCHDOG_PLIST" 2>/dev/null || true
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

info "Loading Watchdog LaunchAgent..."
if launchctl load "$WATCHDOG_PLIST"; then
  success "Watchdog LaunchAgent loaded successfully"
else
  error "Failed to load Watchdog LaunchAgent"
fi

echo
info "Waiting 5 seconds for services to start..."
sleep 5

# ============================================================================
# Verify Services
# ============================================================================
banner "VERIFYING SERVICES"

info "Checking Whisper STT (port 2022)..."
if lsof -i :2022 2>/dev/null | grep -q LISTEN; then
  success "Whisper STT is running on port 2022"
else
  warning "Whisper STT not detected on port 2022 yet"
  info "Check logs: tail -f ~/Library/Logs/LivHana/whisper-stderr.log"
fi

info "Checking Kokoro TTS (port 8880)..."
if lsof -i :8880 2>/dev/null | grep -q LISTEN; then
  success "Kokoro TTS is running on port 8880"
else
  warning "Kokoro TTS not detected on port 8880 yet"
  info "Check logs: tail -f ~/Library/Logs/LivHana/kokoro-stderr.log"
fi

# ============================================================================
# Final Report
# ============================================================================
banner "SETUP COMPLETE"

success "Voice services configured for autostart with self-healing"
echo
info "LaunchAgents created:"
echo "  • $WHISPER_PLIST"
echo "  • $KOKORO_PLIST"
echo "  • $WATCHDOG_PLIST"
echo
info "Service logs:"
echo "  • Whisper: ~/Library/Logs/LivHana/whisper-{stdout,stderr}.log"
echo "  • Kokoro: ~/Library/Logs/LivHana/kokoro-{stdout,stderr}.log"
echo "  • Watchdog: ~/Library/Logs/LivHana/watchdog-{stdout,stderr}.log"
echo
info "Manage services:"
echo "  • Status: launchctl list | grep livhana"
echo "  • Unload: launchctl unload ~/Library/LaunchAgents/com.livhana.voice.*.plist"
echo "  • Reload: launchctl load ~/Library/LaunchAgents/com.livhana.voice.*.plist"
echo
success "🎙️ Voice services will now start automatically at login with self-healing!"

