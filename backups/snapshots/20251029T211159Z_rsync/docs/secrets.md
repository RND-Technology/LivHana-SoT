# Secrets Management for Liv Hana

## Overview

This document describes how secrets are managed for Liv Hana services.

## 1Password Integration

### Primary Secrets Store
All secrets are stored in 1Password and accessed via `op run` command.

### Setup
1. Install 1Password CLI: `brew install --cask 1password-cli`
2. Authenticate: `op signin`
3. Link to vault: `op vault use "Liv Hana"`

### Usage
```bash
# Run command with secrets
op run --env-file=.env -- npm start

# Access specific secret
op item get jwt-secret --fields password

# Run with multiple secrets
op run --env-file=.env -- bash START.sh
```

## Environment Variables

### Required Secrets
- `JWT_SECRET`: JWT signing secret
- `ANTHROPIC_API_KEY`: Claude API key
- `LIGHTSPEED_TOKEN`: Lightspeed API token
- `GCP_PROJECT_ID`: Google Cloud project ID
- `REDIS_PASSWORD`: Redis password (if set)

### Optional Secrets
- `OPENAI_API_KEY`: OpenAI API key (voice mode)
- `STRIPE_SECRET_KEY`: Stripe API key
- `SENDGRID_API_KEY`: SendGrid API key

### Loading Secrets
```bash
# In scripts
export JWT_SECRET=$(op run --env-file=.env op item get jwt-secret --fields password)

# In docker-compose
secrets:
  jwt_secret:
    external: true
```

## Docker Secrets

### Configuration
```yaml
secrets:
  jwt_secret:
    external: true
  anthropic_key:
    external: true
```

### Usage
```bash
# Create secret
echo "my-secret" | docker secret create jwt_secret -

# Reference in service
services:
  voice-service:
    secrets:
      - jwt_secret
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
```

## Security Best Practices

### Never Hardcode Secrets
```javascript
// ❌ BAD
const API_KEY = 'sk-12345';

// ✅ GOOD
const API_KEY = process.env.ANTHROPIC_API_KEY;
```

### Use .env Files
```bash
# .env (gitignored)
JWT_SECRET=super-secret-key
ANTHROPIC_API_KEY=sk-12345

# Load via
source .env
```

### Rotate Secrets Regularly
- JWT secrets: Every 90 days
- API keys: Every 180 days
- Database passwords: Every 365 days

### Audit Access
```bash
# Check who accessed secrets
op item get jwt-secret --fields password --account "Liv Hana"

# Review 1Password audit log
op item list --vault "Liv Hana" --format json
```

## Guardrails

### Secret Validation
```javascript
// Check required secrets exist
const requiredSecrets = [
  'JWT_SECRET',
  'ANTHROPIC_API_KEY',
  'LIGHTSPEED_TOKEN'
];

for (const secret of requiredSecrets) {
  if (!process.env[secret]) {
    throw new Error(`Missing required secret: ${secret}`);
  }
}
```

### Rate Limiting
- API keys: Rate limited per service
- JWT tokens: Expire after 1 hour
- Refresh tokens: Expire after 7 days

### PII Protection
- Never log secrets
- Mask in error messages
- Encrypt sensitive data

## Troubleshooting

### Secrets Not Loading
1. Check 1Password authentication: `op whoami`
2. Verify vault access: `op vault list`
3. Check item exists: `op item list --vault "Liv Hana"`

### Authentication Errors
1. Re-authenticate: `op signin`
2. Check session: `op account list`
3. Verify permissions: `op item get jwt-secret`

### Environment Variable Issues
1. Check `.env` file exists
2. Verify format is correct
3. Review script loading logic

## Emergency Procedures

### Secret Exposure
1. Rotate immediately in 1Password
2. Update all services
3. Review audit logs
4. Notify team

### Lost Access
1. Contact 1Password admin
2. Use recovery codes
3. Reset credentials
4. Verify access

## Resources

- 1Password CLI: https://developer.1password.com/docs/cli
- Docker Secrets: https://docs.docker.com/engine/swarm/secrets/
- Environment Variables: https://12factor.net/config

