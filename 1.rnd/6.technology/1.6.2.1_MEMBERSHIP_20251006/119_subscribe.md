### Subscribe

```bash
curl -X POST http://localhost:3005/api/memberships/subscribe \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST_123",
    "email": "user@example.com",
    "tier": "SILVER",
    "paymentMethod": {"id": "pm_123"}
  }'
```
