### Secrets Not Loading

```bash
# Check GCP credentials
gcloud auth application-default print-access-token

# Verify service account permissions
gcloud secrets get-iam-policy JWT_SECRET

# Test 1Password CLI
op read "op://LivHana-Ops-Keys/JWT_SECRET/password"

# Check environment variables
env | grep GCP_PROJECT_ID
```
