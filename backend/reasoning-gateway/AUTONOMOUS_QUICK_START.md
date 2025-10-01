# Autonomous Agent - Quick Start Guide

## 5-Minute Setup

### 1. Environment Setup (1 minute)

```bash
# Add to .env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env
echo "JWT_SECRET=your-secret-key" >> .env
echo "JWT_AUDIENCE=livhana-api" >> .env
echo "JWT_ISSUER=livhana-auth" >> .env
```

### 2. Start Service (1 minute)

```bash
cd backend/reasoning-gateway
npm install
npm start
```

Service starts on `http://localhost:4002`

### 3. Get Admin Token (1 minute)

```bash
# For testing, generate a test admin token
export ADMIN_JWT_TOKEN="your-admin-jwt-token"
```

### 4. Execute First Task (1 minute)

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add a simple hello world function",
    "requireApproval": false
  }'
```

### 5. Monitor Progress (1 minute)

```bash
# Get the taskId from the response above, then:
./example-sse-client.js <taskId> $ADMIN_JWT_TOKEN
```

## Common Tasks

### Execute a Bug Fix

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Fix the authentication timeout issue",
    "context": {
      "error": "JWT tokens expire after 1 hour instead of 24",
      "file": "backend/common/auth/middleware.js"
    },
    "requireApproval": false
  }'
```

### Add a New Feature

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add pagination to user list endpoint",
    "context": {
      "endpoint": "/api/users",
      "defaultLimit": 20,
      "maxLimit": 100
    },
    "requireApproval": true
  }'
```

### Check Agent Status

```bash
curl http://localhost:4002/api/autonomous/health \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" | jq
```

### List Recent Tasks

```bash
curl http://localhost:4002/api/autonomous/tasks?limit=10 \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" | jq
```

### View Learnings

```bash
curl http://localhost:4002/api/autonomous/learnings?limit=5 \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" | jq
```

## Approval Workflow

### 1. Execute Task with Approval

```bash
RESPONSE=$(curl -s -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Update database schema",
    "requireApproval": true
  }')

TASK_ID=$(echo $RESPONSE | jq -r '.taskId')
echo "Task ID: $TASK_ID"
```

### 2. Wait for Task to Complete

```bash
# Monitor with SSE client
./example-sse-client.js $TASK_ID $ADMIN_JWT_TOKEN

# OR poll status
while true; do
  STATUS=$(curl -s http://localhost:4002/api/autonomous/tasks/$TASK_ID \
    -H "Authorization: Bearer $ADMIN_JWT_TOKEN" | jq -r '.status')
  echo "Status: $STATUS"
  [[ "$STATUS" == "pending_approval" ]] && break
  sleep 2
done
```

### 3. Review Changes

```bash
curl http://localhost:4002/api/autonomous/tasks/$TASK_ID \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" | jq '.result.changes'
```

### 4. Approve or Reject

```bash
# Approve
curl -X POST http://localhost:4002/api/autonomous/approve/$TASK_ID \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"approved": true, "reason": "Looks good"}'

# OR Reject
curl -X POST http://localhost:4002/api/autonomous/approve/$TASK_ID \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"approved": false, "reason": "Need more testing"}'
```

## Emergency Rollback

```bash
# Rollback a completed task
curl -X POST http://localhost:4002/api/autonomous/rollback/$TASK_ID \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Found critical bug in production"}'
```

## Testing

### Run Full Test Suite

```bash
./test-autonomous-api.sh
```

### Test Specific Endpoint

```bash
# Test capabilities
curl http://localhost:4002/api/autonomous/capabilities \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" | jq

# Test health
curl http://localhost:4002/api/autonomous/health \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" | jq
```

## Troubleshooting

### Service Won't Start

```bash
# Check if port 4002 is available
lsof -i :4002

# Check environment variables
env | grep -E "ANTHROPIC|JWT"

# Check logs
tail -f logs/reasoning-gateway.log
```

### Tasks Failing

```bash
# Check agent health
curl http://localhost:4002/api/autonomous/health \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN"

# Check task details
curl http://localhost:4002/api/autonomous/tasks/$TASK_ID \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" | jq '.error, .recovery'

# Check service logs
tail -f logs/reasoning-gateway.log
```

### Authentication Issues

```bash
# Verify JWT token format
echo $ADMIN_JWT_TOKEN | cut -d. -f2 | base64 -d | jq

# Check if token has admin role
echo $ADMIN_JWT_TOKEN | cut -d. -f2 | base64 -d | jq '.role, .roles'

# Test token
curl http://localhost:4002/api/autonomous/health \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" -v
```

## Real-World Examples

### Example 1: Fix a Production Bug

```bash
# 1. Report the bug to the agent
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Fix the 500 error on user profile endpoint",
    "context": {
      "endpoint": "/api/users/:id/profile",
      "error": "TypeError: Cannot read property id of undefined",
      "stackTrace": "at getUserProfile (routes/users.js:45)",
      "frequency": "Happening on 30% of requests"
    },
    "requireApproval": false
  }' | jq -r '.taskId'
```

### Example 2: Add Monitoring

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add performance monitoring to all API endpoints",
    "context": {
      "metricsToTrack": ["responseTime", "errorRate", "throughput"],
      "alertThresholds": {
        "responseTime": "1000ms",
        "errorRate": "5%"
      },
      "destination": "Prometheus"
    },
    "requireApproval": true
  }' | jq
```

### Example 3: Database Optimization

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Optimize slow database queries in user service",
    "context": {
      "slowQueries": [
        "SELECT * FROM users WHERE created_at > ... (2500ms avg)",
        "SELECT * FROM orders WHERE user_id = ... (1800ms avg)"
      ],
      "database": "PostgreSQL",
      "maxQueryTime": "100ms",
      "addIndexes": true,
      "analyzeQueryPlans": true
    },
    "requireApproval": true
  }' | jq
```

## Best Practices

1. **Always use approval for production changes**
   ```javascript
   { "requireApproval": true }
   ```

2. **Provide detailed context**
   ```javascript
   {
     "task": "Fix bug",
     "context": {
       "error": "Exact error message",
       "file": "Specific file path",
       "reproduction": "Steps to reproduce"
     }
   }
   ```

3. **Monitor in real-time**
   ```bash
   ./example-sse-client.js $TASK_ID $ADMIN_JWT_TOKEN
   ```

4. **Review learnings regularly**
   ```bash
   curl http://localhost:4002/api/autonomous/learnings | jq
   ```

5. **Test in dev first**
   ```bash
   # Always test autonomous tasks in development before production
   ```

## Next Steps

- Read [Complete Documentation](./README_AUTONOMOUS_AGENT.md)
- Review [API Reference](./AUTONOMOUS_API.md)
- Run [Test Suite](./test-autonomous-api.sh)
- Explore [SSE Client](./example-sse-client.js)

## Support

- Health Check: `GET /api/autonomous/health`
- Service Status: `GET /health`
- View Logs: `tail -f logs/reasoning-gateway.log`
- Check Tasks: `GET /api/autonomous/tasks`

## Quick Reference Card

```
Execute Task:     POST   /api/autonomous/execute
Get Status:       GET    /api/autonomous/tasks/:id
Stream Progress:  GET    /api/autonomous/stream/:id
Approve Changes:  POST   /api/autonomous/approve/:id
Rollback:         POST   /api/autonomous/rollback/:id
Get Learnings:    GET    /api/autonomous/learnings
Get Capabilities: GET    /api/autonomous/capabilities
Health Check:     GET    /api/autonomous/health
```

---

**Pro Tip:** Bookmark this guide and keep your `ADMIN_JWT_TOKEN` in your environment for quick access!
