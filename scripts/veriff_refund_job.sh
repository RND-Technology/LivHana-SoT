#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
CFG="$ROOT/config/veriff.optimization.json"

hours=$(jq -r '.refund_window_hours' "$CFG")
dry=$(jq -r '.dry_run' "$CFG")

# Stub: select candidates (replace with DB query)
candidates=( "order_123" "order_456" )

echo "Refund window: ${hours}h; dry_run=${dry}"
echo "Candidates: ${candidates[*]}"

for oid in "${candidates[@]}"; do
  if [ "$dry" = "true" ]; then
    echo "[DRY] Would refund $oid and queue win-back"
  else
    echo "Refunding $oid ..."
    # TODO: call PSP API and send Gmail MCP template
  fi
done

echo "✅ veriff_refund_job completed"

