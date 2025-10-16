### 4. Test Locally

```bash
# Set test keys
export NEW_RELIC_LICENSE_KEY=your_key
export SENTRY_DSN=your_dsn
export NODE_ENV=development

# Start services
cd backend/integration-service
npm start

# Test health endpoints
curl http://localhost:3005/health
curl http://localhost:3005/ready
curl http://localhost:3005/metrics

# Generate test error
curl http://localhost:3005/test-error

# Run integration tests
cd ..
./test-monitoring.sh
```
