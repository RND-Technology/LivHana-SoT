### 1. Execute Task

Execute an autonomous task with AI-powered planning and execution.

**Endpoint:** `POST /api/autonomous/execute`

**Request Body:**

```json
{
  "task": "Add a new endpoint to handle user preferences",
  "context": {
    "service": "user-service",
    "database": "postgres",
    "requirements": [
      "Store user theme preference",
      "Include validation",
      "Add tests"
    ]
  },
  "requireApproval": true
}
```

**Response:** `202 Accepted`

```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "message": "Task queued for autonomous execution",
  "statusEndpoint": "/api/autonomous/tasks/550e8400-e29b-41d4-a716-446655440000",
  "streamEndpoint": "/api/autonomous/stream/550e8400-e29b-41d4-a716-446655440000"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Fix the authentication bug in login endpoint",
    "context": {
      "errorLog": "JWT validation failing for refresh tokens",
      "affectedEndpoint": "/api/auth/refresh"
    },
    "requireApproval": false
  }'
```

---
