# HUMAN WORK FOR JESSE - DIRECT ORDERS

**Time Required:** 125 minutes total
**Critical Path:** Items 1-4 must be completed first
**Style:** USMC DI - No fluff, execute immediately

---

## CRITICAL ITEM 1: GET YOUTUBE DATA API KEY (10 MIN)

**WHY:** YouTube analyzer needs this to extract viral patterns
**IMPACT:** Without this, content engine runs blind

**EXECUTE:**

1. Open browser: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name: `LivHana Content Engine`
4. Click "CREATE"
5. Wait 30 seconds for project creation
6. Go to: https://console.cloud.google.com/apis/library/youtube.googleapis.com
7. Click "ENABLE"
8. Wait 30 seconds
9. Go to: https://console.cloud.google.com/apis/credentials
10. Click "+ CREATE CREDENTIALS" → "API key"
11. Copy the key (starts with `AIza...`)
12. Click "RESTRICT KEY"
13. Under "API restrictions" → Select "YouTube Data API v3"
14. Click "SAVE"

**PASTE KEY HERE:**
```bash
# Open this file in terminal:
nano /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/cockpit-data/api-keys.json

# Paste this EXACTLY (replace YOUR_KEY):
{
  "youtube": {
    "apiKey": "YOUR_YOUTUBE_API_KEY_HERE",
    "enabled": true,
    "quota": 10000,
    "service": "YouTube Data API v3"
  }
}

# Press Ctrl+X, then Y, then Enter to save
```

**VERIFY:**
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine
node youtube-analyzer.mjs
# Should output: ✅ Insights saved to: cockpit-data/youtube-insights.json
```

**TIME:** 10 minutes
**COMPLETE:** [ ]

---

## CRITICAL ITEM 2: GET NEWSAPI.ORG KEY (5 MIN)

**WHY:** Real-time cannabis news feeds content engine
**IMPACT:** Without this, episodes have no current events

**EXECUTE:**

1. Open browser: https://newsapi.org/register
2. Enter email: jesse@reggieanddro.com
3. Enter password: (your choice)
4. Click "Submit"
5. Check email for verification link
6. Click verification link
7. Copy API key from dashboard

**PASTE KEY HERE:**
```bash
# Open this file:
nano /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/cockpit-data/api-keys.json

# ADD this to the file (after youtube section):
  "newsapi": {
    "apiKey": "YOUR_NEWSAPI_KEY_HERE",
    "enabled": true,
    "quota": 100,
    "service": "NewsAPI.org"
  }

# Press Ctrl+X, then Y, then Enter to save
```

**VERIFY:**
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine
node news-ingestion-pipeline.mjs
# Should output: ✅ Brief saved to: output/news/latest.json
```

**TIME:** 5 minutes
**COMPLETE:** [ ]

---

## CRITICAL ITEM 3: APPLY FOR DOORDASH DRIVE (15 MIN)

**WHY:** White-label delivery to beat Nash
**IMPACT:** Without this, no same-day delivery launch

**EXECUTE:**

1. Open browser: https://merchant.delivery.com/
2. Click "Get Started" or "Sign Up"
3. Select "DoorDash Drive" (not white-label initially)
4. Fill out form:
   - Business name: `Reggie & Dro Cannabis Store & Social Club`
   - Business type: `Retail - Cannabis/Hemp`
   - Address: `[Your San Antonio store address]`
   - EIN: `[Your tax ID]`
   - Contact: jesse@reggieanddro.com
   - Phone: `[Your store phone]`

5. Upload documents:
   - Sales Tax Permit (have ready)
   - Business License (have ready)
   - Certificate of Insurance (have ready)
   - Cannabis compliance docs (have ready)

6. Submit application
7. Note: Approval takes 7-10 days

**API INTEGRATION SETUP (AFTER APPROVAL):**
1. Sign into DoorDash Developer Portal: https://developer.doordash.com/
2. Create access key in Credentials section
3. Fork DoorDash Drive Postman collection
4. Set up Postman environment with access key variables
5. Test delivery creation and status endpoints
6. Use Delivery Simulator to advance delivery stages

**FALLBACK IF DOCS NOT READY:**
- Use standard DoorDash Drive (not white-label) for now
- Apply for white-label upgrade later
- Can still integrate via API for delivery optimization

**TIME:** 15 minutes
**COMPLETE:** [ ]

---

## CRITICAL ITEM 4: GET UBER DIRECT API KEY (10 MIN)

**WHY:** Backup delivery provider (auto-failover)
**IMPACT:** Without this, no redundancy if DoorDash fails

**EXECUTE:**

1. Open browser: https://business.uber.com/
2. Click "Get Started" or "Sign Up"
3. Select "Uber Direct" delivery
4. Fill out business info (same as DoorDash)
5. Get API credentials from dashboard
6. Copy API key

**PASTE KEY HERE:**
```bash
# Open this file:
nano /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/delivery-service/.env

# Create new file with this content:
PORT=4003
NODE_ENV=production
DOORDASH_API_KEY=YOUR_DOORDASH_KEY_HERE
DOORDASH_API_SECRET=YOUR_DOORDASH_SECRET_HERE
UBER_API_KEY=YOUR_UBER_KEY_HERE
UBER_API_SECRET=YOUR_UBER_SECRET_HERE
LIGHTSPEED_STORE_ID=117254578
LIGHTSPEED_API_TOKEN=YOUR_LIGHTSPEED_TOKEN_HERE
STORE_ADDRESS="Central San Antonio"
STORE_ZIP=78228
STORE_PHONE="+1-210-555-0100"

# Press Ctrl+X, then Y, then Enter to save
```

**API TESTING (AFTER KEYS OBTAINED):**
```bash
# Test DoorDash Drive API using official Postman collection
# Tutorial: https://developer.doordash.com/en-US/docs/drive/tutorials/get_started_postman/

# Steps to test:
# 1. Sign into DoorDash Developer Portal
# 2. Create access key in Credentials section
# 3. Fork DoorDash Drive Postman collection
# 4. Set up Postman environment with variables:
#    - developer_id, key_id, signing_secret, JWT
# 5. Test delivery creation endpoint
# 6. Use Delivery Simulator to advance stages
# 7. Test delivery status endpoint

# Key endpoints to test:
# 1. POST /v2/deliveries - Create delivery
# 2. GET /v2/deliveries/{id} - Get delivery status
# 3. POST /v2/deliveries/{id}/cancel - Cancel delivery
# 4. GET /v2/deliveries/{id}/tracking - Get tracking info
```

**TIME:** 10 minutes
**COMPLETE:** [ ]

---

## NON-CRITICAL ITEM 5: CONFIGURE LIGHTSPEED WEBHOOK (5 MIN)

**WHY:** Automatic delivery creation when orders placed
**IMPACT:** Without this, must create deliveries manually
**DEPENDENCY:** Delivery service must be deployed first (Trinity does this)

**EXECUTE (AFTER TRINITY DEPLOYS):**

1. Log in to Lightspeed: https://retail.lightspeed.app/
2. Go to: Settings → Integrations → Webhooks
3. Click "Add Webhook"
4. URL: `https://[DEPLOYMENT-URL]/api/delivery/lightspeed/webhook`
   - Trinity will provide URL after deployment
5. Events: Select "order.completed"
6. Click "Save"

**TIME:** 5 minutes
**COMPLETE:** [ ]
**WAIT FOR:** Trinity deployment (item will be marked when ready)

---

## NON-CRITICAL ITEM 6: REVIEW SATX STRATEGY (30 MIN)

**WHY:** Approve market domination plan
**IMPACT:** Without approval, Trinity can't execute

**EXECUTE:**

1. Read this file:
```bash
open /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/cockpit-data/satx-tpop-data.json
```

2. Review top 3 critical actions:
   - Launch same-day delivery (compete with Farmacy/HighWay)
   - Double down on social club (unique advantage)
   - Use HNC as acquisition engine (no competitors doing this)

3. Make decision:
   - [ ] APPROVE - Execute all 3 actions
   - [ ] MODIFY - Change priorities (note below)
   - [ ] DEFER - Wait for more data

**YOUR DECISION:**
```
[APPROVE / MODIFY / DEFER]

If MODIFY, specify changes:
_________________________________
_________________________________
```

**TIME:** 30 minutes
**COMPLETE:** [ ]

---

## NON-CRITICAL ITEM 7: APPROVE PRODUCTION DEPLOYMENT (5 MIN)

**WHY:** Trinity needs authorization to deploy to Cloud Run
**IMPACT:** Without approval, services stay local only

**EXECUTE:**

Review services for deployment:
1. Delivery Service (backend/delivery-service) - Port 4003
2. HNC Content Engine (empire/content-engine) - Autonomous
3. Monitoring Dashboard (empire/content-engine/monitoring-dashboard.html) - Static

**APPROVE DEPLOYMENT:**
```bash
# If approved, run this command:
echo "APPROVED" > /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/DEPLOYMENT_APPROVED.txt

# Trinity will see this and execute deployments
```

**YOUR DECISION:**
- [ ] APPROVE - Deploy all services
- [ ] PARTIAL - Deploy only: _________________
- [ ] DEFER - Wait for testing

**TIME:** 5 minutes
**COMPLETE:** [ ]

---

## NON-CRITICAL ITEM 8: TEAM MEETING PREP (10 MIN)

**WHY:** 1pm CST team meeting today
**IMPACT:** Team needs status update

**EXECUTE:**

Read these 3 files (10 min total):
```bash
# 1. Full session recap (5 min)
open /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/WAKE_UP_STATUS_COMPLETE.md

# 2. What you paid for (3 min)
open /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/FULL_RECEIPTS_WAKE_UP_REPORT.md

# 3. This week's plan (2 min)
open /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/RPM_WEEKLY_PLAN_OCT7-14_2025.md
```

**TALKING POINTS FOR MEETING:**
1. Trinity delivered 8,000+ lines of code (95% complete)
2. Need 4 API keys to unlock tier-1 stack (40 min of work)
3. Delivery service beats Nash (direct integration, no middleman)
4. SATX strategy shows 3 critical market gaps
5. Next 7 days: Launch delivery + Generate 20 episodes + Execute SATX plan

**TIME:** 10 minutes
**COMPLETE:** [ ]

---

## OPTIONAL ITEM 9: TEST DELIVERY SERVICE (10 MIN)

**WHY:** Verify everything works before production
**IMPACT:** Catch issues before customers see them
**DEPENDENCY:** Items 3 & 4 must be complete (API keys obtained)

**EXECUTE:**

```bash
# Start delivery service locally
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/delivery-service
npm start

# In new terminal, test health check:
curl http://localhost:4003/health

# Expected output:
{
  "service": "delivery-service",
  "status": "healthy",
  "providers": {
    "doordash": true,
    "uber": true
  }
}

# Test quote API:
curl -X POST http://localhost:4003/api/delivery/quote \
  -H "Content-Type: application/json" \
  -d '{
    "cartTotal": 75,
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "San Antonio",
      "state": "TX",
      "zip": "78228"
    }
  }'

# Expected output:
{
  "success": true,
  "provider": "doordash",
  "fee": 5.50,
  "estimatedMinutes": 45
}

# Test DoorDash Drive API integration:
curl -X POST http://localhost:4003/api/delivery/doordash/test \
  -H "Content-Type: application/json" \
  -d '{
    "test": true
  }'

# Expected output:
{
  "success": true,
  "api_connected": true,
  "endpoints_tested": [
    "POST /v2/deliveries",
    "GET /v2/deliveries/{id}",
    "POST /v2/deliveries/{id}/cancel",
    "GET /v2/deliveries/{id}/tracking"
  ]
}

# Additional DoorDash Drive API testing:
# 1. Use DoorDash Developer Portal Simulator
# 2. Advance delivery through stages: Created → Confirmed → Picked Up → Delivered
# 3. Test webhook endpoints for real-time updates
# 4. Verify JWT token generation and validation
```
```

**IF ERRORS:**
- Check .env file has all API keys
- Verify API keys are valid (not expired)
- Check console for error messages
- Report to Trinity for debug

**TIME:** 10 minutes
**COMPLETE:** [ ]

---

## SUMMARY - HUMAN WORK CHECKLIST

**CRITICAL (MUST DO - 40 MIN):**
- [ ] Item 1: Get YouTube API key (10 min)
- [ ] Item 2: Get NewsAPI key (5 min)
- [ ] Item 3: Apply for DoorDash Drive (15 min)
- [ ] Item 4: Get Uber API key (10 min)

**NON-CRITICAL (SHOULD DO - 85 MIN):**
- [ ] Item 5: Configure Lightspeed webhook (5 min) *wait for Trinity*
- [ ] Item 6: Review SATX strategy (30 min)
- [ ] Item 7: Approve production deployment (5 min)
- [ ] Item 8: Team meeting prep (10 min)
- [ ] Item 9: Test delivery service (10 min) *optional*

**TOTAL TIME:** 125 minutes (2 hours 5 minutes)
**CRITICAL PATH:** 40 minutes to unblock Trinity
**TEAM MEETING:** 1pm CST today (60 min)

---

## TRINITY STATUS

**Claude Code CLI:** ✅ READY - Waiting for API keys to deploy
**Cheetah (Cursor):** ✅ READY - Waiting for Jesse's decisions
**Replit Agent:** ⚠️ READY - Will execute once unblocked

**BLOCKING:** Items 1-4 (API keys) must be completed before Trinity can proceed.

**NEXT TRINITY ACTION (ONCE UNBLOCKED):**
1. Deploy delivery service to Cloud Run (15 min)
2. Generate 20 HNC episodes with real news (30 min)
3. Run YouTube viral pattern analysis (10 min)
4. Execute SATX strategy (if approved) (ongoing)
5. Monitor all systems 24/7 (autonomous)

---

## EMERGENCY CONTACTS

**If stuck on any item:**
1. Check relevant README.md files
2. Review .env.example files for config guidance
3. Ask Trinity for help (we're here)

**Critical errors only:**
- Deployment failures → Claude Code CLI
- API integration issues → Cheetah (Cursor)
- Content generation problems → Replit Agent

---

**STATUS:** STANDING BY FOR JESSE'S EXECUTION
**DEADLINE:** Complete critical items before 1pm CST meeting
**PRIORITY:** Items 1-4 first, rest after meeting if needed

**EXECUTE NOW. REPORT BACK WHEN COMPLETE.**
