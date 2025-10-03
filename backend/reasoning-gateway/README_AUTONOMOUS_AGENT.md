# Claude Autonomous Agent

## Overview

The Claude Autonomous Agent empowers Liv Hana with the ability to autonomously execute coding tasks, deploy changes, self-heal, and continuously learn from experience. This system combines Claude's extended thinking capabilities with a robust execution framework.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin API Request                         │
│              POST /api/autonomous/execute                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               ClaudeAutonomousAgent                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. Task Analysis (Extended Thinking)                 │  │
│  │     - Understand requirements                         │  │
│  │     - Identify risks                                  │  │
│  │     - Define success criteria                         │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  2. Execution Planning                                │  │
│  │     - Break down into steps                           │  │
│  │     - Define rollback strategy                        │  │
│  │     - Create testing plan                             │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  3. Autonomous Execution                              │  │
│  │     - Read/write files                                │  │
│  │     - Execute bash commands                           │  │
│  │     - Run tests                                       │  │
│  │     - Query databases                                 │  │
│  │     - Search codebase                                 │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  4. Verification                                      │  │
│  │     - Verify each step                                │  │
│  │     - Run comprehensive tests                         │  │
│  │     - Check success criteria                          │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  5. Learning & Improvement                            │  │
│  │     - Extract patterns                                │  │
│  │     - Store learnings in BigQuery                     │  │
│  │     - Improve future executions                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Human-in-the-Loop Approval                      │
│          (Optional, configurable per task)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Deployment                                │
│            (or Rollback if rejected)                         │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Autonomous Task Execution

- AI-powered analysis and planning
- Step-by-step execution with verification
- Self-healing on errors
- Automatic rollback on failures

### 2. Real-Time Progress Tracking

- Server-Sent Events (SSE) for live updates
- Detailed progress percentages
- Current step visibility
- ETA calculations

### 3. Human-in-the-Loop

- Optional approval workflow
- Review changes before deployment
- Approve or reject with reasons
- Emergency rollback capability

### 4. Learning & Self-Improvement

- Learns from every execution
- Stores patterns in BigQuery
- Improves over time
- Shares learnings across instances

### 5. Security & Safety

- Admin-only access
- Git-based rollback
- Sandboxed execution
- Comprehensive audit logs

## Quick Start

### 1. Environment Setup

```bash
# Required
export ANTHROPIC_API_KEY=sk-ant-...
export JWT_SECRET=your-secret-key
export JWT_AUDIENCE=livhana-api
export JWT_ISSUER=livhana-auth

# Optional (for enhanced features)
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
export GITHUB_TOKEN=ghp_...
export REDIS_URL=redis://localhost:6379
```

### 2. Start the Service

```bash
cd backend/reasoning-gateway
npm install
npm start
```

The service will be available at `http://localhost:4002`

### 3. Execute Your First Task

```bash
# Set your admin token
export ADMIN_JWT_TOKEN="your-admin-jwt-token"

# Execute a simple task
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add a new health check endpoint to the API",
    "context": {
      "endpoint": "/health/detailed",
      "includeMemoryUsage": true,
      "includeDatabaseStatus": true
    },
    "requireApproval": true
  }'
```

Response:

```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "statusEndpoint": "/api/autonomous/tasks/550e8400-...",
  "streamEndpoint": "/api/autonomous/stream/550e8400-..."
}
```

### 4. Monitor Progress

#### Option A: Real-time SSE Stream (Recommended)

```bash
# Using the included SSE client
./example-sse-client.js 550e8400-e29b-41d4-a716-446655440000 $ADMIN_JWT_TOKEN
```

#### Option B: Polling

```bash
# Poll for status
watch -n 2 "curl -s http://localhost:4002/api/autonomous/tasks/550e8400-... \
  -H 'Authorization: Bearer $ADMIN_JWT_TOKEN' | jq '.status, .progress, .currentStep'"
```

### 5. Approve Changes (if required)

```bash
curl -X POST http://localhost:4002/api/autonomous/approve/550e8400-... \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "reason": "Changes look good, tests passing"
  }'
```

## Usage Examples

### Example 1: Bug Fix

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Fix the JWT token expiration bug in auth middleware",
    "context": {
      "errorMessage": "Token validation fails after 1 hour instead of 24 hours",
      "affectedFile": "backend/common/auth/middleware.js",
      "expectedBehavior": "Tokens should be valid for 24 hours"
    },
    "requireApproval": false
  }'
```

### Example 2: New Feature

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add pagination support to the user list endpoint",
    "context": {
      "endpoint": "/api/users",
      "parameters": {
        "limit": "default 20, max 100",
        "offset": "default 0"
      },
      "addTests": true,
      "updateDocs": true
    },
    "requireApproval": true
  }'
```

### Example 3: Code Refactoring

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Refactor duplicate error handling code into a shared utility",
    "context": {
      "targetFiles": [
        "backend/voice-service/src/index.js",
        "backend/reasoning-gateway/src/index.js",
        "backend/integration-service/src/index.js"
      ],
      "createUtility": "backend/common/errors/handler.js",
      "ensureTestsContinueToPass": true
    },
    "requireApproval": true
  }'
```

### Example 4: Database Migration

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Create a database migration to add a new user preferences table",
    "context": {
      "database": "postgres",
      "table": "user_preferences",
      "columns": {
        "user_id": "UUID PRIMARY KEY",
        "theme": "VARCHAR(20)",
        "notifications_enabled": "BOOLEAN DEFAULT true",
        "language": "VARCHAR(10) DEFAULT en"
      },
      "createIndexOn": ["user_id"],
      "addForeignKey": "users(id)"
    },
    "requireApproval": true
  }'
```

## API Endpoints

See [AUTONOMOUS_API.md](./AUTONOMOUS_API.md) for complete API documentation.

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/autonomous/execute` | Execute a new autonomous task |
| GET | `/api/autonomous/tasks/:taskId` | Get task status and results |
| GET | `/api/autonomous/stream/:taskId` | SSE stream for real-time updates |
| GET | `/api/autonomous/learnings` | Get learned patterns |
| GET | `/api/autonomous/capabilities` | Get agent capabilities |
| POST | `/api/autonomous/approve/:taskId` | Approve/reject changes |
| POST | `/api/autonomous/rollback/:taskId` | Emergency rollback |
| GET | `/api/autonomous/tasks` | List all tasks |
| DELETE | `/api/autonomous/tasks/:taskId` | Cancel a task |
| GET | `/api/autonomous/health` | Health check |

## Testing

### Run Automated Tests

```bash
# Run the comprehensive test suite
./test-autonomous-api.sh
```

This script tests:

- Agent capabilities
- Task execution
- Status monitoring
- Progress tracking
- Approval workflow
- Error handling
- Filtering and pagination
- Health checks

### Manual Testing with SSE Client

```bash
# Terminal 1: Execute a task
TASK_ID=$(curl -s -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"task": "Create a hello world test"}' | jq -r '.taskId')

# Terminal 2: Monitor with SSE client
./example-sse-client.js $TASK_ID $ADMIN_JWT_TOKEN
```

## Agent Capabilities

The autonomous agent can perform:

### File Operations

- Read any file in the codebase
- Write/modify files
- Create new files
- Search across codebase

### Code Execution

- Run bash commands
- Execute tests (npm test, pytest, etc.)
- Run build processes
- Execute database queries

### Analysis

- Search for patterns in code
- Analyze logs
- Generate reports
- Query BigQuery for insights

### Deployment

- Build applications
- Run health checks
- Deploy to staging/production (configurable)

## Security Considerations

### Admin-Only Access

All autonomous endpoints require:

1. Valid JWT token
2. Admin role in JWT claims

```javascript
// JWT must contain:
{
  "role": "admin"  // or
  "roles": ["admin"]
}
```

### Sandboxing

- Commands run in restricted environment
- File access limited to project directories
- No access to system files
- Timeout enforcement (max 10 minutes)

### Audit Trail

Every action is logged with:

- User ID who initiated
- Timestamp
- Task description
- Changes made
- Approval/rejection decisions

### Rollback Safety

- Git-based rollback for file changes
- Automatic rollback on step failures
- Manual emergency rollback available
- Test verification after rollback

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...        # Claude API key
JWT_SECRET=secret                    # JWT signing secret
JWT_AUDIENCE=livhana-api            # JWT audience
JWT_ISSUER=livhana-auth             # JWT issuer

# Optional Features
ENABLE_BIGQUERY_MEMORY=true         # Enable BigQuery learning storage
GOOGLE_APPLICATION_CREDENTIALS=...  # BigQuery credentials
ENABLE_SELF_IMPROVEMENT=true        # Enable self-improvement loop

# Limits
MAX_CONCURRENT_TASKS=5              # Max parallel tasks
TASK_TIMEOUT_MS=600000              # 10 minutes
MAX_FILE_SIZE_MB=10                 # Max file size to read/write
```

### Task Configuration

```javascript
{
  "task": "Description of what to do",
  "context": {
    // Additional context for the agent
  },
  "requireApproval": true,  // Require human approval before deployment
  "timeout": 300000,        // Task timeout in ms (optional)
  "priority": "high"        // Task priority (optional)
}
```

## Monitoring & Observability

### Health Checks

```bash
# Service health
curl http://localhost:4002/health

# Autonomous agent health
curl http://localhost:4002/api/autonomous/health \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN"
```

### Metrics

The agent tracks:

- Total tasks executed
- Success rate
- Average execution time
- Tasks pending approval
- Failed tasks
- Learnings accumulated

### Logs

All operations are logged with structured logging:

```json
{
  "level": "info",
  "taskId": "550e8400-...",
  "action": "executeStep",
  "step": 3,
  "totalSteps": 5,
  "timestamp": "2025-10-01T12:00:00.000Z"
}
```

## Troubleshooting

### Task Stuck in "Executing" State

1. Check agent health: `GET /api/autonomous/health`
2. Review logs for errors
3. Verify ANTHROPIC_API_KEY is valid
4. Check if task timeout exceeded
5. Cancel and retry: `DELETE /api/autonomous/tasks/:taskId`

### Approval Not Working

1. Verify task status is `pending_approval`
2. Check JWT token has admin role
3. Verify request body format:

   ```json
   {"approved": true, "reason": "..."}
   ```

### Rollback Fails

1. Check git status: `git status`
2. Verify files still exist
3. Manual rollback: `git checkout <files>`
4. Review error logs for details

### SSE Connection Issues

1. Verify task exists
2. Check firewall/proxy settings
3. Ensure no buffering middleware
4. Use `-N` flag with curl: `curl -N ...`

## Best Practices

### 1. Use Approval for Production Changes

```javascript
{
  "task": "Update production database schema",
  "requireApproval": true  // Always for production
}
```

### 2. Provide Rich Context

```javascript
{
  "task": "Fix the bug",
  "context": {
    "errorMessage": "Exact error message",
    "affectedEndpoint": "/api/users",
    "stepsToReproduce": ["1. Login", "2. Click users"],
    "expectedBehavior": "Should return user list",
    "actualBehavior": "Returns 500 error"
  }
}
```

### 3. Monitor in Real-Time

Use SSE streaming instead of polling for better UX and reduced server load.

### 4. Review Learnings Regularly

```bash
curl http://localhost:4002/api/autonomous/learnings?limit=50 \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" | jq
```

### 5. Test in Development First

Always test autonomous tasks in development before production.

## Contributing

### Adding New Capabilities

1. Add capability to `ClaudeAutonomousAgent`:

```javascript
// In claude-autonomous-agent.js
this.capabilities.add('my_new_capability');
```

2. Implement the action:

```javascript
async myNewCapabilityAction(parameters) {
  // Implementation
  return { result: 'success', data: {} };
}
```

3. Add to executeStep switch:

```javascript
case 'my_new_capability':
  return await this.myNewCapabilityAction(step.parameters);
```

### Running Tests

```bash
# Integration tests
npm test

# API tests
./test-autonomous-api.sh

# Load tests (if available)
npm run test:load
```

## FAQ

**Q: Can the agent modify any file in the system?**
A: No, file access is restricted to the project directory only.

**Q: What happens if a task fails?**
A: The agent automatically attempts rollback and provides a recovery plan.

**Q: Can I run multiple tasks simultaneously?**
A: Yes, up to MAX_CONCURRENT_TASKS (default: 5) can run in parallel.

**Q: How long are task results stored?**
A: Currently stored in memory. In production, implement Redis or database storage.

**Q: Can the agent access external APIs?**
A: Yes, if configured, it can make HTTP requests and query databases.

**Q: Is the learning data shared across instances?**
A: Yes, if BigQuery is enabled, learnings are shared across all instances.

**Q: Can I customize the approval workflow?**
A: Yes, implement custom approval logic in the approve endpoint handler.

## Resources

- [Complete API Documentation](./AUTONOMOUS_API.md)
- [SSE Client Example](./example-sse-client.js)
- [Test Suite](./test-autonomous-api.sh)
- [Claude API Docs](https://docs.anthropic.com/)

## Support

For issues or questions:

1. Check `/api/autonomous/health`
2. Review service logs
3. Check ANTHROPIC_API_KEY validity
4. Verify admin JWT token
5. Review [Troubleshooting](#troubleshooting) section

## License

Part of the LivHana Trinity project.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->
