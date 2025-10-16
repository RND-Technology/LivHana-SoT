#### Tasks

1. **GCP Project Setup** (30 min)

   ```bash
   # Create project
   gcloud projects create livhana-production
   gcloud config set project livhana-production

   # Enable APIs
   gcloud services enable compute.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable bigquery.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   gcloud services enable redis.googleapis.com
   ```

2. **Frontend Layer Deployment** (90 min)
   - Build vibe-cockpit Docker image
   - Deploy to Cloud Run
   - Configure Cloud Load Balancer
   - Set up Cloud CDN
   - Deploy static sites to Cloud Storage
   - Configure SSL certificates (managed by Google)

3. **Verification** (30 min)
   - [ ] <https://reggieanddro.com> responds (Cloudflare → Cloud Run)
   - [ ] vibe-cockpit dashboard loads
   - [ ] SSL certificate valid
   - [ ] CDN cache working

**Deliverables:**

- Frontend layer live on Cloud Run
- Load balancer configured
- SSL certificates active
- Static sites deployed

---
