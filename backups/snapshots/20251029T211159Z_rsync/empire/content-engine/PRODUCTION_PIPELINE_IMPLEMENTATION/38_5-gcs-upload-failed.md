#### 5. GCS Upload Failed

**Error:** `Upload failed: permission denied`

**Solution:**

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Verify permissions
gcloud storage ls gs://hnc-episodes-prod/
```
