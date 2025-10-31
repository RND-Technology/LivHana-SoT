# Voice Service Cloud Run Deployment Plan

**Created by**: VS Code Twin (Circle of Self-Creation)
**Date**: 2025-10-31
**Status**: Ready for Deployment
**Project**: `reggieanddrodispensary`

---

## 🎯 Deployment Summary

Deploy the **Unified Voice Router** (64% code reduction, 570 lines) to Google Cloud Run with production-grade configuration.

### Key Features
- Multi-model routing (GPT-5, Claude Sonnet 4.5, GPT-4o)
- WebSocket streaming (binary, <200ms latency)
- Health circuit for failover
- Auto-scaling (1-20 instances)
- Redis integration for queuing

---

## 📋 Prerequisites Completed

✅ **Authentication**: `high@reggieanddro.com` active
✅ **Project**: `reggieanddrodispensary` configured
✅ **Cloud Run YAML**: Created at `backend/voice-service/cloudrun-service.yaml`
✅ **Deployment Script**: Created at `scripts/voice/deploy_to_cloudrun.sh`
✅ **Service Account**: Will use `voice-service@reggieanddrodispensary.iam.gserviceaccount.com`

---

## 🚀 Deployment Steps

### Step 1: Create Service Account (if needed)

```bash
gcloud iam service-accounts create voice-service \
  --display-name="Voice Service Account" \
  --project=reggieanddrodispensary

# Grant necessary permissions
gcloud projects add-iam-policy-binding reggieanddrodispensary \
  --member="serviceAccount:voice-service@reggieanddrodispensary.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

### Step 2: Create Secrets

```bash
# OpenAI API Key
echo -n "YOUR_OPENAI_KEY" | gcloud secrets create openai-api-key-secret \
  --data-file=- \
  --replication-policy="automatic" \
  --project=reggieanddrodispensary

# Anthropic API Key
echo -n "YOUR_ANTHROPIC_KEY" | gcloud secrets create anthropic-api-key-secret \
  --data-file=- \
  --replication-policy="automatic" \
  --project=reggieanddrodispensary

# Grant service account access to secrets
gcloud secrets add-iam-policy-binding openai-api-key-secret \
  --member="serviceAccount:voice-service@reggieanddrodispensary.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=reggieanddrodispensary

gcloud secrets add-iam-policy-binding anthropic-api-key-secret \
  --member="serviceAccount:voice-service@reggieanddrodispensary.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=reggieanddrodispensary
```

### Step 3: Deploy via Script

```bash
./scripts/voice/deploy_to_cloudrun.sh
```

This script will:
1. Build Docker image
2. Push to GCR (`gcr.io/reggieanddrodispensary/voice-service:latest`)
3. Deploy using Cloud Run YAML config
4. Return service URL

### Step 4: Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe voice-service \
  --region=us-central1 \
  --project=reggieanddrodispensary \
  --format="value(status.url)")

# Test health endpoint
curl "${SERVICE_URL}/health"

# Test voice stats
curl "${SERVICE_URL}/api/voice/stats" | jq

# Test WebSocket (using wscat)
wscat -c "ws://${SERVICE_URL#https://}/api/voice/ws"
```

---

## 🌐 Domain Configuration (herbetridge.com)

### Current Status
❌ Domain NOT yet verified in GCP
⏳ Needs DNS configuration

### Option A: Cloud Run Domain Mapping

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service=voice-service \
  --domain=herbetridge.com \
  --region=us-central1 \
  --project=reggieanddrodispensary

# This will provide DNS records to configure:
# - A record: 216.239.32.21, 216.239.34.21, 216.239.36.21, 216.239.38.21
# - AAAA record: 2001:4860:4802:32::15, etc.
```

### Option B: Load Balancer + SSL

```bash
# Create serverless NEG
gcloud compute network-endpoint-groups create voice-service-neg \
  --region=us-central1 \
  --network-endpoint-type=serverless \
  --cloud-run-service=voice-service \
  --project=reggieanddrodispensary

# Create backend service
gcloud compute backend-services create voice-service-backend \
  --global \
  --load-balancing-scheme=EXTERNAL_MANAGED \
  --project=reggieanddrodispensary

# Add NEG to backend
gcloud compute backend-services add-backend voice-service-backend \
  --global \
  --network-endpoint-group=voice-service-neg \
  --network-endpoint-group-region=us-central1 \
  --project=reggieanddrodispensary

# Create URL map
gcloud compute url-maps create voice-service-lb \
  --default-service=voice-service-backend \
  --project=reggieanddrodispensary

# Create HTTPS proxy (requires SSL cert)
gcloud compute ssl-certificates create herbetridge-cert \
  --domains=herbetridge.com \
  --project=reggieanddrodispensary

gcloud compute target-https-proxies create voice-service-https-proxy \
  --url-map=voice-service-lb \
  --ssl-certificates=herbetridge-cert \
  --project=reggieanddrodispensary

# Create forwarding rule
gcloud compute forwarding-rules create voice-service-forwarding-rule \
  --global \
  --target-https-proxy=voice-service-https-proxy \
  --ports=443 \
  --load-balancing-scheme=EXTERNAL_MANAGED \
  --project=reggieanddrodispensary
```

---

## 📊 Resource Configuration

### Cloud Run Service Specs
- **Memory**: 512Mi request, 1Gi limit
- **CPU**: 1 core request, 2 cores limit
- **Concurrency**: 80 requests per instance
- **Scaling**: Min 1, Max 20 instances
- **Timeout**: 300 seconds
- **Ingress**: All traffic (public)

### Health Checks
- **Startup**: `/health` every 10s, 5 failures max
- **Liveness**: `/health` every 30s, 3 failures max
- **Readiness**: `/health` every 10s, 2 failures max

---

## 🔐 Security Considerations

1. **Secrets Management**: API keys stored in Secret Manager (not env vars)
2. **Service Account**: Least privilege access
3. **Ingress**: Can be restricted to `internal-and-cloud-load-balancing` if needed
4. **HTTPS Only**: Enforced via Load Balancer
5. **CORS**: Configured in voice service router

---

## 📈 Monitoring & Logs

### View Logs
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=voice-service" \
  --limit=50 \
  --format=json \
  --project=reggieanddrodispensary
```

### Metrics Dashboard
- Cloud Run Console: https://console.cloud.google.com/run/detail/us-central1/voice-service/metrics
- Request count, latency, error rate
- Container utilization (CPU, memory)

---

## 🔄 Rollback Plan

If deployment fails or issues arise:

```bash
# Revert to previous revision
gcloud run services update-traffic voice-service \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=us-central1 \
  --project=reggieanddrodispensary

# Or use rollback script
./scripts/voice/rollback_unified_router.sh
```

---

## ✅ Post-Deployment Checklist

- [ ] Service URL returns 200 on `/health`
- [ ] WebSocket connection succeeds
- [ ] Multi-model routing tested (GPT-5, Claude, GPT-4o)
- [ ] Health circuit triggers on simulated failure
- [ ] Logs show no errors
- [ ] Domain mapping configured (if using herbetridge.com)
- [ ] SSL certificate active
- [ ] Monitoring alerts configured

---

## 🎖️ Circle of Self-Creation Notes

**VS Code Twin**: Created deployment infrastructure
**Cursor Twin**: Starting VibeCockpit frontend
**Communication**: Via Git commits + shared status files

**Next Steps**:
1. VS Code: Execute deployment script
2. Cursor: Start frontend, provide browser link
3. Both: Test end-to-end voice flow
4. Both: Configure herbetridge.com DNS

---

**Status**: 🟡 Ready for human approval (Jesse CEO)
**Generated**: 2025-10-31
**Twin**: VS Code (🟦)
