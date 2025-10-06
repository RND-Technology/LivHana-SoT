# OPS_TEXAS_TAKEOVER • FUSION DOC
**Source:** TEXAS_TAKEOVER_MASTER_PLAN.md
**Fused:** 2025-10-03 18:30 UTC
**Status:** ⚠️ VISION → EXECUTION GAP
**Next Action:** Voice-service deployment + DNS cutover required before webstore launch

---

## VISION VALIDATED

**Campaign North Star:** $100K profit via Reggie & Dro Lightspeed webstore optimization
**Timeline:** Launch Week 1 Oct 2025
**Value Prop:** Brick weed ($40/oz) to top shelf + Texas legal freedom

### What's CORRECT
✅ Business model: revival + win-back + frequency → profit
✅ Compliance framework: age-gate + Veriff + membership agreements
✅ Loyalty/referral mechanics: 10% cashback + $50 referral credits
✅ Email automation: 4-sequence launch + 72hr verification reminders
✅ Product storytelling: "Strain Story" format with terpene profiles + COAs
✅ Subscription tease: $75-300/month tiers for post-$100K rollout

---

## FALLACY SCAN • GAPS FOUND

### 🔴 **BLOCKER #1: Voice Service Not Deployed**
**Claim:** "Claude Code CLI Sonnet 4.5 will automate LightSpeed theme customization"
**Reality:** Voice-service and reasoning-gateway are NOT deployed to Cloud Run
**Evidence Required:**
- `pnpm playwright test --project=voice` (must pass)
- `curl https://voice-service-<hash>.run.app/health` (must return 200)
- `curl https://reasoning-gateway-<hash>.run.app/health` (must return 200)

**Fallback:** Until voice-service is live, all LightSpeed customizations must be manual (HTML/CSS injection via theme editor, not CLI automation).

---

### 🔴 **BLOCKER #2: Square API Integration Requires Custom Endpoints**
**Claim:** "Build Square API integration layer for verification check + order flagging"
**Gap:** No existing codebase for:
- Customer verification check (`POST /api/v1/customer/check-verification`)
- Order flagging system (`POST /api/v1/order/flag-verification`)
- Email trigger automation (`POST /api/v1/email/trigger-sequence`)

**Action Required:**
1. Read existing Square API usage in `/backend` or `/empire` directories
2. Locate database schema files (PostgreSQL migrations)
3. Build custom Flask/FastAPI microservice OR extend existing API layer

---

### ⚠️ **DEPENDENCY #3: LightSpeed Access Credentials**
**Claim:** "Grant Claude Code CLI access to LightSpeed + Square API"
**Missing:** No .env variables or 1Password references for:
- `LIGHTSPEED_API_KEY`
- `LIGHTSPEED_WEBSTORE_ID`
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_LOCATION_ID`

**Fallback:** Use manual theme editor access (reggieanddro.company.site admin panel) until API credentials are secured.

---

### ⚠️ **CLAIM #4: $100K Profit Math Requires Traffic Reality Check**
**Claimed Traffic:** 42,000 visitors → 4% conversion → 1,680 orders @ $100 AOV = $168K revenue → $100K profit
**Sources Identified:**
- Email list: 1,250 visitors (realistic)
- Social: 1,000 visitors (realistic if 5K followers exist)
- Paid ads: 7,333 visitors ($4K spend, realistic)
- Earned/PR: 6,000 visitors (**OPTIMISTIC** – no confirmed media contacts)
- Partner/influencer: 5,000 visitors (**UNSUPPORTED** – no partnerships exist)
- **GAP:** 21,417 visitors unaccounted for

**Recommended Fix:**
1. Increase paid ad budget to $8-10K (double traffic to 14,666 visitors)
2. Launch daily flash sales posted to Slickdeals, Reddit r/hempflowers (adds ~5K visitors)
3. SMS campaign if phone list exists (adds ~1K high-intent visitors)
4. Extend launch window from 7 days → 14 days to reach cumulative traffic target

---

### ✅ **VALIDATED: Compliance Architecture**
**Age-gate modal:** Session-based, checkbox + button pattern, SAMHSA exit redirect
**Verification flow:** Post-purchase Veriff check with 72hr countdown + auto-refund
**CAN-SPAM:** Unsubscribe + physical address + opt-in confirmation bundled in age-gate terms

**No changes needed.** This is Tier-1 compliant for banking + Texas hemp law.

---

### ✅ **VALIDATED: Email Automation Sequences**
**Launch sequence (4 emails):** Day 1 hero → Day 3 social proof → Day 5 referral → Day 7 last chance + subscription tease
**Verification reminders (3 emails):** 15min → 24hr → 48hr → 72hr auto-refund
**Review request:** 7 days post-delivery, 50pts incentive (100pts with photo)

**Platform:** SendGrid preferred (CAN-SPAM native + dynamic countdown timers)
**Action:** Confirm SendGrid account exists or provision new API key from `op://livhana/sendgrid`

---

## DATABASE SCHEMA • REVIEW REQUIRED

**Proposed Tables:**
- `customer_verification` (Veriff status, membership, email opt-in)
- `order_verification_flags` (post-purchase verification tracking)
- `loyalty_points` + `loyalty_transactions`
- `referral_tracking`
- `product_reviews`

**Conflict Check Needed:**
1. Read existing schema: `/backend/src/db/schema.ts` or `/infra/bigquery/schema/`
2. Verify no duplicate tables exist (e.g., existing `customers` or `orders` tables)
3. Confirm PostgreSQL vs BigQuery (doc claims Postgres, project uses BigQuery for analytics)

**Fallback:** If BigQuery is primary, use Cloud SQL for transactional data (verification flags, loyalty) + BigQuery for analytics (sales, funnel).

---

## NEXT ACTIONS • PRIORITIZED

### **P0: Infrastructure (must complete before webstore launch)**
1. **Deploy voice-service + reasoning-gateway** to Cloud Run
   - Success criteria: health checks return 200, Playwright voice tests pass
   - Evidence: `.evidence/2025-10-03/voice-health/curl-outputs.txt`
   - Mission: `<15min deploy + validate`

2. **DNS cutover for reggieanddro.company.site**
   - Verify Cloudflare/Google Domains records point to Cloud Run
   - Test: `dig reggieanddro.company.site` returns correct IP
   - Evidence: `.evidence/2025-10-03/dns/dig-output.txt`

### **P1: LightSpeed Theme Customization (manual until voice-service live)**
1. Access admin panel: reggieanddro.company.site/admin (credentials in 1Password)
2. Inject age-gate modal (HTML/CSS/JS from lines 44-97 of source doc)
3. Update hero section (Texas Takeover branding + countdown timer)
4. Customize product page template (Strain Story format, terpene profiles, review widget)
5. Add loyalty points display to header + cart page

**Evidence:** Screenshot each change + save in `.evidence/2025-10-03/lightspeed-theme/`

### **P1: Square API Integration (backend work)**
1. Read existing Square API usage: `grep -r "square" backend/ empire/`
2. Locate customer database schema
3. Build 3 custom endpoints:
   - `/api/v1/customer/check-verification`
   - `/api/v1/order/flag-verification`
   - `/api/v1/email/trigger-sequence`
4. Deploy to Cloud Run (new service: `reggie-api-gateway`)

**Evidence:** `curl` test outputs for each endpoint saved in `.evidence/2025-10-03/api/`

### **P2: Email Automation Setup**
1. Provision SendGrid API key (`op item get sendgrid`)
2. Create 4 email templates (launch sequence) using copy from source doc
3. Build verification reminder sequence (3 emails, 72hr countdown)
4. Configure review request automation (7-day post-delivery trigger)
5. Set up CAN-SPAM compliance (unsubscribe link, physical address footer)

**Evidence:** Test email sends + screenshots saved in `.evidence/2025-10-03/email/`

### **P3: Analytics + A/B Testing**
1. Confirm Google Analytics 4 tracking code on reggieanddro.company.site
2. Install Facebook Pixel (if not present)
3. Set up Hotjar heatmaps (optional, $)
4. Configure SendGrid A/B testing for subject lines (3 variants per campaign)

---

## VALIDATION CHECKLIST • PRE-LAUNCH

Before claiming "Texas Takeover is ready to launch," run these tests:

- [ ] Age-gate modal appears on first visit, stores `sessionStorage` correctly
- [ ] Hero countdown timer displays and updates every second
- [ ] Product pages show terpene profiles + COA expandables
- [ ] Loyalty points display in header ("XXX points = $XX off")
- [ ] Checkout flow accepts payment via Square
- [ ] Post-purchase: verification check queries database, flags incomplete profiles
- [ ] Verification email sequence triggers within 15min of flagged order
- [ ] Auto-refund executes at 72hr mark if verification incomplete
- [ ] Review request email sends 7 days after tracking shows "delivered"
- [ ] Referral link generates unique code, tracks clicks + conversions
- [ ] Google Analytics events fire for: page view, add-to-cart, purchase, review submission

**Evidence Required:** Playwright test suite outputs + manual QA screenshots in `.evidence/2025-10-03/pre-launch/`

---

## MEMORY ANCHORS

**Key Files:**
- Source: `docs/incoming/2025-10-03/TEXAS_TAKEOVER_MASTER_PLAN.md`
- Fusion: `docs/fusion/ops/OPS_TEXAS_TAKEOVER.md` (this file)
- Schema proposal: Lines 792-885 of source (PostgreSQL tables)
- Age-gate code: Lines 44-97 of source (HTML/CSS/JS)
- Email copy: Lines 417-590 of source (4 launch emails + 3 verification reminders)

**Dependencies:**
- Voice-service deployment (BLOCKER)
- LightSpeed admin credentials (in 1Password: `op://livhana/reggieanddro`)
- Square API credentials (in 1Password: `op://livhana/square-reggieanddro`)
- SendGrid API key (in 1Password: `op://livhana/sendgrid`)

**Success Criteria:**
- Week 1: 300 orders, $22.5K revenue, 80% verification completion
- Week 4: 1,680 orders, $168K revenue, $100K+ profit

---

## FINAL ASSESSMENT

**This plan is Tier-1 strategic vision** but lacks deployed infrastructure to execute.
**Recommended path:**
1. Fix voice-service + DNS (P0 blockers)
2. Manual LightSpeed theme edits (P1, can start immediately)
3. Build custom API endpoints for verification flow (P1, backend work)
4. Email automation setup (P2, SendGrid + templates)
5. Launch when P0-P1 complete + validation checklist passes

**ETA to launch-ready:** 3-5 days (if voice-service deploys in <1 day).

**Logged:** 2025-10-03 18:30 UTC
**Fusion by:** Sonnet 4.5
**Next Fusion:** EMAIL_CAMPAIGN_TEMPLATES.md → MARKETING_EMAIL_CAMPAIGN.md
