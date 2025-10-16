## OPTIONAL ITEM 9: TEST DELIVERY SERVICE (10 MIN)

**WHY:** Verify everything works before production
**IMPACT:** Catch issues before customers see them
**DEPENDENCY:** Items 3 & 4 must be complete (API keys obtained)

**EXECUTE:**

```bash
# Start delivery service locally
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/delivery-service
npm start

# In new terminal, test health check:
curl http://localhost:4003/health

# Expected output:
{
  "service": "delivery-service",
  "status": "healthy",
  "providers": {
    "doordash": true,
    "uber": true
  }
}

# Test quote API:
curl -X POST http://localhost:4003/api/delivery/quote \
  -H "Content-Type: application/json" \
  -d '{
    "cartTotal": 75,
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "San Antonio",
      "state": "TX",
      "zip": "78228"
    }
  }'

# Expected output:
{
  "success": true,
  "provider": "doordash",
  "fee": 5.50,
  "estimatedMinutes": 45
}

# Test DoorDash Drive API integration:
curl -X POST http://localhost:4003/api/delivery/doordash/test \
  -H "Content-Type: application/json" \
  -d '{
    "test": true
  }'

# Expected output:
{
  "success": true,
  "api_connected": true,
  "endpoints_tested": [
    "POST /v2/deliveries",
    "GET /v2/deliveries/{id}",
    "POST /v2/deliveries/{id}/cancel",
    "GET /v2/deliveries/{id}/tracking"
  ]
}

# Additional DoorDash Drive API testing:
# 1. Use DoorDash Developer Portal Simulator
# 2. Advance delivery through stages: Created → Confirmed → Picked Up → Delivered
# 3. Test webhook endpoints for real-time updates
# 4. Verify JWT token generation and validation
```
```

**IF ERRORS:**
- Check .env file has all API keys
- Verify API keys are valid (not expired)
- Check console for error messages
- Report to Trinity for debug

**TIME:** 10 minutes
**COMPLETE:** [ ]

---
