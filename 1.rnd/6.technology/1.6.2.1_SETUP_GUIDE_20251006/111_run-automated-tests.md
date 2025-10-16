### Run Automated Tests

```bash
# Unit tests
cd backend/integration-service
npm test -- rate-limit.test.js

# Live integration test
cd backend/integration-service
./scripts/test-rate-limiting.sh
```
