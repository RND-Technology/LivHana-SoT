### Step 1: Create Secrets in GCP

```bash
#!/bin/bash
# migrate-secrets-to-gcp.sh

PROJECT_ID="your-project-id"

# JWT Secrets
echo -n "your-jwt-secret-here" | gcloud secrets create JWT_SECRET \
  --data-file=- --project=$PROJECT_ID

echo -n "livhana-api" | gcloud secrets create JWT_AUDIENCE \
  --data-file=- --project=$PROJECT_ID

echo -n "livhana-auth-service" | gcloud secrets create JWT_ISSUER \
  --data-file=- --project=$PROJECT_ID

# Square API
echo -n "your-square-token" | gcloud secrets create SQUARE_ACCESS_TOKEN \
  --data-file=- --project=$PROJECT_ID

# KAJA/LightSpeed
echo -n "your-kaja-key" | gcloud secrets create KAJA_API_KEY \
  --data-file=- --project=$PROJECT_ID

echo -n "your-kaja-secret" | gcloud secrets create KAJA_API_SECRET \
  --data-file=- --project=$PROJECT_ID

# DeepSeek (if needed)
echo -n "your-deepseek-key" | gcloud secrets create DEEPSEEK_API_KEY \
  --data-file=- --project=$PROJECT_ID

# Anthropic
echo -n "your-anthropic-key" | gcloud secrets create ANTHROPIC_API_KEY \
  --data-file=- --project=$PROJECT_ID

# Memory Encryption
openssl rand -hex 32 | gcloud secrets create MEMORY_ENCRYPTION_KEY \
  --data-file=- --project=$PROJECT_ID

# Age Verification
openssl rand -hex 16 | gcloud secrets create AGE_VERIFICATION_ENCRYPTION_KEY \
  --data-file=- --project=$PROJECT_ID

echo "All secrets created in GCP Secret Manager"
```
