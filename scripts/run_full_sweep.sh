#!/usr/bin/env bash
# Optimized: 2025-10-03
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1

set -euo pipefail

LOG_DIR=".evidence/$(date '+%Y-%m-%d')"
mkdir -p "$LOG_DIR"
RUN_TS=$(date '+%Y-%m-%d_%H-%M-%S')
LOG_FILE="$LOG_DIR/run_full_sweep_${RUN_TS}.log"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== LIV HANA FULL SWEEP @ ${RUN_TS} ==="

step() {
  echo
  echo "--- $1 ---"
}

step "Shellcheck (automation/scripts)"
find automation/scripts -type f -name '*.sh' -not -path '*node_modules*' \
  -exec shellcheck {} +

echo "Shellcheck completed"

step "Shellcheck (utility scripts)"
find automation/utility-scripts -type f -name '*.sh' -not -path '*node_modules*' \
  -exec shellcheck {} +

echo "Shellcheck utility scripts completed"

step "Markdownlint (docs)"
if command -v markdownlint-cli2 >/dev/null 2>&1; then
  npx markdownlint-cli2 "docs/**/*.md" || true
else
  echo "markdownlint-cli2 not installed; skipping"
fi

step "ESLint (frontend/vibe-cockpit)"
(cd frontend/vibe-cockpit && npx eslint .)

step "ESLint (backend/common)"
(cd backend/common && npx eslint .)

echo
echo "=== SWEEP COMPLETE ==="
echo "Log saved to $LOG_FILE"
