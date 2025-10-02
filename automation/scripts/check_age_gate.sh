#!/usr/bin/env bash
# Scans frontend code for required 21+ age gate sentinel(s).
# Configurable via AGE_GATE_SENTINELS (comma-separated).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "${SCRIPT_DIR}/lib_common.sh"

SENTINELS_CSV="${AGE_GATE_SENTINELS:-<AgeGatePortal/>,data-age-gate=\"active\"}"
FRONTEND_DIR="${AGE_GATE_FRONTEND_DIR:-frontend}"
IFS=',' read -r -a SENTINELS <<< "$SENTINELS_CSV"

assert_repo_root
need_cmd grep

if [[ ! -d "$FRONTEND_DIR" ]]; then
  fail "Frontend directory not found: $FRONTEND_DIR"
  exit 90
fi

missing_any=0
for sentinel in "${SENTINELS[@]}"; do
  if ! grep -R --exclude-dir=node_modules -q "$sentinel" "$FRONTEND_DIR"; then
    fail "Sentinel missing: $sentinel"
    echo "::error title=Age Gate Missing::Sentinel '$sentinel' not found in $FRONTEND_DIR"
    missing_any=1
  else
    ok "Found sentinel: $sentinel"
  fi
done

if (( missing_any )); then
  exit 30
fi
ok "All age gate sentinels present."
# Last updated: 2025-10-02

# Last optimized: 2025-10-02
