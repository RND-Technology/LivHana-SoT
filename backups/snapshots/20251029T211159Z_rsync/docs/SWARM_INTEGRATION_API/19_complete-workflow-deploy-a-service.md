### Complete Workflow: Deploy a Service

```bash
# 1. Submit deployment task
TASK_RESPONSE=$(curl -s -X POST http://localhost:8080/api/swarm/tasks \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deployment",
    "description": "Deploy voice-service to Cloud Run",
    "requiredCapabilities": ["deployment"],
    "priority": "high"
  }')

# Extract task ID
TASK_ID=$(echo $TASK_RESPONSE | jq -r '.task.id')
echo "Task ID: $TASK_ID"

# 2. Monitor progress
while true; do
  STATUS=$(curl -s -H "X-API-Key: test" \
    "http://localhost:8080/api/swarm/status/$TASK_ID" | jq -r '.status.status')

  echo "Status: $STATUS"

  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ]; then
    break
  fi

  sleep 5
done

# 3. Get final result
curl -H "X-API-Key: test" \
  "http://localhost:8080/api/swarm/status/$TASK_ID" | jq '.'
```
