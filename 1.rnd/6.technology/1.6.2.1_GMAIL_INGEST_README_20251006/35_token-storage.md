### Token Storage

Tokens are stored locally with restricted permissions (0600). For production:

1. **1Password Integration:**

   ```bash
   # Store credentials in 1Password
   op item create \
     --category=secure-note \
     --title="Gmail API Credentials - Jessen" \
     --vault="Engineering"

   # Reference in credentials file
   echo "op://Engineering/Gmail API Credentials - Jessen/credential" > gmail_credentials_jessen.json
   ```

2. **Secret Manager (recommended):**

   ```bash
   # Store token in Secret Manager
   gcloud secrets create gmail-token-jessen \
     --data-file=gmail_token_jessen.json

   # Access in code
   const token = await secretManager.accessSecretVersion({
     name: 'projects/PROJECT_ID/secrets/gmail-token-jessen/versions/latest'
   });
   ```
