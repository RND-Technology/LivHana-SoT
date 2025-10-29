### Step 6: Test Complete Flow

```bash
# 1. Create test order in Lightspeed
# 2. Verify webhook received
# 3. Check order status updated to PENDING
# 4. Complete [PURGED_FALLACY] verification
# 5. Verify loyalty account created
# 6. Check order status updated to APPROVED

# Test endpoint:
curl -X POST http://localhost:3005/api/verification/check/CUST_TEST_001 \
  -H "Content-Type: application/json"
```

---
