#!/usr/bin/env bash
# Validates latest snapshot freshness & required JSON fields.
# Expects snapshots at docs/snapshots/YYYY/MM/snapshot_*.json
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "${SCRIPT_DIR}/lib_common.sh"

SNAP_DIR="docs/snapshots"
MAX_AGE_HOURS="${SNAPSHOT_MAX_AGE_HOURS:-26}"

assert_repo_root
need_cmd jq
need_cmd find
need_cmd date
need_cmd stat || true  # mac/linux differences

if [[ ! -d "$SNAP_DIR" ]]; then
  fail "Snapshot directory missing: $SNAP_DIR"
  exit 30
fi

latest_file=$(find "$SNAP_DIR" -type f -name 'snapshot_*.json' -print0 | xargs -0 ls -t 2>/dev/null | head -n1 || true)
if [[ -z "${latest_file:-}" ]]; then
  fail "No snapshot files found."
  exit 30
fi

# Freshness
now_epoch=$(date -u +%s)
file_epoch=$(date -u -r "$latest_file" +%s 2>/dev/null || stat -f %m "$latest_file")
age_hours=$(( (now_epoch - file_epoch) / 3600 ))

if (( age_hours > MAX_AGE_HOURS )); then
  fail "Snapshot stale: ${age_hours}h > ${MAX_AGE_HOURS}h ($latest_file)"
  echo "::error title=Stale Snapshot::Age ${age_hours}h > ${MAX_AGE_HOURS}h"
  exit 30
fi

# Required fields
required_fields=(timestamp_utc orchestration revenue compliance workflow_coverage)
missing_field=0
for f in "${required_fields[@]}"; do
  if ! jq -e ".${f}" "$latest_file" >/dev/null 2>&1; then
    fail "Missing field '$f' in $latest_file"
    missing_field=1
  fi
done

if (( missing_field )); then
  echo "::error title=Snapshot Schema Failure::Missing required fields"
  exit 30
fi

ok "Snapshot valid & fresh (${age_hours}h old): $latest_file"
# Last updated: 2025-10-02

# Last optimized: 2025-10-02

# Optimized: 2025-10-02
