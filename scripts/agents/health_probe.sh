#!/usr/bin/env bash
# scripts/agents/health_probe.sh
# Health check for MAX_AUTO stack: voice + 5 subagents + watcher
set -euo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
STATUS_DIR="$ROOT/tmp/agent_status"

echo "🏥 Tier-1 Health Probe"
echo "===================="
echo ""

# 1. Model check
if command -v claude >/dev/null 2>&1; then
  echo "✅ Claude CLI: $(claude --version 2>&1 | head -1)"
else
  echo "❌ Claude CLI: Not found"
fi

# 2. Node check
if command -v node >/dev/null 2>&1; then
  NODE_VERSION=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [[ "$NODE_MAJOR" -ge 20 ]]; then
    echo "✅ Node: v$NODE_VERSION (>= 20)"
  else
    echo "⚠️  Node: v$NODE_VERSION (< 20)"
  fi
else
  echo "❌ Node: Not found"
fi

# 3. Tmux sessions
echo ""
echo "📺 Tmux Sessions:"
if command -v tmux >/dev/null 2>&1; then
  SESSIONS=$(tmux ls 2>/dev/null || echo "")
  if [[ -n "$SESSIONS" ]]; then
    echo "$SESSIONS" | grep -E "(liv-voice|planning|research|artifact|execmon|qa)" || echo "⚠️  No agent sessions found"
  else
    echo "⚠️  No tmux sessions active"
  fi
else
  echo "❌ tmux: Not installed"
fi

# 4. Watcher PID
echo ""
echo "👁️  Voice Orchestrator Watcher:"
if [[ -f "$STATUS_DIR/voice_watcher.pid" ]]; then
  WATCHER_PID=$(cat "$STATUS_DIR/voice_watcher.pid")
  if kill -0 "$WATCHER_PID" 2>/dev/null; then
    echo "✅ Running (PID: $WATCHER_PID)"
  else
    echo "⚠️  PID file exists but process dead"
  fi
else
  echo "⚠️  No PID file"
fi

# 5. Status JSON validity
echo ""
echo "📋 Agent Status Files:"
for agent in voice planning research artifact exec qa; do
  STATUS_FILE="$STATUS_DIR/${agent}.status.json"
  if [[ -f "$STATUS_FILE" ]]; then
    if jq empty "$STATUS_FILE" 2>/dev/null; then
      STATUS=$(jq -r '.status // "unknown"' "$STATUS_FILE")
      echo "✅ $agent: $STATUS"
    else
      echo "❌ $agent: Invalid JSON"
    fi
  else
    echo "⚠️  $agent: No status file"
  fi
done

# 6. Funnel ready
echo ""
if [[ -f "$STATUS_DIR/funnel.ready" ]]; then
  echo "✅ Funnel Ready: YES"
else
  echo "⚠️  Funnel Ready: NO"
fi

echo ""
echo "===================="
echo "🏥 Health Probe Complete"
