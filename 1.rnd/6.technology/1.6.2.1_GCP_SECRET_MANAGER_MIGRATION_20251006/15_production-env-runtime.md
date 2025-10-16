#### Production (.env.runtime)

```bash
# Production uses GCP Secret Manager
NODE_ENV=production
GCP_PROJECT_ID=livhana-production
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/gcp-key.json
AUTO_ROTATE_SECRETS=true

# No secrets in .env - all loaded from GCP
```
