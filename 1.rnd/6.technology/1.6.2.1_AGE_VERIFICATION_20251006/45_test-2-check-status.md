### Test 2: Check Status

```bash
curl http://localhost:3005/api/age-verification/status/test-customer-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response (200):

```json
{
  "success": true,
  "verified": true,
  "verificationId": "av_...",
  "expired": false
}
```
