#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
OUT=".race/aggregate/tests_matrix.json"
TEST_JSON=".race/aggregate/frontend_tests.json"
if [ ! -s "$TEST_JSON" ]; then
  echo "❌ No frontend_tests.json found; run the frontend test first." >&2
  exit 1
fi
jq '{
  timestamp: (now | todateiso8601),
  services: .services,
  passed: (.services | map(.passed) | add),
  total_tests: (.services | map(.total) | add),
  pass_rate: (
    ( .services | map(.total) | add ) as $total
    | (if $total == 0 then 0 else (100 * ( .services | map(.passed) | add ) / $total) end)
    | floor
  )
}' "$TEST_JSON" > "$OUT"
echo "✅ tests_matrix.json updated: $OUT"
