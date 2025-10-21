#!/usr/bin/env bash
set -euo pipefail
OUT=".race/aggregate/comet_dashboard.json"
T=".race/aggregate/tests_matrix.json"; P=".race/aggregate/profit_signal.json"; S=".race/aggregate/scoreboard.json"
jq -n --arg ts "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  --argjson t "$(test -f "$T" && cat "$T" || jq -n '{}')" \
  --argjson p "$(test -f "$P" && cat "$P" || jq -n '{}')" \
  --argjson s "$(test -f "$S" && cat "$S" || jq -n '[]')" \
'{timestamp:$ts,tests:$t,profit:$p,scoreboard:$s,fusion_ready:( (($t.pass_rate//0)>=80) and (($p.profit_signal//0)>50) and ((($s|length)>=4)) )}' > "$OUT"
echo "Wrote $OUT"; jq '.' "$OUT"


