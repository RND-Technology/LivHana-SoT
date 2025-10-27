#!/usr/bin/env bash
# Route long outputs to files instead of editor to prevent raw-* buffer creation
set -euo pipefail

# Usage: command | route_long_output.sh [output_file] [summary_lines]
# Defaults: output_file=docs/reports/output_$(date).log, summary_lines=20

OUTPUT_FILE="${1:-docs/reports/output_$(date +%Y%m%d_%H%M%S).log}"
SUMMARY_LINES="${2:-20}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Ensure output directory exists
mkdir -p "$(dirname "$ROOT/$OUTPUT_FILE")"

# Tee input to file and capture
INPUT=$(cat)
echo "$INPUT" > "$ROOT/$OUTPUT_FILE"

# Count lines
LINE_COUNT=$(echo "$INPUT" | wc -l | tr -d ' ')

# Print summary
echo "📄 Output routed to: $OUTPUT_FILE"
echo "📊 Total lines: $LINE_COUNT"
echo ""
echo "🔍 Preview (first $SUMMARY_LINES lines):"
echo "$INPUT" | head -n "$SUMMARY_LINES"

if [[ $LINE_COUNT -gt $SUMMARY_LINES ]]; then
  echo ""
  echo "... ($((LINE_COUNT - SUMMARY_LINES)) more lines in file)"
fi
