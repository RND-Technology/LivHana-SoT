#!/usr/bin/env bash
# scripts/calculate-health-score.sh
# Calculates composite health score (0-100) for Tier-1 environment.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

OUTPUT_FORMAT="table"
if [[ "${1:-}" == "--json" ]]; then
  OUTPUT_FORMAT="json"
  shift
fi

WEIGHT_MEMORY="${WEIGHT_MEMORY:-40}"
WEIGHT_QUEUE="${WEIGHT_QUEUE:-30}"
WEIGHT_QUARANTINE="${WEIGHT_QUARANTINE:-30}"
QUEUE_KEY="${QUEUE_KEY:-bull:voice-mode-reasoning-jobs:wait}"
MEM_WARN="${MEM_WARN:-35}"
MEM_CRIT="${MEM_CRIT:-20}"
QUEUE_WARN="${QUEUE_WARN:-25}"
QUEUE_CRIT="${QUEUE_CRIT:-75}"

calc_memory_pct() {
  if command -v memory_pressure >/dev/null 2>&1; then
    memory_pressure 2>/dev/null | awk -F': ' '/System-wide memory free percentage/ {gsub("%","",$2); print int($2)}'
    return
  fi
  if ! command -v vm_stat >/dev/null 2>&1; then
    echo ""
    return
  fi
  python3 - <<'PY' 2>/dev/null
import subprocess

try:
    output = subprocess.check_output(["vm_stat"], text=True)
except Exception:
    print("")
    raise SystemExit

values = {}
for line in output.splitlines():
    if ":" not in line:
        continue
    key, value = line.split(":", 1)
    key = key.strip().replace(" ", "_")
    try:
        values[key] = int(float(value.strip().rstrip(".")))
    except ValueError:
        continue

total = sum(v for k, v in values.items() if k.startswith("Pages"))
free = values.get("Pages_free", 0) + values.get("Pages_inactive", 0) + values.get("Pages_speculative", 0)
print(int(free * 100 / total) if total else "")
PY
}

memory_pct=$(calc_memory_pct)
queue_depth=""
if command -v redis-cli >/dev/null 2>&1; then
  queue_depth=$(redis-cli LLEN "$QUEUE_KEY" 2>/dev/null || echo "")
fi
quarantine_flag=0
if xattr -p com.apple.quarantine "/Applications/Visual Studio Code.app" >/dev/null 2>&1; then
  quarantine_flag=1
fi

score=100
memory_penalty=0
queue_penalty=0
quarantine_penalty=0

if [[ -n "$memory_pct" ]]; then
  if (( memory_pct < MEM_CRIT )); then
    memory_penalty="$WEIGHT_MEMORY"
    score=$((score - memory_penalty))
    memory_state="critical"
  elif (( memory_pct < MEM_WARN )); then
    memory_penalty=$((WEIGHT_MEMORY / 2))
    score=$((score - memory_penalty))
    memory_state="warning"
  else
    memory_state="normal"
  fi
else
  memory_state="unknown"
fi

if [[ "$queue_depth" =~ ^[0-9]+$ ]]; then
  if (( queue_depth > QUEUE_CRIT )); then
    queue_penalty="$WEIGHT_QUEUE"
    score=$((score - queue_penalty))
    queue_state="critical"
  elif (( queue_depth > QUEUE_WARN )); then
    queue_penalty=$((WEIGHT_QUEUE / 2))
    score=$((score - queue_penalty))
    queue_state="warning"
  else
    queue_state="normal"
  fi
else
  queue_state="unknown"
fi

if (( quarantine_flag == 1 )); then
  quarantine_penalty="$WEIGHT_QUARANTINE"
  score=$((score - quarantine_penalty))
  quarantine_state="present"
else
  quarantine_state="clear"
fi

(( score < 0 )) && score=0

if [[ "$OUTPUT_FORMAT" == "json" ]]; then
  python3 - <<PY
import json
payload = {
    "score": $score,
    "memory": {
        "freePercent": ${memory_pct or "None"},
        "state": "$memory_state",
        "penalty": $memory_penalty
    },
    "queue": {
        "depth": ${queue_depth or "None"},
        "state": "$queue_state",
        "penalty": $queue_penalty
    },
    "quarantine": {
        "state": "$quarantine_state",
        "penalty": $quarantine_penalty
    },
    "weights": {
        "memory": $WEIGHT_MEMORY,
        "queue": $WEIGHT_QUEUE,
        "quarantine": $WEIGHT_QUARANTINE
    }
}
print(json.dumps(payload, ensure_ascii=True))
PY
else
  printf '%-16s %s\n' "Metric" "Value"
  printf '%-16s %s\n' "----------------" "----------------"
  printf '%-16s %s\n' "Memory free %" "${memory_pct:-unknown}"
  printf '%-16s %s\n' "Memory state" "$memory_state"
  printf '%-16s -%s\n' "Memory penalty" "$memory_penalty"
  printf '%-16s %s\n' "Queue depth" "${queue_depth:-unknown}"
  printf '%-16s %s\n' "Queue state" "$queue_state"
  printf '%-16s -%s\n' "Queue penalty" "$queue_penalty"
  printf '%-16s %s\n' "Quarantine" "$quarantine_state"
  printf '%-16s -%s\n' "Quarantine penalty" "$quarantine_penalty"
  printf '%-16s %s\n' "----------------" "----------------"
  printf '%-16s %s\n' "Health score" "$score / 100"
fi

if (( score < 70 )); then
  exit 1
fi
