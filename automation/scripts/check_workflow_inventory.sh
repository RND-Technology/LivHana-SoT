#!/usr/bin/env bash
# Verifies workflow inventory manifest completeness & ownership.
# Fails (exit 30) if manifest missing required fields or target count mismatch.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "${SCRIPT_DIR}/lib_common.sh"

TARGET_COUNT="${WORKFLOW_TARGET_COUNT:-25}"
MANIFEST_PATH="docs/scorecards/NSM_matrix.md"

assert_repo_root
need_cmd awk
need_cmd grep
need_cmd sed

if [[ ! -f "$MANIFEST_PATH" ]]; then
  fail "Workflow inventory manifest missing: $MANIFEST_PATH"
  echo "::error file=${MANIFEST_PATH}::Workflow inventory manifest missing"
  exit 30
fi

# Expect table rows like: | workflow_id | Defined | Verified | Automated | Owner |
# Skip header & separator lines.
rows_total=$(grep -E '^\|[^-]+' "$MANIFEST_PATH" | grep -v '^| *Workflow' | wc -l | tr -d ' ')
defined_count=$(grep -E '\| *Y *\|' "$MANIFEST_PATH" | wc -l | tr -d ' ' || true)

missing_owner=$(awk -F'|' '/^\|[^-]/{ if (NF>=6) { gsub(/^[ \t]+|[ \t]+$/,"",$6); if($6==""){print} } }' "$MANIFEST_PATH" | wc -l | tr -d ' ')
if (( missing_owner > 0 )); then
  fail "One or more workflow rows missing owner"
  echo "::error file=${MANIFEST_PATH},title=Missing Owners::${missing_owner} row(s) without owner"
  exit_code=30
else
  exit_code=0
fi

if (( rows_total < TARGET_COUNT )); then
  fail "Inventory rows ($rows_total) < target ($TARGET_COUNT)"
  echo "::error file=${MANIFEST_PATH},title=Insufficient Coverage::Have $rows_total need $TARGET_COUNT"
  exit_code=30
fi

ok "Workflow manifest present: $rows_total rows (defined: $defined_count)"
exit $exit_code
# Last updated: 2025-10-02

# Last optimized: 2025-10-02
