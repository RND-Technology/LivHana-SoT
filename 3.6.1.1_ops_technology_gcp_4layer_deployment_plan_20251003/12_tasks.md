#### Tasks

1. **Data Layer Setup** (60 min)

   ```bash
   # BigQuery datasets
   bq mk --dataset livhana-production:cannabis_data
   bq mk --dataset livhana-production:compliance_data

   # Cloud SQL (PostgreSQL)
   gcloud sql instances create livhana-db \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=us-central1

   # Memorystore (Redis)
   gcloud redis instances create livhana-cache \
     --size=1 \
     --region=us-central1
   ```

2. **Backend Services Deployment** (120 min)
   - Build Docker images for all services
   - Deploy integration-service
   - Deploy payment-service
   - Deploy reasoning-gateway
   - Deploy cannabis-service
   - Configure environment variables
   - Set up service-to-service authentication

3. **Integration Testing** (60 min)
   - [ ] LightSpeed sync working
   - [ ] KAJA/Authorize.Net payment flow
   - [ ] BigQuery data flowing
   - [ ] Redis cache operational

**Deliverables:**

- 4 backend services live
- Databases operational
- Service mesh configured
- All integrations verified

---
