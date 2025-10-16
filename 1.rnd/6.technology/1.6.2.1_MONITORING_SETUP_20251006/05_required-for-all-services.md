### Required for All Services

```bash
# Node Environment
NODE_ENV=production  # or development, staging

# New Relic Configuration
NEW_RELIC_LICENSE_KEY=your_license_key_here
NEW_RELIC_APP_NAME=LivHana-Your-Service-Name
NEW_RELIC_LOG_LEVEL=info  # or debug for troubleshooting

# Sentry Configuration
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=production  # or development, staging
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions
SENTRY_PROFILES_SAMPLE_RATE=0.1  # 10% profiling

# Git commit (for release tracking)
GIT_COMMIT=$(git rev-parse HEAD)

# Logging
LOG_LEVEL=info  # debug, info, warn, error
```
