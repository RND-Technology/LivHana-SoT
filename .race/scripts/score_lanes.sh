#!/usr/bin/env bash
set -euo pipefail

STATUS_DIR=".race/status"
PROFIT_FILE=".race/aggregate/profit_signal.json"
OUTPUT_FILE=".race/aggregate/scoreboard.json"

if [[ ! -d "$STATUS_DIR" ]]; then
  echo "Lane status directory missing at $STATUS_DIR" >&2
  exit 1
fi

if [[ ! -f "$PROFIT_FILE" ]]; then
  echo "Profit signal missing; run update_profit_signal.sh first" >&2
  exit 1
fi

python3 - <<PY
import glob
import json
from datetime import datetime, timezone
from pathlib import Path

status_dir = Path("$STATUS_DIR")
profit_path = Path("$PROFIT_FILE")

lanes = []
for path in sorted(status_dir.glob("lane*.json")):
    with path.open("r", encoding="utf-8") as handle:
        lanes.append(json.load(handle))

with profit_path.open("r", encoding="utf-8") as handle:
    profit = json.load(handle)

lane_count = len(lanes)
average_score = round(sum(lane.get("score", 0) for lane in lanes) / lane_count, 2) if lane_count else 0.0

scoreboard = {
    "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "lanes": lanes,
    "summary": {
        "lane_count": lane_count,
        "average_score": average_score,
        "pass_rate": profit.get("pass_rate", 0),
        "profit_signal": profit.get("profit_signal", 0)
    }
}

with Path("$OUTPUT_FILE").open("w", encoding="utf-8") as handle:
    json.dump(scoreboard, handle, indent=2)
    handle.write("\n")
PY

echo "Scoreboard written to $OUTPUT_FILE"
