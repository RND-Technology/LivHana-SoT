#!/usr/bin/env bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1

# Evaluates router health from runtime_state.json (or similar).
# Expects JSON with recent_runs array of objects: { "latency_ms": N, "ok": true/false }
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=automation/scripts/lib_common.sh
. "${SCRIPT_DIR}/lib_common.sh"

STATE_FILE="${ROUTER_STATE_FILE:-automation/swarm/runtime_state.json}"
MAX_P95_MS="${ROUTER_MAX_P95_MS:-700}"
MAX_CONSEC_FAILS="${ROUTER_MAX_CONSEC_FAILS:-1}"

assert_repo_root
need_cmd jq

if [[ ! -f "$STATE_FILE" ]]; then
  fail "State file not found: $STATE_FILE"
  exit 30
fi

total=$(jq '.recent_runs | length' "$STATE_FILE" 2>/dev/null || echo 0)
if (( total == 0 )); then
  fail "No recent_runs data in $STATE_FILE"
  exit 30
fi

# Calculate p95 (simple approximate: sort and pick index)
p95_index=$(( (95 * total + 99) / 100 - 1 ))
p95_latency=$(jq -r ".recent_runs | map(.latency_ms) | sort | .[$p95_index]" "$STATE_FILE")
[[ "$p95_latency" == "null" || -z "$p95_latency" ]] && p95_latency=0

# Consecutive failures
consec_fail=$(jq -r '[.recent_runs[] | .ok] | reverse | reduce .[] as $i (0; if $i==false and .>=0 then .+1 elif $i==true then -100 else . end) ' "$STATE_FILE")
if (( consec_fail < 0 )); then consec_fail=0; fi

exit_code=0
if (( p95_latency > MAX_P95_MS )); then
  fail "Router p95 latency ${p95_latency}ms > ${MAX_P95_MS}ms"
  echo "::error title=Router Latency::p95 ${p95_latency} > ${MAX_P95_MS}"
  exit_code=30
else
  ok "Router p95 latency: ${p95_latency}ms"
fi

if (( consec_fail > MAX_CONSEC_FAILS )); then
  fail "Consecutive failures ${consec_fail} > allowed ${MAX_CONSEC_FAILS}"
  echo "::error title=Router Failures::${consec_fail} consecutive failures"
  exit_code=30
else
  ok "Consecutive failures: ${consec_fail}"
fi

exit $exit_code
# Last updated: 2025-10-02

# Last optimized: 2025-10-02
