### **6A. Create Simple Test Task**

```bash
curl -X POST "http://localhost:4002/api/autonomous/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Create a file called hello.txt in the project root with the message: Hello from Liv Hana autonomous agent! The date is $(date). All systems operational.",
    "context": {
      "service": "reasoning-gateway",
      "priority": "test",
      "auto_approve": false
    }
  }'
```

**Expected Response:**

```json
{
  "taskId": "task-abc123",
  "status": "executing",
  "streamUrl": "/api/autonomous/stream/task-abc123"
}
```
