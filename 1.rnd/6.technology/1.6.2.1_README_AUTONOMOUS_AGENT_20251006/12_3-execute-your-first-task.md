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
