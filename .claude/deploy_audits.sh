#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

# Deploy 5 Parallel Codebase Audit Agents
set -e

cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/reasoning-gateway

# Generate token with production JWT secret
TOKEN=$(node -e "
const jwt = require('jsonwebtoken');
const secret = 'tS1Z++Tz/+BOksxftGEQshU9tnrL/6ExFtA1F8kGFnZLVhRdhzIjmyW2X0tlILH7';
console.log(jwt.sign(
  { userId: 'jesse-admin', role: 'admin' },
  secret,
  { expiresIn: '24h', audience: 'livhana-local', issuer: 'livhana-local' }
));
")

echo "🚀 Deploying 5 Parallel Audit Agents..."
echo "Token: ${TOKEN:0:20}..."

# Workstream 1: Backend Common
echo ""
echo "📦 Workstream 1: Backend Common Audit"
TASK1=$(curl -s -X POST "http://localhost:4002/api/autonomous/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Audit backend/common for code quality. Find: unused imports, legacy comments, inconsistent error handling, missing JSDoc, magic numbers. Create detailed report with file:line references. Save to reports/audit-backend-common.md",
    "context": {
      "type": "code-audit",
      "scope": "backend/common",
      "workstream": 1
    }
  }' | jq -r '.taskId')
echo "   Task ID: $TASK1"

# Workstream 2: Integration Service
echo ""
echo "🔌 Workstream 2: Integration Service Audit"
TASK2=$(curl -s -X POST "http://localhost:4002/api/autonomous/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Audit backend/integration-service/src for code quality. Find: API endpoint inconsistencies, missing error handling, validation gaps, security issues. Create report with recommendations. Save to reports/audit-integration-service.md",
    "context": {
      "type": "code-audit",
      "scope": "integration-service",
      "workstream": 2
    }
  }' | jq -r '.taskId')
echo "   Task ID: $TASK2"

# Workstream 3: Voice Service
echo ""
echo "🎤 Workstream 3: Voice Service Audit"
TASK3=$(curl -s -X POST "http://localhost:4002/api/autonomous/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Audit backend/voice-service for code quality and integration issues. Check: ElevenLabs integration, error handling, logging, environment variables. Create report. Save to reports/audit-voice-service.md",
    "context": {
      "type": "code-audit",
      "scope": "voice-service",
      "workstream": 3
    }
  }' | jq -r '.taskId')
echo "   Task ID: $TASK3"

# Workstream 4: Frontend Dashboard
echo ""
echo "🖥️  Workstream 4: Frontend Dashboard Audit"
TASK4=$(curl -s -X POST "http://localhost:4002/api/autonomous/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Audit frontend/vibe-cockpit/src/components for React best practices. Find: prop type issues, missing error boundaries, performance problems, accessibility gaps. Create report. Save to reports/audit-frontend-dashboard.md",
    "context": {
      "type": "code-audit",
      "scope": "frontend",
      "workstream": 4
    }
  }' | jq -r '.taskId')
echo "   Task ID: $TASK4"

# Workstream 5: Data Pipelines
echo ""
echo "🔀 Workstream 5: Data Pipelines Audit"
TASK5=$(curl -s -X POST "http://localhost:4002/api/autonomous/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Audit automation/data-pipelines for integration reliability. Check: error handling, retry logic, data validation, logging, BigQuery schema alignment. Create comprehensive report. Save to reports/audit-data-pipelines.md",
    "context": {
      "type": "code-audit",
      "scope": "data-pipelines",
      "workstream": 5
    }
  }' | jq -r '.taskId')
echo "   Task ID: $TASK5"

echo ""
echo "✅ Deployed 5 audit agents!"
echo ""
echo "📊 Monitor progress:"
echo "   curl -s http://localhost:4002/api/autonomous/tasks -H \"Authorization: Bearer \$TOKEN\" | jq '.tasks[] | {id: .taskId, status: .status, type: .context.type}'"
echo ""
echo "Task IDs: $TASK1 $TASK2 $TASK3 $TASK4 $TASK5"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
