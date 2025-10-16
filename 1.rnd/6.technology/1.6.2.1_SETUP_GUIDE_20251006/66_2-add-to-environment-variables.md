### 2. Add to Environment Variables

Add to `.env` for each service:

```bash
# New Relic
NEW_RELIC_LICENSE_KEY=eu01xxNRAL-your-key-here
NEW_RELIC_APP_NAME=LivHana-Your-Service-Name

# Sentry
SENTRY_DSN=https://your-key@o123456.ingest.us.sentry.io/789
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1

# Logging
NODE_ENV=production
LOG_LEVEL=info
```

See `/backend/.env.monitoring.template` for full template.
