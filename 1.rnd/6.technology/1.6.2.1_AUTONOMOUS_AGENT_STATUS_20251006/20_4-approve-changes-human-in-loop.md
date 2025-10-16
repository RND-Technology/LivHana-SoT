### **4. Approve Changes (Human-in-Loop)**

```bash
curl -X POST http://localhost:4002/api/autonomous/approve/task-abc123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"approved": true, "notes": "Looks good!"}'
```
