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
