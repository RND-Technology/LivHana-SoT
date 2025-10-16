### Step 5: Setup Email Templates

```bash
# Configure email service with 4 templates:
# - verification_initial
# - verification_48h
# - verification_24h
# - verification_6h

# Test email sending:
curl -X POST http://localhost:3007/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "template": "verification_initial",
    "data": {
      "firstName": "Test",
      "orderId": "12345",
      "verificationUrl": "https://reggieanddro.com/verify?customer=TEST"
    }
  }'
```
