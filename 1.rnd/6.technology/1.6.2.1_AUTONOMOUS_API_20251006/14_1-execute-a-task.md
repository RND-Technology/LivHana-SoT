### 1. Execute a Task

```bash
TASK_ID=$(curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add input validation to the user registration endpoint",
    "context": {
      "endpoint": "/api/auth/register",
      "validations": ["email format", "password strength", "username length"]
    },
    "requireApproval": true
  }' | jq -r '.taskId')

echo "Task ID: $TASK_ID"
```
