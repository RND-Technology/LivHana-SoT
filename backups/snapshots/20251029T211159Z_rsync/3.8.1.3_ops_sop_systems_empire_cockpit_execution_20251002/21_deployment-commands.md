### Deployment Commands

```bash
# Local development
npm install && npm run db:migrate && npm run dev

# Docker build + run
docker build -t empire-cockpit:latest .
docker run -p 5174:5174 empire-cockpit:latest

# GCP Cloud Run deployment
gcloud builds submit --tag gcr.io/PROJECT_ID/empire-cockpit
gcloud run deploy empire-cockpit --image gcr.io/PROJECT_ID/empire-cockpit --region us-central1
```

---
