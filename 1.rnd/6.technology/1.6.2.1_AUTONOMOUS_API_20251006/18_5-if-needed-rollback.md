### 5. (If needed) Rollback

```bash
curl -X POST http://localhost:4002/api/autonomous/rollback/$TASK_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Found edge case bug in production"
  }'
```

---
