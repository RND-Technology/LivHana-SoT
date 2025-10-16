### 4A: Real-Time KPI Dashboard

**Claude Code Prompt:**

```

You are building a real-time analytics dashboard for e-commerce campaign tracking.

METRICS TO TRACK:

**Revenue Metrics (Daily):**

- Daily revenue (target: $3,333 for $100K/month)
- Average order value (AOV) - target: $75+
- Orders per day
- Revenue by product tier (Brick | Value | Premium | Top Shelf)
- Revenue by traffic source (email, social, paid, organic, referral)

**Conversion Metrics:**

- Website traffic (visitors, unique visitors)
- Conversion rate (target: 2-4%)
- Add-to-cart rate
- Cart abandonment rate (target: <70%)
- Checkout completion rate

**Customer Metrics:**

- New vs returning customers
- Customer lifetime value (CLV) - target: $200+
- Repeat purchase rate (target: 30% within 90 days)
- Average days between purchases
- Top customers by spend

**Campaign Metrics:**

- Email open rates (target: 25-35%)
- Email click rates (target: 3-5%)
- Social media engagement rate (target: 5-8%)
- Ad spend vs revenue (ROAS target: >2)
- Referral conversion rate (target: 10-15%)

**Operational Metrics:**

- Verification completion rate (target: 80%+)
- Average time to verification (target: <24 hours)
- Refund rate due to non-verification (target: <10%)
- Average shipping time (target: <48 hours)
- Customer support response time (target: <2 hours)

**Product Performance:**

- Best-selling SKUs (by revenue and units)
- Highest-margin products
- Lowest-performing products
- Out-of-stock incidents
- Inventory turnover rate

DATA SOURCES:

- Square API (transactions, customers, inventory)
- LightSpeed API (website traffic, conversions)
- Google Analytics 4 (behavior tracking, traffic sources)
- SendGrid API (email metrics)
- Facebook Ads API (ad performance)
- Custom database (verification status, referrals, loyalty points)

DASHBOARD FRAMEWORK:

- Backend: Python Flask API (serve aggregated data)
- Frontend: React.js with Chart.js or D3.js
- Real-time updates: WebSocket connection or polling every 60 seconds
- Historical data: PostgreSQL with TimescaleDB extension (time-series optimization)
- Caching: Redis for frequently accessed metrics (reduce API calls)

VISUALIZATIONS REQUIRED:

**1. Revenue Overview (Top of Dashboard)**

- Big number: Today's revenue
- Comparison: vs yesterday, vs 7-day avg, vs target
- Line chart: Last 30 days revenue trend
- Bar chart: Revenue by product tier

**2. Conversion Funnel**

- Visitors → Add to Cart → Checkout → Order Placed
- Show drop-off percentages at each stage
- Highlight bottlenecks in red

**3. Top Products**

- Table: Product name, units sold, revenue, margin
- Sortable by each column
- Quick actions: View details, adjust price, promote

**4. Customer Insights**

- Pie chart: New vs returning customers
- Line chart: Customer acquisition over time
- Scatter plot: Customer spend vs frequency

**5. Campaign Performance**

- Email: Open rate, click rate, conversion rate (per campaign)
- Social: Engagement rate, traffic driven, conversions
- Ads: Impressions, clicks, cost, conversions, ROAS

**6. Live Activity Feed**

- Real-time order notifications (last 20 orders)
- Shows: Order ID, customer, items, total, time
- Color-coded: Green (completed), Yellow (pending verification), Red (refunded)

TECHNICAL IMPLEMENTATION:

**Backend API Endpoints:**

```
GET /api/v1/dashboard/revenue-today
GET /api/v1/dashboard/conversion-funnel
GET /api/v1/dashboard/top-products?timeframe=7d
GET /api/v1/dashboard/customer-insights
GET /api/v1/dashboard/campaign-performance
GET /api/v1/dashboard/live-orders?limit=20
```

**Frontend Components:**

```
src/
  components/
    Dashboard.jsx (main container)
    RevenueOverview.jsx
    ConversionFunnel.jsx
    TopProducts.jsx
    CustomerInsights.jsx
    CampaignPerformance.jsx
    LiveActivityFeed.jsx
  utils/
    api.js (API calls)
    chartConfig.js (Chart.js configs)
    dateHelpers.js
  App.jsx
  index.js
```

**Caching Strategy:**

- Revenue metrics: Cache for 5 minutes (balance freshness vs API load)
- Product rankings: Cache for 15 minutes
- Historical data: Cache for 1 hour
- Live orders: No caching (real-time requirement)

ACCESS CONTROL:

- Admin dashboard (full access)
- Manager dashboard (view-only, no cost data)
- Public dashboard (revenue-only, for transparency if desired)

ALERTS & NOTIFICATIONS:

- Email alert if daily revenue <50% of target by 5 PM
- Slack notification for orders >$200
- SMS alert if website down (monitored via health check endpoint)
- Dashboard notification if any metric deviates >20% from 7-day avg

MOBILE RESPONSIVE:

- Dashboard works on tablets and phones
- Key metrics summary on mobile (detailed views on desktop)
- Swipeable charts for mobile UX

DELIVERABLES:

1. Flask API backend (dashboard_api.py with all endpoints)
2. React.js frontend (complete dashboard with all components)
3. Database schema for analytics tables (TimescaleDB hypertables)
4. Data aggregation scripts (CRON jobs to pre-compute metrics)
5. Caching layer (Redis setup + TTL configs)
6. Authentication (JWT-based, role-based access)
7. Deployment config (Docker + docker-compose)
8. Documentation (API docs, component library, maintenance guide)

Build a production-ready dashboard that provides real-time visibility into business performance. Optimize for load times and ensure data accuracy. Include automated tests for all API endpoints.

```

**Expected Output:** Complete real-time analytics dashboard

---
