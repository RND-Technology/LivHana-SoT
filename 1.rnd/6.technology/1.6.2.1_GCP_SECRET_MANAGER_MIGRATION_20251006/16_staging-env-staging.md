#### Staging (.env.staging)

```bash
# Staging can use GCP or 1Password
NODE_ENV=staging
GCP_PROJECT_ID=livhana-staging
AUTO_ROTATE_SECRETS=true

# Fallback to 1Password if needed
JWT_SECRET=op://LivHana-Ops-Keys/JWT_SECRET/password
```
