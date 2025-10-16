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
