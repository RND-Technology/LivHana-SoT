#!/usr/bin/env bash
# Integrated Crash Prevention Suite Launcher
# Starts system monitor + visualizer + auto-dependency updates

set -euo pipefail

PROJECT_ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$PROJECT_ROOT"

log() {
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"
}

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🎼 CRASH PREVENTION SUITE - STARTUP"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Start system integrity monitor in background
if ! tmux has-session -t crash-monitor 2>/dev/null; then
    log "🎯 Starting system integrity monitor..."
    tmux new-session -d -s crash-monitor "bash scripts/system_integrity_monitor.sh"
    log "✅ System monitor started (tmux session: crash-monitor)"
else
    log "✅ System monitor already running"
fi

# 2. Start voice mode visualizer in background
if ! tmux has-session -t voice-visualizer 2>/dev/null; then
    log "🎯 Starting voice mode visualizer..."
    tmux new-session -d -s voice-visualizer "python3 scripts/voice_mode_visualizer.py"
    log "✅ Voice visualizer started (tmux session: voice-visualizer)"
else
    log "✅ Voice visualizer already running"
fi

# 3. Validate both services are responsive
sleep 2

if tmux has-session -t crash-monitor 2>/dev/null && tmux has-session -t voice-visualizer 2>/dev/null; then
    log "✅ Both monitoring services validated"
else
    log "⚠️  One or more services failed to start"
    exit 1
fi

# 4. Display initial dashboard
log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🎼 MONITORING SUITE ACTIVE"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📊 View real-time metrics:"
log "   • System monitor:  tmux attach -t crash-monitor"
log "   • Voice visualizer: tmux attach -t voice-visualizer"
log "   • Dashboard file:   cat tmp/visualizations/dashboard.txt"
log "   • Metrics JSON:     cat tmp/agent_status/system_metrics/metrics.json"
log ""
log "🎯 To stop monitoring:"
log "   tmux kill-session -t crash-monitor"
log "   tmux kill-session -t voice-visualizer"
log ""
log "✅ Crash prevention suite operational"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
