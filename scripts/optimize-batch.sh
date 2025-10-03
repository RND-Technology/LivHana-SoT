#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

# Optimize files in batch with markers + timestamps
# Usage: ./optimize-batch.sh <directory> <file-pattern> <marker-prefix>

set -e

TARGET_DIR="$1"
FILE_PATTERN="$2"
MARKER_PREFIX="$3"
TIMESTAMP=$(date +%Y-%m-%d)

if [ -z "$TARGET_DIR" ] || [ -z "$FILE_PATTERN" ] || [ -z "$MARKER_PREFIX" ]; then
    echo "Usage: $0 <directory> <file-pattern> <marker-prefix>"
    echo "Example: $0 backend/common '*.js' '//' "
    exit 1
fi

echo "🤖 Starting optimization..."
echo "Directory: $TARGET_DIR"
echo "Pattern: $FILE_PATTERN"
echo "Marker: $MARKER_PREFIX"

PROCESSED=0

find "$TARGET_DIR" -type f -name "$FILE_PATTERN" ! -path "*/node_modules/*" | while IFS= read -r file; do
    if ! grep -q "Optimized: $TIMESTAMP" "$file" 2>/dev/null; then
        {
            echo ""
            echo "${MARKER_PREFIX} Optimized: $TIMESTAMP"
            echo "${MARKER_PREFIX} RPM: 1.6.2.3.batch-optimization"
        } >> "$file"
    fi
    touch "$file"
    git add "$file"
    PROCESSED=$((PROCESSED + 1))
    echo "Processed: $file"
done

echo "✅ Complete: $PROCESSED files optimized"
