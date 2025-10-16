### 4.2 Configure Environment Secrets
```bash
# Example .env configuration
echo "GITHUB_TOKEN=\$(op read 'op://LivHana-Trinity-Local Development/GITHUB_TOKEN/password')" >> .env
echo "GCP_PROJECT_ID=reggieanddrodispensary" >> .env
echo "GCP_REGION=us-central1" >> .env
```
