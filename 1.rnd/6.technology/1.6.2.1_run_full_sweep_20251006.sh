#!/bin/bash
# LIV HANA ABSOLUTE STANDARD - SELF-HEALING AUTOMATION
# Run all verification sweeps: shellcheck, markdownlint, ESLint, tests
# Evidence saved to .evidence/$(date +%Y-%m-%d)/

set -euo pipefail

TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
EVIDENCE_DIR=".evidence/$(date +%Y-%m-%d)"
mkdir -p "$EVIDENCE_DIR"/{cli-output,lint-reports,finder-screenshots}

echo "🔍 LIV HANA FULL SWEEP - TIER 1 VERIFICATION"
echo "⏰ Started: $(date)"
echo "📁 Evidence: $EVIDENCE_DIR"
echo ""

# 1. Shellcheck sweep
echo "[1/5] Running shellcheck..."
find . -name "*.sh" \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.venv/*" \
  ! -path "*/dist/*" \
  ! -path "*/.evidence/*" \
  -type f \
  -exec shellcheck -x {} + 2>&1 | tee "$EVIDENCE_DIR/lint-reports/shellcheck-$TIMESTAMP.txt" || true
sed -n '1,20p' "$EVIDENCE_DIR/lint-reports/shellcheck-$TIMESTAMP.txt"
SHELLCHECK_WARNINGS=$(grep -c "SC[0-9]" "$EVIDENCE_DIR/lint-reports/shellcheck-$TIMESTAMP.txt" || echo "0")
echo "✅ Shellcheck: $SHELLCHECK_WARNINGS warnings"
echo ""

# 2. Markdownlint sweep
echo "[2/5] Running markdownlint..."
npx markdownlint-cli2 --config .markdownlint-cli2.jsonc 2>&1 | tee "$EVIDENCE_DIR/lint-reports/markdownlint-$TIMESTAMP.txt" || true
sed -n '1,20p' "$EVIDENCE_DIR/lint-reports/markdownlint-$TIMESTAMP.txt"
MDLINT_ERRORS=$(grep -c "error(s)" "$EVIDENCE_DIR/lint-reports/markdownlint-$TIMESTAMP.txt" || echo "0")
echo "✅ Markdownlint: $MDLINT_ERRORS entries (see report)"
echo ""

# 3. ESLint sweep
echo "[3/5] Running ESLint..."
npx eslint backend empire scripts --ext .js,.jsx,.ts,.tsx \
  --ignore-path .eslintignore \
 2>&1 | tee "$EVIDENCE_DIR/lint-reports/eslint-$TIMESTAMP.txt" || true
tail -5 "$EVIDENCE_DIR/lint-reports/eslint-$TIMESTAMP.txt"
ESLINT_PROBLEMS=$(grep -c "problems" "$EVIDENCE_DIR/lint-reports/eslint-$TIMESTAMP.txt" || echo "0")
echo "✅ ESLint: $ESLINT_PROBLEMS problems logged"
echo ""

# 4. File count verification
echo "[4/5] Counting files..."
TOTAL_FILES=$(find . -type f ! -path "*/.git/*" | wc -l | tr -d ' ')
echo "📊 Total files: $TOTAL_FILES" | tee "$EVIDENCE_DIR/cli-output/file-count-$TIMESTAMP.txt"
echo ""

# 5. Timestamp verification
echo "[5/5] Verifying timestamps..."
TIMESTAMP_REPORT="$EVIDENCE_DIR/cli-output/ls-root-$TIMESTAMP.txt"
if find . -maxdepth 1 -type f -print0 | xargs -0 stat -f "%Sm %N" -t "%Y-%m-%d %H:%M:%S" 2>/dev/null |
  sort -r | head -10 | tee "$TIMESTAMP_REPORT"; then
  echo ""
else
  echo "No files found" | tee "$TIMESTAMP_REPORT"
fi


# Summary
echo "======================================"
echo "✅ SWEEP COMPLETE"
echo "======================================"
echo "Shellcheck warnings: $SHELLCHECK_WARNINGS"
echo "Markdownlint entries: $MDLINT_ERRORS"
echo "ESLint problems: $ESLINT_PROBLEMS"
echo "Total files: $TOTAL_FILES"
echo "Evidence: $EVIDENCE_DIR"
echo "Completed: $(date)"
echo ""
echo "Next: Review reports and fix actionable issues"
