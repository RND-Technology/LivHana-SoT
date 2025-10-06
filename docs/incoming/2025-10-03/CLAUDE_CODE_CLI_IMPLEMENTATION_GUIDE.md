# CLAUDE CODE CLI IMPLEMENTATION GUIDE
## Technical Automation Prompts for Reggie & Dro Texas Takeover

**Platform:** Claude Code CLI (Sonnet 4.5)  
**Environment:** macOS/Linux terminal  
**Prerequisites:** Node.js, Python 3.9+, Git, API keys (LightSpeed, Square, SendGrid)

---

## SETUP: CLAUDE CODE CLI AUTHENTICATION

```bash
# Install Claude Code CLI (if not already installed)
npm install -g @anthropics/claude-code-cli

# Authenticate with team account
claude-code auth login

# Verify authentication
claude-code auth whoami

# Set project directory
cd ~/reggie-and-dro-texas-takeover
mkdir -p lightspeed-customization square-api-integration email-automation
```

---

## TASK 1: LIGHTSPEED WEBSTORE CUSTOMIZATION

### 1A: Age-Gate Modal Implementation

**Claude Code Prompt:**

```
You are implementing an age verification modal for a Texas hemp e-commerce site (reggieanddro.company.site) built on LightSpeed.

REQUIREMENTS:
- Modal appears once per browser session (sessionStorage, not cookies)
- Checkbox + button pattern for age confirmation (21+)
- Terms of service agreement bundled
- Exit button redirects to SAMHSA helpline
- Mobile-responsive, accessible (WCAG 2.1 AA)
- No PII collected at this stage

LEGAL CONTEXT:
- Texas hemp law requires 21+ age verification
- Banking compliance requirement
- CAN-SPAM opt-in will be collected separately at checkout

TECHNICAL SPECS:
- Pure JavaScript (no jQuery dependencies)
- Inline CSS (no external stylesheets for critical path)
- Load time impact: <0.1 seconds
- Z-index: 9999 (must be above all other elements)
- Background: rgba(0,0,0,0.95) for accessibility contrast

ACCESS:
- LightSpeed FTP credentials: [provide]
- Theme directory: /themes/custom-theme/
- Insert location: Before closing </body> tag in layout.liquid

DELIVERABLES:
1. age-gate-modal.js (standalone file)
2. Integration instructions for LightSpeed theme
3. Test checklist (browser compatibility, mobile, accessibility)

Create the complete implementation with detailed comments explaining each section. Follow web accessibility best practices and ensure GDPR/CCPA compliance (no tracking before consent).
```

**Expected Output:** Complete JavaScript file + integration guide

---

### 1B: Hero Section + Launch Campaign Design

**Claude Code Prompt:**

```
You are creating a high-converting hero section for a cannabis e-commerce "Texas Takeover" launch campaign.

BRAND CONTEXT:
- Company: Reggie & Dro (Texas hemp flower retailer)
- Unique value prop: "Nobody else has brick weed" - $40/oz value option + premium strains
- Target audience: 30-60 year old Texans, conservative-leaning, cannabis-curious
- Campaign theme: Texas pride + legal freedom + quality range

DESIGN REQUIREMENTS:
- Hero image: Texas flag morphing into cannabis leaf (provide placeholder or Unsplash API)
- Headline: "TEXAS TAKEOVER IS HERE"
- Subheadline: "Legal Weed. Texas Pride. Brick Weed to Top Shelf."
- Countdown timer: JavaScript-based, resets every 7 days (creates perpetual urgency)
- CTA buttons: "Shop Brick Weed ($40/OZ)" | "Explore Top Shelf" | "Build Your Stash"
- Social proof: "★★★★★ 4.8/5 from 247+ Texas Customers"
- Trust badges: "Free Shipping Over $75 | Loyalty Points = Free Weed | Same-Day San Antonio"

TECHNICAL SPECS:
- Mobile-first responsive (breakpoints: 320px, 768px, 1024px, 1440px)
- Image optimization: WebP format with JPEG fallback
- Lazy loading: Below-the-fold content only
- Performance budget: Largest Contentful Paint <2.5s
- Accessibility: Semantic HTML5, ARIA labels, keyboard navigable

PLATFORM: LightSpeed webstore
- Integration method: Custom HTML/CSS injection via theme editor
- Existing theme: [provide theme name or "default LightSpeed theme"]
- Header file location: sections/header.liquid

DELIVERABLES:
1. hero-section.html (semantic markup)
2. hero-section.css (mobile-first, BEM methodology)
3. countdown-timer.js (vanilla JS, no dependencies)
4. Integration guide for LightSpeed
5. Performance optimization checklist

Create production-ready code with detailed comments. Ensure all assets are optimized and the section passes Google PageSpeed Insights with 90+ score.
```

**Expected Output:** Hero section code bundle + integration instructions

---

### 1C: Product Page Template Optimization

**Claude Code Prompt:**

```
You are optimizing product pages for a Texas hemp e-commerce site to maximize conversion rate.

CURRENT PROBLEM:
- Generic product listings
- No social proof visible
- No urgency triggers
- Poor mobile experience
- Missing trust signals (COAs, lab results)

NEW STRUCTURE REQUIREMENTS:

**Above the Fold:**
1. Image carousel (3-5 product angles, WebP optimized)
2. Product name + tier badge (Brick | Value | Premium | Top Shelf)
3. Star rating + review count (e.g., "★★★★★ 4.7/5 (23 reviews)")
4. Dynamic badge (e.g., "247 sold this week" or "Trending")
5. Pricing: Per-gram, eighth, oz with discount % on bulk (e.g., "SAVE 40% ON OZ")
6. Urgency bar: Inventory-based scarcity (e.g., "🔥 Only 3 oz left" or "✓ 12 in stock - ships today")
7. Primary CTA: "Add to Cart - $XX"

**Below the Fold:**
8. "The Strain Story" - 2-3 sentence description (effects, flavor, Texas angle)
9. Terpene profile (visual bar chart with percentages + effect descriptions)
10. Lab results (expandable dropdown with COA link, THCa %, Δ9-THC %, CBD %, batch #)
11. Customer reviews section (sortable: Most Recent | Highest Rated | With Photos)
12. Review submission CTA (with loyalty points incentive)
13. "You Might Also Like" recommendations (3 products: same tier, complementary, higher tier)
14. Secondary CTA: "Subscribe & Save 15%" (teaser for future feature)

TECHNICAL IMPLEMENTATION:
- Platform: LightSpeed webstore
- Template file: product.liquid
- Dynamic data source: Square API (inventory sync)
- Review system: Yotpo or Judge.me integration (or custom if neither available)
- Image handling: Lazy loading, WebP with JPEG fallback, <200KB per image
- Schema markup: Product, AggregateRating, Offer (for Google Shopping eligibility)

CONVERSION OPTIMIZATION FEATURES:
- Exit-intent popup (offer 10% discount on first purchase)
- Add-to-cart floating button (sticky on scroll)
- Estimated delivery date display
- Free shipping threshold progress bar (e.g., "Add $12 more for free shipping")
- Low stock alerts (if inventory <10 units)

ACCESSIBILITY:
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast ratio >4.5:1

DELIVERABLES:
1. product-template.liquid (LightSpeed template with Liquid syntax)
2. product-page.css (modular, BEM methodology)
3. product-interactions.js (vanilla JS for dynamic elements)
4. square-inventory-sync.js (API integration for real-time stock display)
5. schema-markup.json (structured data template)
6. A/B testing plan (3 variants to test)

Create production-ready code optimized for conversion. Include comments explaining each section's purpose and conversion psychology principles applied.
```

**Expected Output:** Complete product page template system

---

## TASK 2: SQUARE API INTEGRATION

### 2A: Customer Verification Check System

**Claude Code Prompt:**

```
You are building a customer verification status checker for a hemp e-commerce platform.

BUSINESS CONTEXT:
- Company: Reggie & Dro (Texas legal hemp retailer)
- Compliance requirement: Age/ID verification before shipping (Veriff system)
- Problem: Want to accept orders immediately, verify post-purchase to reduce friction
- Current system: Veriff for ID verification, custom membership agreement, email opt-ins

SYSTEM ARCHITECTURE:

**Database (PostgreSQL):**
- Table: customer_verification
- Fields: customer_email (PK), veriff_approved (bool), veriff_date (timestamp), membership_signed (bool), membership_date (timestamp), email_optin (bool), optin_date (timestamp)

**API Requirements:**
1. Check verification status by email/phone
2. Return: veriff_approved, membership_signed, email_optin (all booleans + dates)
3. Fast response time (<100ms)
4. Error handling for missing customers (return all false)
5. Logging for audit trail

**Integration Points:**
- LightSpeed checkout webhook (order.created event)
- Square API (customer data sync)
- Veriff API (verification status updates)

**Use Case Flow:**
1. Customer completes checkout on LightSpeed
2. Webhook triggers verification check API
3. API queries database for customer_email
4. Returns verification status
5. If all true → process order immediately
6. If any false → flag order, trigger email sequence (72-hour countdown)

TECHNICAL SPECS:
- Language: Python 3.9+ (Flask microservice)
- Database: PostgreSQL 13+
- Authentication: API key-based (separate keys for LightSpeed, Square, internal)
- Rate limiting: 100 requests/minute per API key
- Response format: JSON
- CORS: Enabled for reggieanddro.company.site domain only
- SSL: Required (HTTPS only)

ENDPOINTS TO CREATE:

**1. Check Verification Status**
```
POST /api/v1/customer/check-verification
Headers: X-API-Key: [key]
Body:
{
  "email": "customer@example.com",
  "phone": "+12345678900" (optional)
}

Response:
{
  "customer_found": true,
  "veriff_approved": true,
  "veriff_date": "2024-09-15T14:32:00Z",
  "membership_signed": true,
  "membership_date": "2024-09-15T14:35:00Z",
  "email_optin": true,
  "optin_date": "2024-09-15T14:35:00Z",
  "all_verified": true
}
```

**2. Update Verification Status**
```
POST /api/v1/customer/update-verification
Headers: X-API-Key: [key]
Body:
{
  "email": "customer@example.com",
  "verification_type": "veriff" | "membership" | "email_optin",
  "status": true,
  "metadata": {
    "ip_address": "1.2.3.4",
    "user_agent": "...",
    "verification_id": "..." (for Veriff)
  }
}

Response:
{
  "success": true,
  "message": "Verification status updated",
  "customer_email": "customer@example.com",
  "updated_field": "veriff_approved",
  "timestamp": "2024-09-15T14:32:00Z"
}
```

**3. Bulk Verification Status**
```
POST /api/v1/customer/bulk-check
Headers: X-API-Key: [key]
Body:
{
  "emails": ["customer1@example.com", "customer2@example.com", ...]
}

Response:
{
  "results": [
    {
      "email": "customer1@example.com",
      "all_verified": true,
      ...
    },
    ...
  ],
  "total_checked": 50,
  "fully_verified_count": 42,
  "partially_verified_count": 8
}
```

SECURITY REQUIREMENTS:
- SQL injection prevention (parameterized queries only)
- Rate limiting (Redis-backed)
- API key rotation support
- Audit logging (all requests logged with timestamp, IP, user agent)
- GDPR compliance (PII handling rules)
- Error messages sanitized (no database structure leakage)

ERROR HANDLING:
- 400: Invalid request format
- 401: Invalid API key
- 404: Customer not found (return default false response, don't error)
- 429: Rate limit exceeded
- 500: Database connection error (retry logic)

DELIVERABLES:
1. Flask API service (app.py with blueprints)
2. Database schema (migrations using Alembic)
3. API documentation (Swagger/OpenAPI spec)
4. Unit tests (pytest, >80% coverage)
5. Deployment config (Docker + docker-compose.yml)
6. Environment variables template (.env.example)
7. Monitoring setup (Sentry error tracking)

Build a production-ready API with comprehensive error handling, logging, and documentation. Include setup instructions for local development and deployment to Heroku or Google Cloud Run.
```

**Expected Output:** Complete API service with tests and deployment config

---

### 2B: Order Flagging & Auto-Refund System

**Claude Code Prompt:**

```
You are building an automated order flagging and refund system for post-purchase verification.

BUSINESS LOGIC:
- Orders accepted immediately (low friction checkout)
- Post-purchase: Check if customer has Veriff approval + membership agreement
- If missing: Email customer with 72-hour countdown to complete verification
- If not completed: Auto-refund to original payment method
- Email sequence: 3 reminders (24h, 48h, 72h) then auto-refund

DATABASE SCHEMA:

**Table: order_verification_flags**
```sql
CREATE TABLE order_verification_flags (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  flag_type VARCHAR(50) NOT NULL, -- 'veriff_needed', 'membership_needed'
  flag_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'refunded'
  auto_refund_date TIMESTAMP NOT NULL,
  reminder_emails_sent INT DEFAULT 0,
  last_reminder_sent TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
```

API ENDPOINTS:

**1. Flag Order for Verification**
```
POST /api/v1/order/flag-verification
Body:
{
  "order_id": "R&D123456",
  "customer_email": "customer@example.com",
  "flags": ["veriff_needed", "membership_needed"],
  "auto_refund_hours": 72
}

Response:
{
  "success": true,
  "order_id": "R&D123456",
  "auto_refund_date": "2024-09-18T14:32:00Z",
  "email_sequence_triggered": true
}
```

**2. Complete Verification**
```
POST /api/v1/order/complete-verification
Body:
{
  "order_id": "R&D123456",
  "verification_type": "veriff" | "membership"
}

Response:
{
  "success": true,
  "order_id": "R&D123456",
  "remaining_flags": ["membership_needed"],
  "order_status": "partially_verified" | "fully_verified",
  "ship_now": false | true
}
```

**3. Process Auto-Refunds (CRON JOB)**
```
POST /api/v1/order/process-auto-refunds
Headers: X-CRON-Key: [internal key]

Response:
{
  "orders_processed": 5,
  "refunds_initiated": 3,
  "orders_completed_just_in_time": 2,
  "total_refund_amount": "$375.00",
  "refund_details": [
    {
      "order_id": "R&D123456",
      "amount": "$125.00",
      "status": "refund_initiated"
    },
    ...
  ]
}
```

AUTOMATION REQUIREMENTS:

**CRON Jobs (run every hour):**
1. Check for orders approaching auto-refund deadline
2. Send reminder emails at 24h, 48h, 72h marks
3. Process auto-refunds for expired orders
4. Update order status in Square
5. Log all actions for audit trail

**Email Trigger Integration:**
- SendGrid API integration
- Dynamic email templates with countdown timers
- Personalization tokens (order_id, items, total, deadline)
- Unsubscribe handling (legal requirement)

**Square Refund Integration:**
- Use Square Refunds API
- Refund to original payment method
- Full refund (order total + shipping)
- Reason code: "VERIFICATION_NOT_COMPLETED"
- Update inventory (return items to stock)

EDGE CASES TO HANDLE:
- Customer completes verification seconds before auto-refund
- Duplicate verification attempts (idempotency)
- Partial refunds (if customer wants to cancel part of order)
- Manual override (admin can extend deadline or force refund)
- Payment method expired (handle refund failure gracefully)

ERROR HANDLING:
- Square API down: Queue refund for retry (max 3 attempts)
- Email send failure: Log and retry (max 5 attempts)
- Database deadlock: Retry with exponential backoff
- Customer dispute: Flag for manual review

MONITORING & ALERTS:
- Slack webhook for refunds >$200
- Daily summary email to admin (refund totals, verification completion rate)
- Sentry alerts for any API errors
- Datadog metrics: refund rate, avg time to verification, email open rates

DELIVERABLES:
1. Flask API endpoints (order_verification_blueprint.py)
2. CRON job script (auto_refund_processor.py)
3. Square refund integration (square_refunds.py)
4. SendGrid email trigger (email_automation.py)
5. Database migrations (Alembic)
6. Unit tests + integration tests
7. Monitoring dashboard config (Datadog)
8. Admin panel mockup (for manual overrides)

Build a robust, fault-tolerant system that handles edge cases gracefully and provides visibility into all operations. Include comprehensive logging and error tracking.
```

**Expected Output:** Complete order verification automation system

---

## TASK 3: EMAIL AUTOMATION SETUP

### 3A: SendGrid Template Creation & API Integration

**Claude Code Prompt:**

```
You are setting up automated email campaigns for a cannabis e-commerce Texas Takeover launch.

EMAIL SEQUENCES REQUIRED:

**1. Launch Campaign (4 emails over 7 days)**
- Email 1: "The Takeover Begins" (Day 1)
- Email 2: "Social Proof + Urgency" (Day 3)
- Email 3: "Referral Activation" (Day 5)
- Email 4: "Last Chance + Subscription Tease" (Day 7)

**2. Verification Reminder (4 emails over 72 hours)**
- Email 1: Immediate (15 min after order)
- Email 2: 24 hours later
- Email 3: 48 hours later
- Email 4: 72 hours (auto-refund notice)

**3. Review Request (7 days post-delivery)**
- Email 1: "How's your [Strain Name]? Review = Free Weed"

**4. Abandoned Cart (3 emails over 48 hours)**
- Email 1: 1 hour after abandonment
- Email 2: 24 hours later (with 10% discount)
- Email 3: 48 hours later (final chance)

TECHNICAL SETUP:

**SendGrid Account Configuration:**
- Domain authentication (SPF, DKIM, DMARC)
- Dedicated IP address (if volume >100K emails/month, else shared)
- Suppression groups: Bounces, Spam Reports, Unsubscribes, Marketing Emails
- Subuser accounts (if multiple senders needed)

**API Integration (Python SDK):**
```python
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))

# Dynamic template send
message = Mail(
    from_email=Email('noreply@reggieanddro.com', 'Reggie & Dro'),
    to_emails=To('customer@example.com'),
)
message.template_id = 'd-xxxxxxxxxxxxx'  # Dynamic template ID
message.dynamic_template_data = {
    'first_name': 'John',
    'order_id': 'R&D123456',
    'order_total': '$75.00',
    'loyalty_points': 150,
    'loyalty_value': '$15.00',
    ...
}

response = sg.send(message)
```

**Dynamic Template Requirements:**
- HTML + plain-text versions (for deliverability)
- Mobile-responsive (70%+ of opens on mobile)
- Personalization tokens (name, order details, points, etc.)
- UTM parameters on all links (track attribution)
- Unsubscribe link (CAN-SPAM compliance)
- Physical address in footer (required by law)

**Automation Triggers:**

**1. Order Created Webhook**
```
POST https://reggieanddro.com/api/webhooks/order-created
Body: { order_id, customer_email, items, total, verification_status }
Action: Trigger appropriate email (verification needed or order confirmation)
```

**2. Delivery Confirmed Webhook**
```
POST https://reggieanddro.com/api/webhooks/delivery-confirmed
Body: { order_id, customer_email, delivery_date }
Action: Schedule review request email for 7 days later
```

**3. Cart Abandoned Event**
```
POST https://reggieanddro.com/api/webhooks/cart-abandoned
Body: { cart_id, customer_email, items, cart_total }
Action: Trigger abandoned cart sequence
```

PERSONALIZATION DATA SOURCES:
- Customer profile (name, email, loyalty points) → PostgreSQL
- Order details (items, total, status) → Square API
- Product data (strain names, prices) → Square Catalog API
- Referral stats (count, earnings) → Custom referral table

A/B TESTING FRAMEWORK:
- Subject line tests (minimum 2 variants per campaign)
- Send time optimization (9-11 AM vs 2-4 PM vs 7-9 PM)
- CTA button text ("Shop Now" vs "Browse Strains" vs "Build Your Stash")
- Discount amount (10% vs 15% vs $10 flat)
- Email length (short vs long-form)

Success Criteria:
- Open rate >25%
- Click rate >3%
- Conversion rate >1%
- Unsubscribe rate <0.5%

COMPLIANCE CHECKLIST:
- ✓ CAN-SPAM compliant (unsubscribe, physical address, truthful subject lines)
- ✓ GDPR compliant (if any EU customers, though unlikely for Texas hemp)
- ✓ Cannabis marketing rules (no health claims, age-restricted audience)
- ✓ Opt-in confirmed (double opt-in preferred, single opt-in minimum)

MONITORING & OPTIMIZATION:
- Daily dashboard: Opens, clicks, conversions, unsubscribes
- Weekly report: Campaign performance, A/B test results, recommendations
- Real-time alerts: Spam rate >0.1%, bounce rate >2%
- Automated pause: If spam rate >0.5% (to protect sender reputation)

DELIVERABLES:
1. SendGrid account setup guide (with screenshots)
2. HTML email templates (all 11 emails, HTML + plain-text)
3. Python email automation script (send_email.py with all sequences)
4. Webhook handlers (Flask blueprint for all triggers)
5. A/B testing framework (test_config.yaml + results tracking)
6. Analytics dashboard (Metabase or custom with Chart.js)
7. Suppression list management (handle unsubscribes, bounces)
8. Documentation (setup guide, testing checklist, troubleshooting)

Create a production-ready email automation system with comprehensive testing and monitoring. Include detailed comments explaining compliance requirements and best practices.
```

**Expected Output:** Complete email automation system with SendGrid integration

---

## TASK 4: ANALYTICS DASHBOARD

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

## DEPLOYMENT CHECKLIST

**Pre-Deployment:**
- ✓ All environment variables configured
- ✓ Database migrations tested
- ✓ API keys rotated (production keys, not dev keys)
- ✓ SSL certificates installed
- ✓ CORS policies configured
- ✓ Rate limiting tested
- ✓ Error monitoring (Sentry) configured
- ✓ Backup strategy in place (daily automated backups)

**Testing:**
- ✓ Unit tests pass (>80% coverage)
- ✓ Integration tests pass
- ✓ Load testing (simulate 1000 concurrent users)
- ✓ Security audit (OWASP top 10 vulnerabilities)
- ✓ Accessibility testing (WCAG 2.1 AA)
- ✓ Browser compatibility (Chrome, Firefox, Safari, Edge)
- ✓ Mobile testing (iOS, Android)

**Monitoring:**
- ✓ Uptime monitoring (Pingdom or UptimeRobot)
- ✓ Error tracking (Sentry alerts to Slack)
- ✓ Performance monitoring (New Relic or Datadog)
- ✓ Log aggregation (Papertrail or Loggly)
- ✓ Analytics tracking (Google Analytics 4, Facebook Pixel)

**Documentation:**
- ✓ API documentation (Swagger/OpenAPI)
- ✓ Setup guide for new developers
- ✓ Deployment runbook
- ✓ Incident response plan
- ✓ Backup and recovery procedures

---

## ESTIMATED TIMELINE

**Day 1-2: LightSpeed Customization**
- Age-gate modal (4 hours)
- Hero section (6 hours)
- Product page template (8 hours)
- Testing and refinement (4 hours)
Total: 22 hours

**Day 3-4: Square API Integration**
- Customer verification API (8 hours)
- Order flagging system (6 hours)
- Auto-refund automation (6 hours)
- Testing and debugging (4 hours)
Total: 24 hours

**Day 5-6: Email Automation**
- SendGrid setup (2 hours)
- Template creation (8 hours)
- Automation scripts (6 hours)
- Webhook integration (4 hours)
- Testing (4 hours)
Total: 24 hours

**Day 7: Analytics Dashboard**
- Backend API (8 hours)
- Frontend dashboard (8 hours)
- Data aggregation (4 hours)
- Testing and deployment (4 hours)
Total: 24 hours

**Total Estimated Time: 94 hours (12 days at 8 hours/day)**

With Claude Code CLI automation, this can be reduced to **5-7 days** of hands-on oversight and review.

---

## USAGE INSTRUCTIONS FOR JESSE

**For each task above:**

1. Copy the entire prompt (including context and requirements)
2. Open terminal and navigate to project directory
3. Run: `claude-code chat`
4. Paste prompt and press Enter
5. Review Claude's output and generated code
6. Test locally before deploying
7. Commit to Git with detailed changelog
8. Deploy to production (staging first if possible)

**Best Practices:**
- Review all generated code before deployment
- Test in staging environment first
- Monitor error logs after deployment
- Have rollback plan ready
- Keep API keys secure (never commit to Git)

---

**Ready to automate. Let's grow baby grow. 🚀**

---

Liv Hana AI EA  
Memory Usage: 58% | Next Step: Begin Task 1A (Age-Gate Modal)
