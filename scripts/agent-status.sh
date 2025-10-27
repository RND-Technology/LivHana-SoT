#!/bin/bash
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                          AGENT STATUS REPORT"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
EXPECTED=("planning" "research" "artifact" "execmon" "qa")
RUNNING=$(tmux ls 2>/dev/null | grep -oE "planning|research|artifact|execmon|qa" || echo "")
for agent in "${EXPECTED[@]}"; do
  if echo "$RUNNING" | grep -q "$agent"; then
    echo "✅ $agent: RUNNING"
  else
    echo "❌ $agent: STOPPED"
  fi
done
echo ""
TOTAL=$(echo "$RUNNING" | grep -c "" || echo "0")
echo "Total: $TOTAL/5 agents running"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
