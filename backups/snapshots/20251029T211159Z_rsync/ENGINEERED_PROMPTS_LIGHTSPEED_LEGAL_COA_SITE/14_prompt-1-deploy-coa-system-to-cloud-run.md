#### **Prompt 1: Deploy COA System to Cloud Run**

```
Deploy the Certificate of Analysis (COA) management system to Google Cloud Run for reggieanddro.com.

SERVICES TO DEPLOY:
1. COA API Service:
   - Backend API (Node.js/Express)
   - Port 8080
   - Public endpoint for Lightspeed site
   - Environment: production

2. COA Admin Dashboard:
   - Admin UI for managing COAs
   - Port 3000
   - Authenticated access only
   - Environment: production

3. COA Automation Worker:
   - Background job for PDF parsing
   - Cloud Functions or Cloud Run Jobs
   - Triggered by email/webhook
   - Environment: production

INFRASTRUCTURE:
- Cloud Run services in us-central1
- Cloud SQL PostgreSQL (or Firestore)
- Cloud Storage bucket for PDFs
- Cloud Load Balancer for custom domain
- Cloud CDN for PDF delivery

CONFIGURATION:
- Domain: coa.reggieanddro.com or legal.reggieanddro.com
- SSL certificate (Let's Encrypt or Google-managed)
- Environment variables from Secret Manager
- Min instances: 1 (always ready)
- Max instances: 10 (auto-scale)
- Memory: 1Gi per service
- CPU: 2 per service

DEPLOYMENT SCRIPT:
```bash
#!/bin/bash
# Deploy COA services to Cloud Run

gcloud run deploy coa-api \
  --source ./backend/coa-service \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=coa-database-url:latest"

gcloud run domain-mappings create \
  --service coa-api \
  --domain legal.reggieanddro.com
```

MONITORING:

- Uptime checks every 5 minutes
- Alert if response time >2 seconds
- Alert if error rate >1%
- Log aggregation in Cloud Logging

OUTPUT:

- Deployed services with URLs
- Health check endpoints
- Monitoring dashboard
- Deployment documentation

```
