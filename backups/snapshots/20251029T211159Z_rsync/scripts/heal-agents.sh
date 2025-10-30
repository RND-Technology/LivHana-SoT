#!/bin/bash
set -e
echo ""
echo "🔧 Self-healing agents..."
echo ""
EXPECTED=("planning" "research" "artifact" "execmon" "qa")
RUNNING=$(tmux ls 2>/dev/null | grep -oE "planning|research|artifact|execmon|qa" || echo "")
for agent in "${EXPECTED[@]}"; do
  if ! echo "$RUNNING" | grep -q "$agent"; then
    echo "⚠️  Agent $agent missing - respawning..."
    tmux new-session -d -s "$agent" "node agents/$agent.js"
    sleep 1
  else
    echo "✅ Agent $agent healthy"
  fi
done
echo ""
FINAL_COUNT=$(tmux ls 2>/dev/null | grep -E "planning|research|artifact|execmon|qa" | wc -l | tr -d ' ')
if [ "$FINAL_COUNT" -eq 5 ]; then
  echo "✅ Self-heal complete: All 5 agents running"
else
  echo "❌ Self-heal failed: Only $FINAL_COUNT/5 agents running"
  exit 1
fi
echo ""
