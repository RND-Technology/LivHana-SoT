#!/usr/bin/env bash
set -euo pipefail
T=".race/aggregate/tests_matrix.json"; OUT=".race/aggregate/profit_signal.json"

# Sanitize inputs to avoid newlines in awk -v parameters
PR=$( (jq -r '.pass_rate // 0' "$T" 2>/dev/null || echo 0) | tr -d '\n' )
BS=$( (cat .race/aggregate/frontend_test_time.txt 2>/dev/null || echo 600) | tr -d '\n' )
IN=$( (grep -c 'INNOVATION:' .race/aggregate/meta_log.md 2>/dev/null || echo 0) | tr -d '\n' )

SS=$(awk -v s="$BS" 'BEGIN{b=600;raw=(1-(s/b))*100; if(raw<0)raw=0; if(raw>100)raw=100; printf "%.2f", raw}')
PF=$(awk -v p="$PR" -v ss="$SS" -v i="$IN" 'BEGIN{print (p*0.40)+(ss*0.30)+(i*0.30)}')

jq -n --arg pr "$PR" --arg ss "$SS" --arg in "$IN" --arg pf "$PF" \
'{timestamp:"'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'", pass_rate:($pr|tonumber), speed_score:($ss|tonumber), innovation_count:($in|tonumber), profit_signal:($pf|tonumber)}' > "$OUT"
echo "Wrote $OUT"; jq '.' "$OUT"
