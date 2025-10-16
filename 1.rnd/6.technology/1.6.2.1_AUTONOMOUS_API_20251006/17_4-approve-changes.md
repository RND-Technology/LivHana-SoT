### 4. Approve Changes

```bash
curl -X POST http://localhost:4002/api/autonomous/approve/$TASK_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "reason": "Validation logic looks correct, tests passing"
  }'
```
