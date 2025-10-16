### 2. Rotate Regularly

```bash
# Rotate a secret in GCP
echo -n "new-secret-value" | gcloud secrets versions add JWT_SECRET --data-file=-

# Service will pick up new value on next rotation (max 24h)
# Or trigger immediate rotation via API/CLI
```
