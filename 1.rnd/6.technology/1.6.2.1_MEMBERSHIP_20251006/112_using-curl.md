### Using cURL

```bash
# 1. Subscribe to membership
curl -X POST http://localhost:3005/api/memberships/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerId": "CUST_TEST_001",
    "email": "test@example.com",
    "tier": "SILVER",
    "paymentMethod": {
      "id": "pm_test_card",
      "type": "card",
      "last4": "4242"
    }
  }'

# 2. Get membership
curl http://localhost:3005/api/memberships/CUST_TEST_001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Calculate discount
curl "http://localhost:3005/api/memberships/discount/CUST_TEST_001?subtotal=200.00" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Upgrade membership
curl -X PUT http://localhost:3005/api/memberships/CUST_TEST_001/upgrade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"newTier": "GOLD"}'

# 5. Get stats (admin only)
curl http://localhost:3005/api/memberships/stats \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# 6. Cancel membership
curl -X PUT http://localhost:3005/api/memberships/CUST_TEST_001/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"reason": "Testing cancellation"}'
```
