#!/usr/bin/env bash
set -euo pipefail
STATUS_DIR=".race/status"; OUT=".race/aggregate/scoreboard.json"
jq -n '[]' > "$OUT"
shopt -s nullglob
files=($STATUS_DIR/lane*.json)
if [ ${#files[@]} -eq 0 ]; then
  echo "No lane files; writing empty scoreboard to $OUT"
  jq -n '[]' > "$OUT"
  exit 0
fi
for f in "${files[@]}"; do
  lane=$(jq -r '.lane' "$f")
  p=$(jq -r '.profit_signal // 0' "$f")
  q=$(jq -r '.quality_pass // 0' "$f")
  s=$(jq -r '.speed_sec // 0' "$f")
  i=$(jq -r '.innovation // 0' "$f")
  sp=$(awk -v s="$s" 'BEGIN{t=600;score=100-(s/t*100); if(score<0)score=0; if(score>100)score=100; printf "%.2f", score}')
  total=$(awk -v P="$p" -v Q="$q" -v S="$sp" -v I="$i" 'BEGIN{print (P*0.40)+(Q*0.30)+(S*0.20)+(I*0.10)}')
  jq --arg lane "$lane" --argjson P "$p" --argjson Q "$q" --argjson S "$sp" --argjson I "$i" --argjson T "$total" \
     '. += [{"lane":$lane,"profit":$P,"quality":$Q,"speed":$S,"innovation":$I,"score":$T}]' "$OUT" > "$OUT.tmp" && mv "$OUT.tmp" "$OUT"
done
jq 'sort_by(-.score)' "$OUT" > "$OUT.tmp" && mv "$OUT.tmp" "$OUT"
