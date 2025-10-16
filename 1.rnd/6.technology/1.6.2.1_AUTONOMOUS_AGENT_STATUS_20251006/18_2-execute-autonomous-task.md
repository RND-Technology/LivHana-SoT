### **2. Execute Autonomous Task**

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add a new API endpoint to handle user preferences",
    "context": {
      "service": "reasoning-gateway",
      "priority": "high"
    }
  }'
```

**Response:**

```json
{
  "taskId": "task-abc123",
  "status": "executing",
  "streamUrl": "/api/autonomous/stream/task-abc123"
}
```
