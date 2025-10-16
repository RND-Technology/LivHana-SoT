### Execute a Task

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add a new endpoint for user preferences",
    "context": {
      "endpoint": "/api/users/:id/preferences",
      "methods": ["GET", "PUT"],
      "includeTests": true
    },
    "requireApproval": true
  }'
```
