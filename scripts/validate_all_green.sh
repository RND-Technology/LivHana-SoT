#!/usr/bin/env bash
# scripts/validate_all_green.sh
# Validates ALL systems are green before voice session
set -euo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

echo "🏥 TIER-1 VALIDATION - ALL SYSTEMS CHECK"
echo "=========================================="
echo ""

FAILURES=0

# 1. Node version
NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [[ "$NODE_VER" -ge 20 ]]; then
  echo "✅ Node: v$(node -v) (>= 20)"
else
  echo "❌ Node: v$(node -v) (< 20)"
  ((FAILURES++))
fi

# 2. Claude CLI
if command -v claude >/dev/null 2>&1; then
  CLAUDE_VER=$(claude --version 2>&1 | head -1)
  echo "✅ Claude CLI: $CLAUDE_VER"
else
  echo "❌ Claude CLI: Not found"
  ((FAILURES++))
fi

# 3. 1Password
if command -v op >/dev/null 2>&1; then
  if op account get >/dev/null 2>&1; then
    echo "✅ 1Password: Signed in"
  else
    echo "⚠️  1Password: Not signed in (run: eval \"\$(op signin)\")"
    ((FAILURES++))
  fi
else
  echo "❌ 1Password CLI: Not installed"
  ((FAILURES++))
fi

# 4. Redis
if command -v redis-cli >/dev/null 2>&1; then
  if redis-cli PING 2>/dev/null | grep -q PONG; then
    echo "✅ Redis: Running"
  else
    echo "⚠️  Redis: Not running (start with: redis-server --daemonize yes)"
    ((FAILURES++))
  fi
else
  echo "❌ Redis CLI: Not installed"
  ((FAILURES++))
fi

# 5. Tmux sessions (5 expected)
echo ""
echo "📺 Tmux Sessions:"
if command -v tmux >/dev/null 2>&1; then
  SESSIONS=$(tmux ls 2>/dev/null | grep -E "(planning|research|artifact|execmon|qa)" | wc -l | tr -d ' ')
  if [[ "$SESSIONS" -eq 5 ]]; then
    echo "✅ All 5 agent sessions running"
    tmux ls | grep -E "(planning|research|artifact|execmon|qa)"
  else
    echo "⚠️  Only $SESSIONS/5 agent sessions running"
    tmux ls 2>/dev/null || echo "  (no sessions)"
    ((FAILURES++))
  fi
else
  echo "❌ tmux: Not installed"
  ((FAILURES++))
fi

# 6. Services health
echo ""
echo "🌐 Service Health:"
for service in "integration-service:3005" "voice-service:8080" "reasoning-gateway:4002"; do
  NAME="${service%%:*}"
  PORT="${service##*:}"
  if curl -sf "http://localhost:$PORT/health" >/dev/null 2>&1; then
    echo "✅ $NAME: UP (port $PORT)"
  else
    echo "⚠️  $NAME: DOWN (port $PORT)"
    ((FAILURES++))
  fi
done

# 7. Agent status files
echo ""
echo "📋 Agent Status Files:"
for agent in voice planning research artifact exec qa; do
  STATUS_FILE="$ROOT/tmp/agent_status/${agent}.status.json"
  if [[ -f "$STATUS_FILE" ]] && [[ -s "$STATUS_FILE" ]]; then
    if jq empty "$STATUS_FILE" 2>/dev/null; then
      STATUS=$(jq -r '.status // "unknown"' "$STATUS_FILE")
      echo "✅ $agent: $STATUS"
    else
      echo "❌ $agent: Invalid JSON"
      ((FAILURES++))
    fi
  else
    echo "⚠️  $agent: No status file or empty"
    ((FAILURES++))
  fi
done

# 8. Funnel ready
echo ""
if [[ -f "$ROOT/tmp/agent_status/funnel.ready" ]]; then
  echo "✅ Funnel: READY"
else
  echo "⚠️  Funnel: NOT READY (waiting for first loop)"
fi

# Summary
echo ""
echo "=========================================="
if [[ "$FAILURES" -eq 0 ]]; then
  echo "✅ ALL SYSTEMS GREEN - READY FOR VOICE MODE"
  exit 0
else
  echo "⚠️  $FAILURES ISSUES FOUND - See above for fixes"
  exit 1
fi

