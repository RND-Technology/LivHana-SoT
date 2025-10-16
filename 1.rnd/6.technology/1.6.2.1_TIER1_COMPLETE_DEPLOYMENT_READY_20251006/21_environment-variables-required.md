### Environment Variables (Required)

```bash
# JWT Configuration (MUST be same across all services)
JWT_SECRET=<generated with openssl rand -base64 64>
JWT_AUDIENCE=livhana-services
JWT_ISSUER=livhana-auth

# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# ElevenLabs
ELEVENLABS_API_KEY=<key from ElevenLabs dashboard>

# DeepSeek
DEEPSEEK_API_KEY=<key>
DEEPSEEK_BASE_URL=https://api.deepseek.com

# LightSpeed + KAJA (APPROVED 9/30!)
KAJA_API_KEY=<key>
KAJA_GATEWAY_ID=<gateway_id>
[REDACTED - SECURITY BREACH]
LIGHTSPEED_ACCOUNT_ID=<account_id>

# Square (legacy, sunset 9/30)
SQUARE_ACCESS_TOKEN=<token>
SQUARE_LOCATION_ID=<location_id>

# BigQuery
GCP_PROJECT_ID=<project_id>
BQ_DATASET=commerce
BQ_LOCATION=US

# CORS Origins (69 domains)
CORS_ORIGINS=https://herbitrage.com,https://livhana.ai,https://reggieanddro.com,...
```
