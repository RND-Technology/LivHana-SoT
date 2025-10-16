### Upgrade

```bash
curl -X PUT http://localhost:3005/api/memberships/CUST_123/upgrade \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newTier": "GOLD"}'
```
