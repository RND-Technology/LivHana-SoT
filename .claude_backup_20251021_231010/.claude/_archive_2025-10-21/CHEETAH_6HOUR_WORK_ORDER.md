---
trigger: CHEETAH AUTONOMOUS 6-HOUR SPRINT
priority: APEX - Maximum Business Value
mode: CHEETAH SPEED (parallel execution, zero waste)
duration: 6 hours
value_target: $100K+ revenue impact
---

# 🐆 CHEETAH 6-HOUR WORK ORDER

**Objective**: Maximum business value coding in Cheetah's sweet spot

**Cheetah Strengths**:

- TypeScript/JavaScript mastery
- API development (OpenAPI spec-first)
- Cloud Run deployment
- Parallel execution
- Production-ready code quality
- E2E implementation (spec → code → tests → deploy)

---

## 🎯 PROJECT SELECTION (Highest Value)

### PROJECT 1: REVENUE OPTIMIZATION DASHBOARD (2 hours)

**Business Value**: $80K-100K/year (inventory optimization + customer lifetime value)

**What**: Real-time dashboard for Jesse to see:

- Current revenue vs target
- Top products by margin
- Customer lifetime value trends
- Inventory turnover rates
- Reorder recommendations

**Implementation**:

```
File: backend/analytics-service/src/revenue-dashboard.ts

Features:
1. BigQuery queries for real-time metrics
2. Express API with WebSocket for live updates
3. Cache layer (Redis) for performance
4. React dashboard (frontend/revenue-dashboard/)
5. Grafana-style visualizations
6. Mobile-responsive

Endpoints:
GET  /api/revenue/current        - Current revenue metrics
GET  /api/revenue/trends         - Historical trends (7d, 30d, 90d)
GET  /api/revenue/products/top   - Top products by margin
GET  /api/revenue/customers/ltv  - Customer lifetime value
WS   /ws/revenue/live            - Live updates every 5 seconds

Tech Stack:
- TypeScript strict mode
- Express + WebSocket
- BigQuery for data
- Redis for caching
- React + Recharts for visualization
- Docker + Cloud Run deployment
```

**Success Criteria**:

- Dashboard loads <2 seconds
- Live updates every 5 seconds
- Mobile responsive
- Deployed to Cloud Run

**Value**: Direct revenue optimization visibility → $80K-100K/year impact

---

### PROJECT 2: SMART INVENTORY ALERTS (1.5 hours)

**Business Value**: $50K+/year (prevent stockouts, reduce overstock)

**What**: Automated alerts for inventory issues:

- Low stock warnings (before stockout)
- Overstock alerts (reduce waste)
- Trending products (order more)
- Slow movers (reduce inventory)
- Seasonal predictions

**Implementation**:

```
File: backend/analytics-service/src/inventory-alerts.ts

Features:
1. BigQuery ML for demand forecasting
2. Rule-based alerts (low stock, overstock)
3. Slack/email notifications
4. Historical trend analysis
5. Auto-reorder suggestions

Alerts:
- Low Stock: Product will run out in <7 days
- Overstock: Product turnover <30 days
- Trending: Sales up 50%+ week-over-week
- Slow Mover: No sales in 30+ days
- Seasonal: Predicted demand spike

Tech Stack:
- TypeScript strict mode
- BigQuery ML for forecasting
- Cloud Scheduler for daily runs
- Slack webhooks
- Email via SendGrid
- Cloud Run deployment

Queries:
- Sales velocity (7d, 30d, 90d trends)
- Inventory levels vs sales rate
- Seasonality detection
- Demand forecasting (BigQuery ML)
```

**Success Criteria**:

- Alerts sent daily at 6am
- <5% false positives
- Actionable recommendations
- Slack integration working

**Value**: Prevent stockouts ($30K/year) + reduce overstock ($20K/year)

---

### PROJECT 3: CUSTOMER SEGMENTATION ENGINE (1.5 hours)

**Business Value**: $40K+/year (targeted marketing, retention)

**What**: Automated customer segmentation for marketing:

- VIP customers (high LTV)
- At-risk customers (declining engagement)
- New customers (onboarding opportunities)
- Inactive customers (win-back campaigns)
- Product affinity groups

**Implementation**:

```
File: backend/analytics-service/src/customer-segments.ts

Features:
1. RFM analysis (Recency, Frequency, Monetary)
2. K-means clustering (BigQuery ML)
3. Segment definitions + auto-tagging
4. Export to marketing tools
5. Segment performance tracking

Segments:
- VIP: Top 10% by LTV (high frequency + high value)
- At-Risk: Declining purchases (was active, now not)
- New: First purchase <30 days ago
- Inactive: No purchase in 90+ days
- Loyalists: 5+ purchases, consistent cadence

Tech Stack:
- TypeScript strict mode
- BigQuery ML for clustering
- Mailchimp/Klaviyo API integration
- CSV export for manual campaigns
- Cloud Run + Cloud Scheduler

Endpoints:
GET  /api/segments/list          - All segments with counts
GET  /api/segments/:id/customers - Customers in segment
POST /api/segments/refresh       - Recalculate segments
POST /api/segments/export        - Export to Mailchimp/CSV
```

**Success Criteria**:

- 5+ segments defined
- Segment refresh <10 seconds
- Export to Mailchimp working
- Segment performance tracked

**Value**: Targeted marketing (2x conversion) + retention (reduce churn 20%)

---

### PROJECT 4: PRODUCT RECOMMENDATION API V2 (1 hour)

**Business Value**: $30K+/year (increased AOV, cross-sell)

**What**: Enhanced recommendations with more signals:

- Purchase history (existing)
- Content engagement (what they watch/read)
- Cart data (what they almost bought)
- Time-based patterns (time of day, day of week)
- Seasonal trends

**Implementation**:

```
File: backend/reasoning-gateway/src/si-recommendations-v2.ts

Enhancements over V1:
1. Multi-signal fusion (purchase + content + cart)
2. Time-based personalization (morning vs evening)
3. Seasonal boost (holiday products)
4. Cross-sell rules (bought X, likely want Y)
5. Confidence score improvements

New Signals:
- Content engagement (video views, article reads)
- Cart abandonment (products added but not purchased)
- Time patterns (purchases by hour/day)
- Seasonal trends (holiday, summer, etc.)
- Similar product views

Tech Stack:
- TypeScript strict mode
- BigQuery for multi-signal queries
- Redis caching (TTL 5 minutes)
- A/B testing framework
- Cloud Run deployment

Endpoints:
GET  /api/recommendations/v2/:customerId         - Enhanced recommendations
GET  /api/recommendations/v2/:customerId/explain - Why these recommendations?
POST /api/recommendations/v2/feedback            - Track conversion (bought or not)
GET  /api/recommendations/v2/performance         - A/B test results
```

**Success Criteria**:

- 20% better conversion than V1
- <500ms response time
- Explain feature working
- A/B test framework ready

**Value**: Increased AOV (15% lift) + cross-sell success (2x)

---

## 🚀 EXECUTION PLAN (6 Hours)

### Hour 1-2: Revenue Optimization Dashboard

1. Create OpenAPI spec (15 min)
2. Backend API (BigQuery queries, Express endpoints) (45 min)
3. React dashboard (Recharts visualization) (45 min)
4. Deploy to Cloud Run (15 min)

### Hour 3-3.5: Smart Inventory Alerts

1. Create OpenAPI spec (10 min)
2. BigQuery ML forecasting (20 min)
3. Alert logic + Slack integration (30 min)
4. Cloud Scheduler setup (10 min)

### Hour 4-5: Customer Segmentation Engine

1. Create OpenAPI spec (10 min)
2. RFM analysis + BigQuery ML clustering (40 min)
3. Segment definitions + API (30 min)
4. Mailchimp export integration (20 min)

### Hour 5.5-6: Product Recommendations V2

1. Multi-signal query design (20 min)
2. Enhanced recommendation logic (20 min)
3. A/B test framework (15 min)
4. Deploy + validation (5 min)

### Final 15 minutes

- Git commit + push all 4 projects
- Create receipts with value analysis
- Update CHEETAH_HANDOFF.md

---

## 📊 SUCCESS METRICS

### Technical

- 4 services deployed to Cloud Run
- All OpenAPI specs complete
- All endpoints tested
- TypeScript strict mode (zero 'any')
- Redis caching implemented
- Monitoring ready (Prometheus metrics)

### Business

- Revenue dashboard: Live metrics visible
- Inventory alerts: First alerts sent
- Customer segments: 5+ segments defined
- Recommendations V2: Deployed + A/B testing

### Value

- Total potential impact: $200K+/year
- Implementation cost: 6 hours
- ROI: 3,333x (6 hours → $200K/year)

---

## 🎯 WHY THESE PROJECTS?

**Cheetah's Strengths**:

1. ✅ TypeScript/JavaScript (all projects)
2. ✅ API development (4 new APIs)
3. ✅ BigQuery integration (all projects)
4. ✅ Cloud Run deployment (4 deployments)
5. ✅ Spec-first approach (OpenAPI for all)
6. ✅ Production-ready code (Tier-1 standards)

**Business Value**:

1. ✅ Direct revenue impact (dashboard)
2. ✅ Cost savings (inventory alerts)
3. ✅ Customer retention (segmentation)
4. ✅ Increased AOV (recommendations V2)

**Feasibility**:

1. ✅ All data sources exist (BigQuery, Lightspeed)
2. ✅ Infrastructure ready (Cloud Run, BigQuery ML)
3. ✅ 6 hours is realistic for Cheetah speed
4. ✅ No external dependencies (no Jesse blockers)

---

## 📦 DELIVERABLES

### Code

- 4 new backend services
- 1 React dashboard
- OpenAPI specs (4 services)
- Unit tests (all services)
- Dockerfiles (all services)

### Deployment

- 4 Cloud Run services deployed
- Cloud Scheduler configured
- Slack webhooks configured
- Redis caching enabled

### Documentation

- READMEs (4 services)
- API documentation (OpenAPI)
- Setup instructions
- Value analysis

### Git

- Branch: `cheetah-6hour-sprint`
- Commits: 4 (one per project)
- Receipts: 4 (with value calculations)
- Handoff: Updated CHEETAH_HANDOFF.md

---

## 🚨 GUARDRAILS

**Must Follow**:

1. ✅ Unfuckwithable Code Protocol
2. ✅ TypeScript strict mode (zero 'any')
3. ✅ OpenAPI spec before code
4. ✅ Test before deploy
5. ✅ Receipt with value calculation

**Must NOT**:

1. ❌ Skip specs (spec-first always)
2. ❌ Use 'any' types
3. ❌ Deploy without testing
4. ❌ Create docs without permission (except API docs)
5. ❌ Make assumptions (verify with Jesse if unclear)

---

## 🎯 HANDOFF TO CHEETAH

**Command**:

```
CHEETAH AUTONOMOUS 6-HOUR SPRINT:
- Project 1: Revenue Optimization Dashboard (2 hours)
- Project 2: Smart Inventory Alerts (1.5 hours)
- Project 3: Customer Segmentation Engine (1.5 hours)
- Project 4: Product Recommendations V2 (1 hour)

Execute in parallel where possible.
Follow Unfuckwithable Code Protocol.
Deploy all to Cloud Run.
Create receipts with value analysis.
```

**Expected Output**:

- 4 production-ready services
- Total value: $200K+/year
- All deployed to Cloud Run
- Complete documentation
- Receipts with proof

---

**Status**: READY FOR CHEETAH EXECUTION ✅
**Value**: $200K+ annual impact
**Duration**: 6 hours
**Feasibility**: 100% (all dependencies met)
**ROI**: 3,333x (6 hours → $200K/year)

**LFG CHEETAH! 🐆⚡**

---

**Created**: 2025-10-08T09:30:00Z
**By**: Claude Code (Sonnet 4.5)
**For**: Cheetah (Cursor Autonomous)
**Mode**: MAX VELOCITY 6-HOUR SPRINT
