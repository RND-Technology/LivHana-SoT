### Debugging

```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Check health
curl http://localhost:3005/health/age-verification

# Test verification (requires JWT)
curl -X POST http://localhost:3005/api/age-verification/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"test","fullName":"Test User","dateOfBirth":"1990-01-01","idNumberLast4":"1234","state":"TX"}'
```
