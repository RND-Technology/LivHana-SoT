### Pre-Deployment Tests

```bash
# 1. Run fallacy scan
node automation/validators/fallacy_scanner.js

# 2. Run data validator
node automation/validators/data_validator.js

# 3. Run dependency scanner
node automation/validators/dependency_scanner.js

# 4. Run backend tests
cd backend/voice-service && npm test
cd backend/reasoning-gateway && npm test

# 5. Run health checks
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:3005/health
```
