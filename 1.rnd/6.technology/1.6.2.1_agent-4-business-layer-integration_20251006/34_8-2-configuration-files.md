### 8.2 Configuration Files

**Environment Variables:**

- `/backend/integration-service/.env` - Integration service config
- `/backend/reasoning-gateway/.env` - Reasoning gateway config
- `/backend/common/.env` - Shared config (if exists)

**Key Environment Variables:**

**BigQuery:**

- `GCP_PROJECT_ID` - Google Cloud project
- `BQ_DATASET` - Commerce dataset (default: "commerce")
- `BQ_LOCATION` - BigQuery location (default: "US")
- `GOOGLE_APPLICATION_CREDENTIALS` - Service account key path
- `BQ_CACHE_TTL_MS` - Cache TTL (default: 30000)

**Square:**

- `SQUARE_ACCESS_TOKEN` - Square API token
- `SQUARE_LOCATION_ID` - Square location ID
- `SQUARE_API_VERSION` - API version (default: "2024-06-15")
- `SQUARE_SYNC_SCHEDULE` - Cron schedule (default: "*/15* ** *")

**LightSpeed:**

- `LIGHTSPEED_ACCOUNT_ID` - LightSpeed account ID
[REDACTED - SECURITY BREACH]
- `LIGHTSPEED_CLIENT_SECRET` - OAuth2 client secret
- `LIGHTSPEED_REFRESH_TOKEN` - OAuth2 refresh token
- `LIGHTSPEED_USE_MOCK` - Use mock data (default: "true")

**Redis:**

- `REDIS_HOST` - Redis host (default: "127.0.0.1")
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (optional)
- `REDIS_USE_TLS` - Enable TLS (default: "false")

**JWT:**

- `JWT_SECRET` - 256-bit secret key (REQUIRED)
- `JWT_AUDIENCE` - Token audience (default: "livhana-services")
- `JWT_ISSUER` - Token issuer (default: "livhana-auth")
- `JWT_EXPIRES_IN` - Token expiry (default: "24h")

**Payment Gateway (KAJA/Authorize.Net):**

- `AUTHORIZE_NET_API_LOGIN_ID` - API login ID
- `AUTHORIZE_NET_TRANSACTION_KEY` - Transaction key
- `AUTHORIZE_NET_SANDBOX` - Sandbox mode (default: "true")

---
