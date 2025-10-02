#!/bin/bash
# Fix ALL 88 Cursor Linter Problems - TIER 1
set -e

cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/reasoning-gateway

TOKEN=$(node -e "
const jwt = require('jsonwebtoken');
const secret = 'tS1Z++Tz/+BOksxftGEQshU9tnrL/6ExFtA1F8kGFnZLVhRdhzIjmyW2X0tlILH7';
console.log(jwt.sign(
  { userId: 'jesse-admin', role: 'admin' },
  secret,
  { expiresIn: '24h', audience: 'livhana-local', issuer: 'livhana-local' }
));
")

echo "🔧 Deploying Autonomous Linter Cleanup Agent..."
echo "Target: 88 problems across 150 files"
echo ""

TASK_ID=$(curl -s -X POST "http://localhost:4002/api/autonomous/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Fix ALL 88 linter problems detected by Cursor across the codebase. Strategy: 1) Run npx eslint to get full problem list, 2) Group by file, 3) Fix each file systematically (unused vars, missing types, import order, console.logs, formatting), 4) Run tests after critical fixes, 5) Commit with detailed message. Create comprehensive report: reports/linter-fixes-complete.md",
    "context": {
      "type": "linter-cleanup",
      "scope": "all-files",
      "problem_count": 88,
      "file_count": 150,
      "priority": "tier1-cleanup",
      "require_tests": true
    }
  }' | jq -r '.taskId')

echo "✅ Linter cleanup agent deployed!"
echo "Task ID: $TASK_ID"
echo ""
echo "📊 Monitor:"
echo "   curl -s http://localhost:4002/api/autonomous/tasks/$TASK_ID -H \"Authorization: Bearer \$TOKEN\" | jq '.status'"
echo ""
echo "Expected: 30-60 min for 88 fixes + tests"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
