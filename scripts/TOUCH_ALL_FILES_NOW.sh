#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

# TOUCH ALL FILES - Update filesystem modification timestamps
# This makes Finder show today's time for ALL files

set -e

REPO_ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$REPO_ROOT" || exit

echo "🔥 TOUCHING ALL FILES - UPDATE FILESYSTEM TIMESTAMPS"
echo "===================================================="
echo ""

TOTAL=0

# Touch every file to update filesystem mtime
while IFS= read -r -d '' file; do
    touch "$file"
    TOTAL=$((TOTAL + 1))
    if (( TOTAL % 100 == 0 )); then
        echo "✅ Touched $TOTAL files..."
    fi
done < <(
    find . -type f \
        ! -path "*/node_modules/*" \
        ! -path "*/.git/*" \
        ! -path "*/venv/*" \
        ! -path "*/.next/*" \
        ! -path "*/dist/*" \
        ! -path "*/build/*" \
        ! -name "*.lock" \
        ! -name "*.log" -print0
)

echo ""
echo "===================================================="
echo "✅ ALL FILES TOUCHED"
echo ""
echo "Verify in Finder: All files should show current time"
echo ""
