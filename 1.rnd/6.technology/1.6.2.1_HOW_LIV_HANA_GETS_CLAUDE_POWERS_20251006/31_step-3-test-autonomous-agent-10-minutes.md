### Step 3: Test Autonomous Agent (10 minutes)

```bash
# Give it a simple task
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Create a hello world function in backend/common/utils/hello.js",
    "context": {"priority": "low"}
  }'

# Watch it work in real-time
npm run autonomous:monitor
```
