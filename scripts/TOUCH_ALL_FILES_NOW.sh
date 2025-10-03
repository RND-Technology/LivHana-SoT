#!/bin/bash
# TOUCH ALL FILES - Update filesystem modification timestamps
# This makes Finder show today's time for ALL files

set -e

REPO_ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$REPO_ROOT"

echo "🔥 TOUCHING ALL FILES - UPDATE FILESYSTEM TIMESTAMPS"
echo "===================================================="
echo ""

TOTAL=0

# Touch every file to update filesystem mtime
find . -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/venv/*" \
    ! -path "*/.next/*" \
    ! -path "*/dist/*" \
    ! -path "*/build/*" \
    ! -name "*.lock" \
    ! -name "*.log" \
    -exec touch {} \; \
    -exec sh -c 'TOTAL=$((TOTAL + 1)); if [ $((TOTAL % 100)) -eq 0 ]; then echo "✅ Touched $TOTAL files..."; fi' \;

echo ""
echo "===================================================="
echo "✅ ALL FILES TOUCHED"
echo ""
echo "Verify in Finder: All files should show current time"
echo ""
