#!/usr/bin/env bash
# 🎤 Claude Voice Session Manager
# Liv Hana | Voice-First Orchestration
# Manages voice mode state and session continuity

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE_FILE="$ROOT/tmp/voice_session_state.json"
LOG_FILE="$ROOT/logs/voice_session_$(date +%Y%m%d_%H%M%S).log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

mkdir -p "$(dirname "$STATE_FILE")" "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Verify required Claude model is available
if ! claude models list 2>/dev/null | grep -q "sonnet-4.5-oct-2025"; then
  printf "${RED}❌ Required model 'sonnet-4.5-oct-2025' not available${NC}\n"
  printf "${YELLOW}   Run: claude models list   # confirm the model alias${NC}\n"
  exit 1
fi
printf "${GREEN}✅ Claude model sonnet-4.5-oct-2025 available${NC}\n"

printf "\n${BOLD}${CYAN}🎤 CLAUDE VOICE SESSION MANAGER${NC}\n"
printf "${CYAN}═══════════════════════════════════════════${NC}\n\n"

# Check voice services
check_voice_services() {
  printf "${CYAN}🔍 Checking voice services...${NC}\n"

  # Check STT (Whisper on 2022)
  if lsof -i :2022 2>/dev/null | grep -q LISTEN; then
    printf "${GREEN}✅ STT (Whisper) running on port 2022${NC}\n"
    STT_STATUS="active"
  else
    printf "${RED}❌ STT (Whisper) not running${NC}\n"
    printf "${YELLOW}   Start with: voicemode whisper start${NC}\n"
    STT_STATUS="inactive"
  fi

  # Check TTS (Kokoro on 8880)
  if lsof -i :8880 2>/dev/null | grep -q LISTEN; then
    printf "${GREEN}✅ TTS (Kokoro) running on port 8880${NC}\n"
    TTS_STATUS="active"
  else
    printf "${RED}❌ TTS (Kokoro) not running${NC}\n"
    printf "${YELLOW}   Start with: voicemode kokoro start${NC}\n"
    TTS_STATUS="inactive"
  fi

  echo ""
}

# Initialize session state
init_session_state() {
  cat > "$STATE_FILE" <<EOF
{
  "session_start": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "stt_status": "$STT_STATUS",
  "tts_status": "$TTS_STATUS",
  "mode": "voice-first",
  "silence_protocol": "pause-not-exit",
  "log_file": "$LOG_FILE",
  "last_activity": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

  printf "${GREEN}✅ Voice session state initialized${NC}\n"
  printf "${CYAN}📁 State: $STATE_FILE${NC}\n"
  printf "${CYAN}📝 Log: $LOG_FILE${NC}\n\n"
}

# Main execution
check_voice_services
init_session_state

printf "${YELLOW}⚠️  SCAFFOLD MODE - Full session management pending${NC}\n"
printf "${CYAN}This script will manage:${NC}\n"
echo "  • Voice service health monitoring"
echo "  • Session state persistence"
echo "  • Silence protocol enforcement"
echo "  • Voice/text mode transitions"
echo ""

printf "${GREEN}✅ Voice session ready for Claude Code integration${NC}\n"
printf "${CYAN}Auto-activated during Tier-1 boot via mcp__voicemode__converse${NC}\n\n"

log "Voice session manager initialized (scaffold mode)"
