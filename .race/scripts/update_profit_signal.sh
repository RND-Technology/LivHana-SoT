#!/usr/bin/env bash
set -euo pipefail

TESTS_FILE=".race/aggregate/tests.json"
CI_FILE=".race/aggregate/lane2_ci_metrics.json"
OUTPUT_FILE=".race/aggregate/profit_signal.json"

if [[ ! -f "$TESTS_FILE" ]]; then
  echo "Test matrix not found; run generate_tests_matrix.sh first" >&2
  exit 1
fi

if [[ ! -f "$CI_FILE" ]]; then
  echo "Lane 2 CI metrics missing at $CI_FILE" >&2
  exit 1
fi

pass_rate=$(jq -r '.tests.pass_rate' "$TESTS_FILE")
speed_score=$(jq -r '.ci_pipeline.speed_score' "$CI_FILE")
innovation_count=$(jq -r '.metrics.innovation_count // .ci_pipeline.innovation_count // 0' "$CI_FILE")

# Weighting derived from Lane 2 baseline narrative
pass_weight=0.4
speed_weight=0.253
innovation_weight=5

profit_signal=$(python3 - <<PY
pass_rate = float($pass_rate)
speed_score = float($speed_score)
innovation = float($innovation_count)
profit = (pass_rate * $pass_weight) + (speed_score * $speed_weight) + (innovation * $innovation_weight)
print(round(profit, 3))
PY
)

cat > "$OUTPUT_FILE" <<JSON
{
  "generated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "pass_rate": $pass_rate,
  "speed_score": $speed_score,
  "innovation_count": $innovation_count,
  "weights": {
    "pass_rate": $pass_weight,
    "speed_score": $speed_weight,
    "innovation": $innovation_weight
  },
  "profit_signal": $profit_signal
}
JSON

echo "Profit signal written to $OUTPUT_FILE"
