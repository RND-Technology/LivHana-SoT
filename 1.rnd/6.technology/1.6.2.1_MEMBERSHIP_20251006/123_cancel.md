### Cancel

```bash
curl -X PUT http://localhost:3005/api/memberships/CUST_123/cancel \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "No longer needed"}'
```
