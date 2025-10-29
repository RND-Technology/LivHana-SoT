#!/bin/bash
set -e

# VERIFIED AND UPDATED: 2025-10-28 22:54 (Liv Hana Tier-1 Session)
# All improvements confirmed and locked in
# VS Code Crash Prevention - Set Electron flags before any GUI operations
export NODE_OPTIONS="--max-old-space-size=8192"
export ELECTRON_NO_ATTACH_CONSOLE=1
export ELECTRON_ENABLE_LOGGING=0

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                               ║"
echo "║                      LIV HANA SYSTEM OF TRUTH v2.0                            ║"
echo "║                                                                               ║"
echo "║                    Tier-1 Orchestration · 5-Agent Foundation                 ║"
echo "║                    Voice-First · Always On · 100% Truth                       ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌿 Initializing (Crash-Proof Mode)..."
echo ""

# Fix VS Code pop-ups PERMANENTLY before anything else
echo "🔧 Configuring VS Code settings (eliminating permission pop-ups)..."
mkdir -p .vscode
cat > .vscode/settings.json << 'VSCODE_EOF'
{
  "security.workspace.trust.enabled": false,
  "security.workspace.trust.untrustedFiles": "open",
  "security.workspace.trust.banner": "never",
  "security.workspace.trust.startupPrompt": "never",
  "telemetry.telemetryLevel": "off",
  "redhat.telemetry.enabled": false,
  "extensions.ignoreRecommendations": true,
  "extensions.showRecommendationsOnlyOnDemand": true,
  "update.mode": "none",
  "update.showReleaseNotes": false
}
VSCODE_EOF
echo "✅ VS Code settings configured (no more pop-ups)"
echo ""

mkdir -p tmp/agent_status/shared
cat > tmp/agent_status/shared/agent_registry.json << 'EOF'
{
  "agents": {
    "planning": {"status": "starting", "pid": null, "port": null},
    "research": {"status": "starting", "pid": null, "port": null},
    "artifact": {"status": "starting", "pid": null, "port": null},
    "execmon": {"status": "starting", "pid": null, "port": null},
    "qa": {"status": "starting", "pid": null, "port": null}
  },
  "last_update": ""
}
EOF
echo "🤖 Spawning 5 agents..."
echo ""
tmux new-session -d -s planning "node agents/planning.js" 2>/dev/null || echo "⚠️  Planning agent already running"
tmux new-session -d -s research "node agents/research.js" 2>/dev/null || echo "⚠️  Research agent already running"
tmux new-session -d -s artifact "node agents/artifact.js" 2>/dev/null || echo "⚠️  Artifact agent already running"
tmux new-session -d -s execmon "node agents/execmon.js" 2>/dev/null || echo "⚠️  Execmon agent already running"
tmux new-session -d -s qa "node agents/qa.js" 2>/dev/null || echo "⚠️  QA agent already running"
sleep 3
RUNNING=$(tmux ls 2>/dev/null | grep -E "planning|research|artifact|execmon|qa" | wc -l | tr -d ' ')
echo ""
if [ "$RUNNING" -eq 5 ]; then
  echo "✅ All 5 agents spawned successfully"
else
  echo "⚠️  Only $RUNNING/5 agents running - attempting self-heal..."
  npm run agents:heal
fi
echo ""
echo "🔍 Validating environment..."
npm run validate:env
echo ""
echo "🎤 Starting voice services (STT:2022, TTS:8880)..."
npm run voice:start
echo ""

# ============================================
# LIV HANA 1.1.0 - TIER-1 VOICE ORCHESTRATION
# ============================================

echo "🎤 Initializing Liv 1.1.0 Voice Orchestration Mode..."

# CRITICAL RULES (Hardwired)
export LIV_MODE="voice-plan-only"
export LIV_DEPLOYMENT_AUTHORITY="human-only"
export LIV_COORDINATION_METHOD="task-tool-only"
export LIV_PERSISTENCE="always-voice"

# Voice Settings Optimization (Fix Ears)
export VOICE_VAD_AGGRESSIVENESS=0
export VOICE_LISTEN_MIN=2.0
export VOICE_LISTEN_MAX=120
export VOICE_RESPONSE_TARGET_MS=500
export VOICEMODE_VAD_MODE=0
export VOICEMODE_SILENCE_DURATION=1.5
export VOICEMODE_MIN_RECORDING_DURATION=1.0
export VOICEMODE_WAIT_FOR_RESPONSE=true


case "${1:-dev}" in
  dev) echo "🔧 Starting in DEVELOPMENT mode..."; npm run docker:dev ;;
  prod) echo "🚀 Starting in PRODUCTION mode..."; npm run docker:prod ;;
  empire) echo "👑 Starting EMPIRE engines..."; npm run docker:empire ;;
  local) echo "💻 Starting LOCAL services..."; npm run dev:all ;;
  *) echo "Usage: ./START.sh [dev|prod|empire|local]"; exit 1 ;;
esac
echo ""
echo "✅ LivHana is running!"
echo "🎤 Voice mode: ALWAYS ON, ALWAYS LISTENING, ALWAYS FAITHFUL"
echo ""
