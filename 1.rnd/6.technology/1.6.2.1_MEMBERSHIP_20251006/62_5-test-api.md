### 5. Test API

```bash
# Health check
curl http://localhost:3005/health

# Subscribe to membership (requires valid JWT)
curl -X POST http://localhost:3005/api/memberships/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerId": "CUST_TEST_001",
    "email": "test@example.com",
    "tier": "SILVER",
    "paymentMethod": {"id": "pm_test_card"}
  }'
```
