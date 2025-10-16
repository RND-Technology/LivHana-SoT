### Test 1: Verify Age (Success)

```bash
curl -X POST http://localhost:3005/api/age-verification/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test-customer-001",
    "fullName": "Jane Test",
    "dateOfBirth": "1990-01-01",
    "idNumberLast4": "1234",
    "state": "TX"
  }'
```

Expected response (200):

```json
{
  "success": true,
  "verified": true,
  "verificationId": "av_...",
  "method": "full_verification",
  "age": 35,
  "expiresAt": "2026-01-01T00:00:00.000Z"
}
```
