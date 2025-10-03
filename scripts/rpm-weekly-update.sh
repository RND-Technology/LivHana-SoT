#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

# RPM Weekly Update Script
# Updates all RPM DNA folder timestamps to current date
# Run every Monday morning as part of weekly planning

set -e

TODAY=$(date +%Y%m%d)
REPO_ROOT=$(git rev-parse --show-toplevel)

cd "$REPO_ROOT"

echo "🔄 RPM WEEKLY UPDATE - $(date +%Y-%m-%d)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count changes
UPDATED=0
UNCHANGED=0

# Find all RPM DNA formatted directories at root level
find . -maxdepth 1 -type d -name "[0-9]-*.*.*.*.*.*" | sort | while read dir; do
  # Extract all components except timestamp
  base=$(echo "$dir" | sed -E 's/\.[0-9]{8}$//')

  # Get current timestamp from directory name
  old_date=$(echo "$dir" | grep -oE '[0-9]{8}$' || echo "none")

  # Build new name with today's date
  new_name="${base}.${TODAY}"

  if [ "$dir" != "./$new_name" ]; then
    mv "$dir" "$new_name"
    echo "✅ Updated: $(basename "$dir") → $(basename "$new_name")"
    UPDATED=$((UPDATED + 1))
  else
    echo "⏭️  Unchanged: $(basename "$dir")"
    UNCHANGED=$((UNCHANGED + 1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY:"
echo "   Updated: $UPDATED folders"
echo "   Unchanged: $UNCHANGED folders"
echo ""
echo "🎯 CURRENT PRIORITY STACK RANK:"
echo ""
ls -1 | grep -E "^[0-9]-" | head -10 | nl -w2 -s'. '
echo ""
echo "💡 TIP: Focus on top 3 this week"
echo "📝 Next: Run weekly planning session and commit changes"
echo ""
echo "To commit:"
echo "  git add ."
echo "  git commit -m '📊 WEEKLY RPM: Stack rank updated $(date +%Y-%m-%d)'"
echo "  git push"
