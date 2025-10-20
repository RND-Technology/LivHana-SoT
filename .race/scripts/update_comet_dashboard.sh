#!/usr/bin/env bash
set -euo pipefail

TESTS_FILE=".race/aggregate/tests.json"
PROFIT_FILE=".race/aggregate/profit_signal.json"
SCOREBOARD_FILE=".race/aggregate/scoreboard.json"
OUTPUT_FILE=".race/aggregate/comet_dashboard.json"

for file in "$TESTS_FILE" "$PROFIT_FILE" "$SCOREBOARD_FILE"; do
  if [[ ! -f "$file" ]]; then
    echo "Required aggregate artifact missing: $file" >&2
    exit 1
  fi
done

python3 - <<PY
import json
from datetime import datetime, timezone

def read(path):
    with open(path, 'r', encoding='utf-8') as handle:
        return json.load(handle)

tests = read("$TESTS_FILE")
profit = read("$PROFIT_FILE")
scoreboard = read("$SCOREBOARD_FILE")

pass_rate = tests.get("tests", {}).get("pass_rate", 0)
profit_signal = profit.get("profit_signal", 0)
lane_count = len(scoreboard.get("lanes", []))

fusion_ready = pass_rate >= 80 and profit_signal > 50 and lane_count >= 4

dashboard = {
    "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "tests": tests.get("tests", {}),
    "profit": profit,
    "scoreboard": scoreboard,
    "fusion_ready": fusion_ready
}

with open("$OUTPUT_FILE", "w", encoding="utf-8") as handle:
    json.dump(dashboard, handle, indent=2)
    handle.write("\n")
PY

echo "COMET dashboard written to $OUTPUT_FILE"
