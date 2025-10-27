#!/bin/bash
set -e

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
echo "🌿 Initializing..."
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
