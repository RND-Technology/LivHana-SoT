### 5. Approve Changes (if required)

```bash
curl -X POST http://localhost:4002/api/autonomous/approve/550e8400-... \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "reason": "Changes look good, tests passing"
  }'
```
