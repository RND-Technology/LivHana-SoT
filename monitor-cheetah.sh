#!/bin/bash

# CHEETAH CONTINUOUS MONITOR
# Runs every 5 minutes, reports file changes and service status

REPORT_DIR=".claude/cheetah-reports"
mkdir -p "$REPORT_DIR"

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
REPORT_FILE="$REPORT_DIR/$(date '+%Y%m%d_%H%M').md"

echo "# CHEETAH MONITORING REPORT" > "$REPORT_FILE"
echo "**Timestamp**: $TIMESTAMP" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Recent file changes (last 5 minutes)
echo "## Files Modified (Last 5 Minutes)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
find backend/integration-service/src -name "*.js" -mmin -5 -exec ls -lh {} \; 2>/dev/null | \
  awk '{print "- `" $9 "` - " $6 " " $7 " " $8}' >> "$REPORT_FILE" || echo "No changes" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Git status
echo "## Git Status" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
git status --short 2>/dev/null | head -20 >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Recent commits
echo "## Recent Commits (Last Hour)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
git log --oneline --since="1 hour ago" 2>/dev/null | head -5 >> "$REPORT_FILE" || echo "No commits" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Service health (if running)
echo "## Service Health Check" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
  echo "✅ Integration service is **RUNNING**" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "\`\`\`json" >> "$REPORT_FILE"
  curl -s http://localhost:8080/health | jq '.' >> "$REPORT_FILE" 2>/dev/null || echo "{}" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
else
  echo "❌ Integration service is **NOT RUNNING**" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# Line count changes
echo "## Code Statistics" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| File | Lines |" >> "$REPORT_FILE"
echo "|------|-------|" >> "$REPORT_FILE"
for file in backend/integration-service/src/lib/durable-state.js \
            backend/integration-service/src/lib/cloud-tasks.js \
            backend/integration-service/src/index.js \
            backend/integration-service/src/routes/post-purchase-verification.js; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file" | tr -d ' ')
    echo "| \`$(basename $file)\` | $lines |" >> "$REPORT_FILE"
  fi
done
echo "" >> "$REPORT_FILE"

# Output to console
cat "$REPORT_FILE"
echo ""
echo "📊 Report saved: $REPORT_FILE"
