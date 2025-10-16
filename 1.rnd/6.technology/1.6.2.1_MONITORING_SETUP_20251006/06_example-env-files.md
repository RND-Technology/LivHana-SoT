### Example .env Files

**backend/integration-service/.env**:

```bash
NODE_ENV=production
PORT=3005

# Monitoring
NEW_RELIC_LICENSE_KEY=eu01xxNRAL-your-key-here
NEW_RELIC_APP_NAME=LivHana-Integration-Service
SENTRY_DSN=https://your-key@o123456.ingest.us.sentry.io/789
SENTRY_ENVIRONMENT=production

# Existing configuration
REDIS_URL=redis://localhost:6379
BIGQUERY_PROJECT_ID=your-project
# ... rest of your config
```

**backend/reasoning-gateway/.env**:

```bash
NODE_ENV=production
PORT=4002

# Monitoring
NEW_RELIC_LICENSE_KEY=eu01xxNRAL-your-key-here
NEW_RELIC_APP_NAME=LivHana-Reasoning-Gateway
SENTRY_DSN=https://your-key@o123456.ingest.us.sentry.io/789
SENTRY_ENVIRONMENT=production

# Existing configuration
REDIS_URL=redis://localhost:6379
# ... rest of your config
```
