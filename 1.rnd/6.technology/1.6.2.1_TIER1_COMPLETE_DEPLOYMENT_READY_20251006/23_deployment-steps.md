### Deployment Steps

```bash
# 1. Deploy to Cloud Run
gcloud run deploy voice-service --source=backend/voice-service
gcloud run deploy reasoning-gateway --source=backend/reasoning-gateway
gcloud run deploy integration-service --source=backend/integration-service

# 2. Point DNS
# herbitrage.com → Cloud Run URL
# livhana.ai → Cloud Run URL

# 3. Configure Cloudflare
# - Enable DDoS protection
# - Set up WAF rules
# - Deploy redirect lists (69 domains)

# 4. Test end-to-end
# - Place test order via LightSpeed
# - Verify KAJA payment processing
# - Check BigQuery ingestion

# 5. Enable monitoring
# - Cloud Monitoring alerts
# - BigQuery dashboard
# - Health check endpoints
```

---
