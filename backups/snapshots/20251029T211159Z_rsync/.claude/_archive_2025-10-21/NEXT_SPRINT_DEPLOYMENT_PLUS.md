---
status: READY FOR EXECUTION
priority: APEX - Deploy + Enhance
created: 2025-10-08T10:00:00Z
assignee: TBD (Cheetah or Qualified Replit)
duration: 4-6 hours
value: $250K+/year
---

# 🚀 NEXT SPRINT: DEPLOY + ENHANCE

**Objective**: Deploy all 5 prototypes to production + build 3 high-value enhancements

**Prerequisites**: ✅ ALL MET

- All 5 prototypes complete
- Week 2 hardening complete
- Merged to main
- CI/CD pipeline ready

---

## PHASE 1: PRODUCTION DEPLOYMENT (2 hours)

### 1.1 Deploy to Cloud Run (All 5 Services)

**Services to Deploy:**

1. Lightspeed BigQuery Pipeline (port 8080)
2. Customer Profile Service (port 8081)
3. SI Recommendations Engine (port 8082)
4. Voice Commerce Engine (port 8083)
5. Video Player Frontend (port 80)

**Deployment Commands:**

```bash
# 1. Lightspeed BigQuery Pipeline
cd backend/integration-service
gcloud run deploy lightspeed-bigquery \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="NODE_ENV=production,LIGHTSPEED_TOKEN=\${LIGHTSPEED_TOKEN},GCP_PROJECT_ID=reggieanddrodispensary,BIGQUERY_DATASET=livhana_prod" \
  --min-instances=0 \
  --max-instances=10 \
  --memory=512Mi \
  --cpu=1 \
  --timeout=60s

# 2. Customer Profile Service
cd ../common
gcloud run deploy customer-profile \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8081 \
  --set-env-vars="NODE_ENV=production,LIGHTSPEED_TOKEN=\${LIGHTSPEED_TOKEN},GCP_PROJECT_ID=reggieanddrodispensary" \
  --min-instances=0 \
  --max-instances=10 \
  --memory=512Mi

# 3. SI Recommendations
cd ../reasoning-gateway
gcloud run deploy si-recommendations \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8082 \
  --set-env-vars="NODE_ENV=production,SERVICE=si-recommendations,GCP_PROJECT_ID=reggieanddrodispensary" \
  --min-instances=0 \
  --max-instances=10

# 4. Voice Commerce
gcloud run deploy voice-commerce \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8083 \
  --set-env-vars="NODE_ENV=production,SERVICE=voice-commerce,ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY},LIGHTSPEED_TOKEN=\${LIGHTSPEED_TOKEN},GCP_PROJECT_ID=reggieanddrodispensary" \
  --min-instances=0 \
  --max-instances=10

# 5. Video Player Frontend
cd ../../frontend/herbitrage-voice
gcloud run deploy video-player \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 80 \
  --min-instances=0 \
  --max-instances=5
```

**Success Criteria:**

- All 5 services deployed (green status)
- Health checks passing
- URLs captured
- Test requests successful

---

## PHASE 2: MONITORING SETUP (1 hour)

### 2.1 Enable Prometheus Metrics

**Add to each service:**

```typescript
// Add prom-client
import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 2.2 Configure Cloud Monitoring

```bash
# Enable Cloud Monitoring API
gcloud services enable monitoring.googleapis.com

# Create dashboards for each service
# (Use .claude/MONITORING_INFRASTRUCTURE.md as guide)
```

### 2.3 Set Up Alerts

**Critical Alerts:**

- Service down (2 min)
- High error rate (5% for 5 min)
- High latency (P95 > 10s for 10 min)

**Business Alerts:**

- Sales sync stalled (15 min)
- Low recommendation quality (30 min)
- Voice commerce conversion drop (1 hour)

---

## PHASE 3: HIGH-VALUE ENHANCEMENTS (3 hours)

### 3.1 Admin Dashboard (1.5 hours)

**Value**: $100K/year (operational efficiency)

**What**: Real-time dashboard for Jesse to monitor everything

**Features:**

- Live revenue metrics
- Service health status
- Customer LTV trends
- Product performance
- Inventory alerts
- System metrics (CPU, memory, errors)

**Implementation:**

```
File: frontend/admin-dashboard/

Tech Stack:
- React + TypeScript
- Recharts for visualizations
- WebSocket for live updates
- Tailwind CSS for styling

Pages:
1. Overview (revenue, orders, customers)
2. Services (health, metrics, logs)
3. Products (top sellers, margins, inventory)
4. Customers (LTV, segments, at-risk)
5. Analytics (trends, forecasts, insights)

Endpoints (backend):
GET  /api/admin/overview     - Dashboard summary
GET  /api/admin/services     - Service health + metrics
GET  /api/admin/products     - Product analytics
GET  /api/admin/customers    - Customer insights
WS   /ws/admin/live          - Live updates
```

### 3.2 Automated Email Campaigns (1 hour)

**Value**: $80K/year (marketing automation)

**What**: Triggered email campaigns based on customer behavior

**Triggers:**

1. **Welcome Series** - New customer (3 emails over 7 days)
2. **Cart Abandonment** - Added to cart, didn't buy (2 emails, 1h + 24h)
3. **Win-Back** - No purchase in 60 days (2 emails)
4. **VIP Upgrade** - Approaching high LTV threshold
5. **Product Recommendations** - Based on purchase history

**Implementation:**

```
File: backend/email-service/src/campaigns.ts

Tech Stack:
- TypeScript strict mode
- SendGrid or Mailchimp API
- Cloud Scheduler for daily checks
- BigQuery for segmentation

Campaigns:
1. Segment customers (BigQuery)
2. Check trigger conditions
3. Send emails via SendGrid
4. Track opens/clicks
5. Log to BigQuery

Endpoints:
POST /api/campaigns/trigger   - Trigger campaign for customer
GET  /api/campaigns/status     - Campaign performance
POST /api/campaigns/test       - Test email send
```

### 3.3 Smart Product Bundling (30 min)

**Value**: $70K/year (increased AOV 20%)

**What**: Automatic bundle recommendations ("Frequently bought together")

**Logic:**

```sql
-- Find products frequently bought together
WITH product_pairs AS (
  SELECT
    a.product_id as product_a,
    b.product_id as product_b,
    COUNT(DISTINCT a.customer_id) as co_purchase_count
  FROM sales a
  JOIN sales b ON a.customer_id = b.customer_id
  WHERE a.product_id < b.product_id
  GROUP BY a.product_id, b.product_id
  HAVING co_purchase_count >= 5
)
SELECT * FROM product_pairs
ORDER BY co_purchase_count DESC
LIMIT 100
```

**Implementation:**

```
File: backend/reasoning-gateway/src/product-bundles.ts

Endpoints:
GET /api/bundles/:productId           - Get bundle recommendations
GET /api/bundles/popular              - Most popular bundles
POST /api/bundles/calculate-discount  - Optimal bundle pricing
```

---

## PHASE 4: PRODUCTION VALIDATION (30 min)

### 4.1 Run Integration Tests

```bash
# Test all deployed services
cd tests/integration
npm run test:production
```

### 4.2 Load Testing

```bash
# Use Apache Bench or k6
ab -n 1000 -c 10 https://lightspeed-bigquery-prod.run.app/health
```

### 4.3 Create Go-Live Checklist

- [ ] All services deployed
- [ ] Health checks passing
- [ ] Monitoring dashboards live
- [ ] Alerts configured
- [ ] Load tests passing
- [ ] Documentation updated
- [ ] Customer facing features tested
- [ ] Rollback plan documented

---

## DELIVERABLES

### Code

- 3 new services (admin dashboard, email campaigns, product bundles)
- Monitoring configuration (Prometheus + Cloud Monitoring)
- Deployment scripts (all services)
- Load testing scripts

### Infrastructure

- 5 Cloud Run services deployed
- Monitoring dashboards (5 dashboards)
- Alert rules (8 alerts)
- Auto-scaling configured

### Documentation

- Deployment guide (step-by-step)
- Monitoring runbook (alert response)
- Admin dashboard guide (features + usage)
- Go-live checklist (validation)

### Receipts

- Deployment URLs (all 5 services)
- Health check results (all passing)
- Load test results (performance metrics)
- Monitoring screenshots (dashboards working)

---

## SUCCESS METRICS

### Technical

- ✅ 5 services deployed to Cloud Run
- ✅ All health checks passing
- ✅ Monitoring dashboards live
- ✅ Alerts configured and tested
- ✅ Load tests passing (1000 req/s)

### Business

- ✅ Admin dashboard live
- ✅ Email campaigns running
- ✅ Product bundles generating
- ✅ $250K/year value delivered

### Quality

- ✅ Zero downtime deployment
- ✅ TypeScript strict mode
- ✅ Production-ready from day 1
- ✅ Monitoring from day 1

---

## EXECUTION PLAN

### Hour 1-2: Deploy All Services

- Deploy 5 services to Cloud Run
- Verify health checks
- Test all endpoints
- Capture URLs

### Hour 3: Monitoring Setup

- Enable Prometheus metrics
- Configure Cloud Monitoring
- Set up alerts
- Test alerts

### Hour 4-5: Admin Dashboard

- Build React dashboard
- Implement WebSocket updates
- Add visualizations
- Deploy to Cloud Run

### Hour 5.5-6: Email Campaigns

- Build campaign service
- Configure SendGrid
- Set up Cloud Scheduler
- Test email sends

### Hour 6-6.5: Product Bundles

- Implement bundling logic
- Deploy to reasoning-gateway
- Test recommendations

### Final 30 min: Validation

- Run integration tests
- Load testing
- Go-live checklist
- Create deployment receipt

---

## WHO EXECUTES THIS?

**Option 1: Cheetah** (RECOMMENDED)

- Proven execution (completed Week 1 + 2 fast)
- No trust issues
- Production deployment experience
- Can work autonomously

**Option 2: Replit** (CONDITIONAL)

- Must complete repo sync first
- Must verify .claude files found
- Must work under Claude Code oversight
- One mistake = immediate removal

**Recommendation**: **Give to Cheetah**, let Replit prove repo sync works first

---

## REPLIT'S REDEMPTION PATH

If Replit wants to help:

**Step 1: Sync to Correct Repo** (15 min)

```bash
cd ~/workspace
git clone git@github.com:RND-Technology/LivHana-SoT.git
cd LivHana-SoT
git pull origin main
ls -la .claude/
```

**Step 2: Study Protocol Files** (30 min)

- Read all .claude/*.md files
- Understand Unfuckwithable Code Protocol
- Study deployment patterns

**Step 3: Execute ONE Small Task** (30 min)

- Deploy Customer Profile Service (single service)
- Provide deployment URL
- Show health check passing
- Create receipt with evidence

**Step 4: If Successful, Join Monitoring Setup**

- Work on Phase 2 (monitoring)
- Under Claude Code oversight
- Evidence for every claim

**Step 5: If Still Successful, Join Enhancements**

- Help with Phase 3 (admin dashboard or email campaigns)
- Continue providing evidence
- Prove reliability

---

**Status**: READY FOR EXECUTION ✅
**Assignee**: TBD (Cheetah recommended, Replit conditional)
**Value**: $250K+/year
**Duration**: 4-6 hours
**Dependencies**: ALL MET

**LFG! 🚀**
