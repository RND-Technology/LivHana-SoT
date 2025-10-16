### 4. Principle of Least Privilege

```bash
# Grant secret access only to specific secrets
gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:livhana-secret-accessor@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---
