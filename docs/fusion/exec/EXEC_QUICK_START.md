# EXEC_QUICK_START • FUSION DOC
**Source:** QUICK_START_ACTION_PLAN.md
**Fused:** 2025-10-03 18:45 UTC
**Status:** ⚠️ TIMELINE BLOCKED BY INFRASTRUCTURE
**Next Action:** Deploy Trinity voice/reasoning services BEFORE webstore launch

---

## REALITY CHECK • TIMELINE GATES

**Plan Assumption:** Day 0 → API access → Day 4 launch
**Trinity Reality:** Voice-service + reasoning-gateway must deploy first (ETA: 2-3 days minimum)

### Gate System

**GATE 1: Infrastructure Deployment** 🔴 BLOCKED
- Voice-service deployed to Cloud Run
- Reasoning-gateway deployed to Cloud Run
- DNS cutover to new services
- Health checks passing
**Blocks:** ALL downstream tasks (no backend for webstore to call)

**GATE 2: Backend Integration** ⚠️ DEPENDS ON GATE 1
- Customer verification API endpoints
- Order flagging system
- Email automation triggers
**Blocks:** Webstore cannot process orders without verification flow

**GATE 3: Webstore Customization** ⚠️ DEPENDS ON GATE 2
- Age-gate modal
- Hero section
- Product pages
**Blocks:** Customer-facing launch

**GATE 4: Campaign Activation** ⚠️ DEPENDS ON GATE 3
- Email sequences
- Paid ads
- Social media
**Blocks:** Traffic acquisition

---

## VALIDATED SECTIONS • WHAT'S CORRECT

### ✅ **Phase 0: Access & Data Gathering (Lines 12-38)**
**Checklist:**
- LightSpeed credentials: `op://livhana/reggieanddro` (verify)
- Square API key: `op://livhana/square-reggieanddro` (verify)
- SendGrid API key: `op://livhana/sendgrid` OR provision new
- Google Analytics 4: property ID needed
- Facebook Ads Manager: access required

**Historical Data Exports:**
- Square sales CSV (all-time) → Identify highest revenue month
- Email list segmentation (past customers, lapsed, never purchased)
- Product inventory + COAs + images

**Approval Steps:**
- Review TEXAS_TAKEOVER_MASTER_PLAN.md ✅ (fused → OPS_TEXAS_TAKEOVER.md)
- Review EMAIL_CAMPAIGN_TEMPLATES.md ✅ (fused → MARKETING_EMAIL_CAMPAIGN.md)
- Review CLAUDE_CODE_CLI_IMPLEMENTATION_GUIDE.md ✅ (fused → DEVOPS_CLI_FUSION.md)

**Action:** All approvals → Jesse confirmation required

---

### ✅ **Phase 1: Critical Path Days 1-3 (Lines 40-165)**
**Reordered for Trinity Architecture:**

**REVISED DAY 1: Backend Deployment (Trinity Priority)**
**Morning (4 hours):**
- [ ] Deploy voice-service to Cloud Run
  - Fix crashes (check logs: `gcloud run services logs read voice-service`)
  - Update env vars (REASONING_GATEWAY_URL, REDIS_URL)
  - Verify /health returns 200
  - **Success Metric:** `curl https://voice-service-XXXXX.run.app/health` → 200 OK

**Afternoon (4 hours):**
- [ ] Deploy reasoning-gateway to Cloud Run
  - Build & deploy from `/backend/reasoning/` (if exists)
  - Verify /health returns 200
  - **Success Metric:** `curl https://reasoning-gateway-XXXXX.run.app/health` → 200 OK

**Evening (2 hours):**
- [ ] Build customer verification API
  - Add `/api/v1/customer/check-verification` endpoint
  - Add `/api/v1/order/flag-verification` endpoint
  - Deploy backend-api service to Cloud Run
  - **Success Metric:** `curl` tests pass for both endpoints

**REVISED DAY 2: Webstore Customization (Manual)**
**Morning (4 hours):**
- [ ] Age-gate modal implementation
  - Access reggieanddro.company.site/admin
  - Navigate to Themes → Customize → Edit HTML/CSS
  - Inject age-gate code (from TEXAS_TAKEOVER source, lines 44-97)
  - Test: Desktop + mobile, all browsers
  - **Success Metric:** Modal blocks access until age confirmed
  - **Evidence:** Screenshot in `.evidence/2025-10-03/lightspeed-theme/age-gate.png`

**Afternoon (4 hours):**
- [ ] Hero section + product pages
  - Create Texas Takeover hero image (Canva or hire designer)
  - Upload to Cloudinary OR reggieanddro.com/email-assets/
  - Inject hero HTML/CSS + countdown timer JavaScript
  - Update product page templates (Strain Story, terpene profiles, COAs)
  - **Success Metric:** Load time <2s, mobile-responsive, Lighthouse 90+
  - **Evidence:** Screenshots + Lighthouse report in `.evidence/2025-10-03/lightspeed-theme/`

**Evening (2 hours):**
- [ ] End-to-end test
  - Place test order on LightSpeed site
  - Verify age-gate appears
  - Complete checkout process (Square payment test)
  - Confirm verification API triggers
  - **Success Metric:** Entire flow works without errors
  - **Evidence:** Screen recording in `.evidence/2025-10-03/e2e-test/`

**REVISED DAY 3: Email Automation + Final Checks**
**Morning (3 hours):**
- [ ] SendGrid setup
  - Provision API key (`op item get sendgrid` OR create account)
  - Configure domain auth (add DNS: SPF, DKIM records to Cloudflare/Google Domains)
  - Create sender identity (noreply@reggieanddro.com)
  - Set up suppression groups (Marketing, Transactional)
  - **Success Metric:** Domain authenticated, test email sends successfully
  - **Evidence:** SendGrid dashboard screenshot in `.evidence/2025-10-03/sendgrid/`

**Afternoon (4 hours):**
- [ ] Email template creation
  - Load 4 launch campaign emails into SendGrid (from EMAIL_CAMPAIGN_TEMPLATES source)
  - Load 4 verification reminder emails
  - Load 1 review request email
  - Load 3 abandoned cart emails
  - Add personalization tokens ({{first_name}}, {{order_id}}, etc.)
  - Test renders (desktop + mobile preview)
  - **Success Metric:** All templates load correctly, tokens populate
  - **Evidence:** Screenshots of each template in `.evidence/2025-10-03/email-templates/`

- [ ] Segment email list
  - Export from Square (past customers, lapsed, abandoned carts)
  - Upload to SendGrid, create segments
  - **Success Metric:** Segments created, counts verified

**Evening (2 hours):**
- [ ] Final pre-launch checklist
  - [ ] Voice-service health check passing
  - [ ] Reasoning-gateway health check passing
  - [ ] Backend verification API endpoints tested
  - [ ] Age-gate working on all devices
  - [ ] Hero section + product pages live
  - [ ] Email templates loaded and scheduled
  - [ ] Google Analytics tracking verified (events firing)
  - [ ] Customer support ready (phone/text line staffed)
  - **Success Metric:** All green, ready to launch next Monday

**Evidence:** Comprehensive checklist completion in `.evidence/2025-10-03/pre-launch/checklist.md`

---

### ✅ **Phase 2: Launch Week (Lines 168-299)**
**Timeline Accurate IF Gates 1-3 Complete**

**Key Validations:**
- Day 4 (Monday 9AM): Email #1 "The Takeover Begins" sends
- Day 6 (Wednesday 11AM): Email #2 "Social Proof + Urgency" sends
- Day 8 (Friday 2PM): Email #3 "Referral Activation" sends
- Day 10 (Sunday 5PM): Email #4 "Last Chance + Subscription Tease" sends

**Daily Metrics Tracking:**
| Day | Orders Target | Revenue Target | Notes |
|-----|---------------|----------------|-------|
| Mon (Day 4) | 10-15 | $750-1,125 | Launch day excitement |
| Tue (Day 5) | 15-20 | $1,125-1,500 | Optimize based on Day 1 data |
| Wed (Day 6) | 20-25 | $1,500-1,875 | Email #2 sends |
| Thu (Day 7) | 25-30 | $1,875-2,250 | Flash sale |
| Fri (Day 8) | 30-35 | $2,250-2,625 | Email #3 sends, referrals activate |
| Sat-Sun (Day 9-10) | 40-50 | $3,000-3,750 | Weekend push |
| **Week 1 Total** | **175-200** | **$13,125-15,000** | **Baseline established** |

**Success Criteria:**
- Verification completion rate: 80%+
- Review collection: 20-30 reviews submitted
- Referrals: 10-15 successful referrals
- Customer satisfaction: <5% complaint rate

---

### ✅ **Phase 3: Scale & Optimize Weeks 2-4 (Lines 302-368)**
**Revenue Scaling Projections:**

**Week 2 (Days 11-17): OPTIMIZE**
- Orders: 200-250 (cumulative 375-450)
- Revenue: $15,000-18,750 (cumulative $28,125-33,750)
- Focus: Double down on winning campaigns, retarget abandoned carts

**Week 3 (Days 18-24): SCALE**
- Orders: 300-350 (cumulative 675-800)
- Revenue: $22,500-26,250 (cumulative $50,625-60,000)
- Focus: Lookalike audiences, PR push, influencer outreach

**Week 4 (Days 25-31): FINISH STRONG**
- Orders: 500-680 (cumulative 1,175-1,480)
- Revenue: $37,500-51,000 (cumulative $88,125-111,000)
- Focus: Final push, Halloween promo, subscription pre-orders

**End of Month Reality Check:**
- **Conservative:** 1,200 orders × $75 AOV = $90K revenue → $29K profit (35% margin)
- **Aggressive:** 1,680 orders × $100 AOV = $168K revenue → $76K profit (60% margin after optimizations)

**To Hit $100K+ Profit:** Requires $285K revenue OR 60%+ margin on $168K revenue (via higher AOV + conversion improvements)

---

## FALLACY SCAN • CRITICAL ASSUMPTIONS

### 🔴 **FALLACY #1: "Day 4 Launch Possible"**
**Claim:** Day 0 today → Day 4 launch (Monday)
**Reality:** Day 0 = infrastructure deployment start → Day 2-3 = backend ready → Day 5-6 = webstore ready → Day 7-8 = launch

**Revised Timeline:**
- **Day 0 (Today):** Deploy voice-service + reasoning-gateway
- **Day 1:** Build backend verification API endpoints
- **Day 2:** Manual LightSpeed customizations (age-gate, hero, product pages)
- **Day 3:** SendGrid setup + email template loading
- **Day 4:** Final testing + pre-launch checklist
- **Day 5-6:** Buffer for bug fixes
- **Day 7 (LAUNCH):** Monday of Week 2 (realistic launch date)

**Impact:** Pushes entire campaign timeline back 1 week
**Mitigation:** Use extra week for deeper testing + better inventory prep

---

### ⚠️ **FALLACY #2: "$100K Profit Assumes Perfect Execution"**
**Claim:** 1,680 orders × $100 AOV = $168K revenue → $100K+ profit
**Reality Check:**
- **AOV $75 (current):** Requires 1,333 orders → $100K revenue
- **AOV $100 (optimistic):** Requires 1,000 orders → $100K revenue
- **Profit margin 35% (realistic):** $100K revenue → $35K profit (NOT $100K profit)
- **Profit margin 60% (aggressive):** Requires premium mix, no refunds, low CAC

**To Achieve $100K+ Profit:**
- Need $285K revenue @ 35% margin OR $168K revenue @ 60% margin
- Requires 2,850 orders @ $100 AOV OR 3,800 orders @ $75 AOV
- Current plan targets 1,200-1,500 orders → $29K-42K profit (realistic)

**Recommendation:** Revise goal to "$100K revenue + $35K+ profit" OR extend timeline to 60 days for $100K profit

---

### ⚠️ **FALLACY #3: "Traffic Generation Math Underestimates Gap"**
**Claimed Traffic Sources:**
- Email: 1,250 visitors
- Social: 1,000 visitors
- Paid ads: 7,333 visitors
- Earned/PR: 6,000 visitors (OPTIMISTIC)
- Partner/influencer: 5,000 visitors (UNSUPPORTED)
**Total:** 20,583 visitors (NEED 42,000 for 4% conversion to hit 1,680 orders)

**Gap:** 21,417 visitors unaccounted for (51% of target)

**Resolution:**
1. Increase paid ad budget: $4K → $8-10K (double traffic to ~14,000 visitors)
2. Daily flash sales on Slickdeals, Reddit r/hempflowers (~5,000 visitors)
3. SMS campaign if phone list exists (~1,000 high-intent visitors)
4. Extend launch from 7 days → 14 days (accumulate traffic over time)

**Revised Target:** 35,000 visitors × 3% conversion × $85 AOV = $89,250 revenue → $31K profit (realistic)

---

### ⚠️ **FALLACY #4: "Verification Completion 80%+ Assumed, Not Validated"**
**Claim:** 80%+ customers will complete Veriff verification
**Reality:** No historical data on post-purchase verification flow

**Risk:** If completion rate = 50% → 50% refund rate → massive revenue loss + payment processor issues

**Mitigation:**
1. Simplify verification flow (1-click Veriff link, no manual uploads)
2. Incentivize completion (bonus 100 loyalty points = $10 off next order)
3. Phone support during business hours (hand-hold hesitant customers)
4. Track completion rate hourly Week 1, adjust email cadence if <70%

**Validation Required:** Run 10-20 test orders through full flow BEFORE launch, measure completion time + drop-off points

---

## NEXT ACTIONS • CRITICAL PATH

### **P0: Infrastructure Deployment (TODAY, 4-6 hours)**
1. Deploy voice-service to Cloud Run
   ```bash
   cd backend/voice-service  # Or wherever voice code lives
   gcloud run deploy voice-service --source . --region us-central1
   ```
2. Deploy reasoning-gateway to Cloud Run
   ```bash
   cd backend/reasoning-gateway
   gcloud run deploy reasoning-gateway --source . --region us-central1
   ```
3. Update frontend env vars (VITE_VOICE_API_BASE, VITE_REASONING_API_BASE)
4. Run health checks:
   ```bash
   curl https://voice-service-XXXXX.run.app/health
   curl https://reasoning-gateway-XXXXX.run.app/health
   ```
5. Run Playwright tests:
   ```bash
   pnpm playwright test --project=voice
   ```

**Evidence:** Deployment logs + health check outputs + Playwright results in `.evidence/2025-10-03/infrastructure-deploy/`

---

### **P0: Backend Verification API (DAY 1, 4-6 hours)**
1. Read existing backend architecture
   ```bash
   cat backend/README.md
   grep -r "database\|prisma\|sequelize" backend/ | head -20
   ```
2. Add verification endpoints (follow DEVOPS_CLI_FUSION specs)
3. Deploy backend-api to Cloud Run
4. Test endpoints with `curl`

**Evidence:** API test outputs in `.evidence/2025-10-03/api/`

---

### **P1: Manual LightSpeed Customization (DAY 2, 6-8 hours)**
1. Access reggieanddro.company.site/admin (`op item get reggieanddro`)
2. Inject age-gate modal (TEXAS_TAKEOVER source, lines 44-97)
3. Create & upload hero image (Texas flag + cannabis leaf)
4. Inject hero HTML/CSS + countdown timer
5. Update product page templates (Strain Story, terpenes, COAs)
6. Run Lighthouse audit (target: 90+ performance, 100 accessibility)

**Evidence:** Screenshots + Lighthouse report in `.evidence/2025-10-03/lightspeed-theme/`

---

### **P1: SendGrid Setup + Email Templates (DAY 3, 6-8 hours)**
1. Provision SendGrid API key (`op item get sendgrid` OR create account)
2. Configure domain auth (add DNS records)
3. Create 11 email templates (from EMAIL_CAMPAIGN_TEMPLATES source)
4. Segment email list (export from Square, upload to SendGrid)
5. Schedule launch email #1 for Monday 9:00 AM CST

**Evidence:** SendGrid dashboard screenshots + template IDs in `.evidence/2025-10-03/sendgrid/`

---

### **P2: Pre-Launch Testing (DAY 4, 4-6 hours)**
1. Run full E2E test (landing → cart → checkout → order confirmation)
2. Place 5 test orders, verify verification email sequence triggers
3. Test abandoned cart recovery (add to cart, don't complete, wait 1hr)
4. Test review request (manually trigger 7-day post-delivery email)
5. Verify Google Analytics events fire (page view, add-to-cart, purchase)

**Evidence:** Screen recordings + GA4 event logs in `.evidence/2025-10-03/pre-launch/`

---

### **P3: Launch Day Preparation (DAY 5-6, 2-4 hours)**
1. Create social media graphics (Canva, Texas Takeover theme)
2. Schedule social posts (Buffer/Hootsuite, 7 days of content)
3. Set up Facebook/Instagram ads (Texas, 25-60, $50/day budget)
4. Train customer support team (verification flow, common questions)
5. Prep inventory (30-day supply of bestsellers, shipping supplies stocked)

**Evidence:** Social calendar screenshot + ad approval in `.evidence/2025-10-03/marketing/`

---

### **P4: LAUNCH (DAY 7 - MONDAY)**
Follow One-Page Launch Day Checklist (lines 509-524 of source):

☐ 8:00 AM - Final systems check
☐ 9:00 AM - Launch Email #1 sends automatically
☐ 9:05 AM - Post launch announcement on social
☐ 9:15 AM - Monitor orders (celebrate first one!)
☐ 10:00 AM - Check email metrics
☐ 11:00 AM - Respond to all customer inquiries
☐ 12:00 PM - Verify paid ads are spending
☐ 3:00 PM - Mid-day metrics check
☐ 5:00 PM - Thank first 10 customers personally
☐ 9:00 PM - Daily debrief (wins, issues, tomorrow's plan)

**Evidence:** Launch day journal + metrics snapshot in `.evidence/2025-10-03/launch-day/`

---

## VALIDATION CHECKLIST • PRE-LAUNCH

Before approving "ready to launch," confirm:

### **Infrastructure**
- [ ] Voice-service health check passing (200 OK)
- [ ] Reasoning-gateway health check passing (200 OK)
- [ ] Backend verification API endpoints tested (`curl` outputs saved)
- [ ] Frontend env vars updated (VITE_VOICE_API_BASE, VITE_REASONING_API_BASE)

### **Webstore**
- [ ] Age-gate modal blocks access until age confirmed (tested on 3+ browsers)
- [ ] Hero countdown timer displays and updates every second
- [ ] Product pages show terpene profiles + COA expandables
- [ ] Loyalty points display in header ("XXX points = $XX off")
- [ ] Cart shows free shipping progress bar
- [ ] Checkout completes payment via Square (test transaction successful)

### **Email Automation**
- [ ] SendGrid domain authenticated (DNS records propagated, verified in dashboard)
- [ ] 11 email templates loaded (launch × 4, verification × 4, review × 1, cart × 3)
- [ ] Personalization tokens tested ({{first_name}}, {{order_id}}, etc. populate correctly)
- [ ] Launch email #1 scheduled for Monday 9:00 AM CST
- [ ] Test email delivers to inbox (not spam folder)

### **Analytics & Tracking**
- [ ] Google Analytics 4 tracking verified (page view event fires)
- [ ] GA4 e-commerce events configured (add-to-cart, purchase)
- [ ] UTM parameters appended to all email links (utm_source=email, etc.)
- [ ] Facebook Pixel installed (if using FB ads)

### **Operations**
- [ ] 30-day inventory for bestsellers confirmed
- [ ] Shipping supplies stocked (boxes, tape, labels)
- [ ] Customer support trained (verification flow, common questions)
- [ ] Support phone/text line staffed (business hours coverage)

**Evidence Required:** Comprehensive checklist with timestamps + screenshots in `.evidence/2025-10-03/pre-launch/final-checklist.md`

---

## MEMORY ANCHORS

**Key Files:**
- Source: `docs/incoming/2025-10-03/QUICK_START_ACTION_PLAN.md`
- Fusion: `docs/fusion/exec/EXEC_QUICK_START.md` (this file)
- Related fusions:
  - `docs/fusion/ops/OPS_TEXAS_TAKEOVER.md` (campaign strategy)
  - `docs/fusion/marketing/MARKETING_EMAIL_CAMPAIGN.md` (email templates)
  - `docs/fusion/devops/DEVOPS_CLI_FUSION.md` (technical implementation)

**Dependencies:**
- Voice-service + reasoning-gateway (P0 BLOCKER)
- Backend verification API (P0 BLOCKER)
- LightSpeed admin credentials (P1)
- SendGrid API key + domain auth (P1)
- Square API token (P1)
- Historical sales data (for segmentation + targeting)

**Revised Timeline:**
- Day 0 (Today): Infrastructure deployment
- Day 1: Backend API build
- Day 2: Manual LightSpeed customizations
- Day 3: SendGrid setup + email templates
- Day 4: Pre-launch testing
- Day 5-6: Bug fixes + final prep
- Day 7 (LAUNCH): Monday of Week 2

**Success Criteria (Realistic):**
- Week 1: 150-200 orders, $11K-15K revenue
- Week 4: 1,200-1,500 orders, $90K-112K revenue, $29K-42K profit
- Stretch Goal: $168K revenue, $76K profit (requires 60% margin + higher AOV)

---

## FINAL ASSESSMENT

**This plan is Tier-1 ambitious** but underestimates infrastructure dependencies.
**Critical Path:** Infrastructure → Backend → Webstore → Campaign (sequential, not parallel).
**Realistic Launch:** Day 7 (not Day 4) after full testing + validation.

**Recommended Path:**
1. Deploy Trinity infrastructure (voice + reasoning) TODAY (P0)
2. Build backend verification API DAY 1 (P0)
3. Manual LightSpeed work DAY 2 (P1)
4. SendGrid setup DAY 3 (P1)
5. Pre-launch testing DAY 4-5 (P2)
6. LAUNCH DAY 7 (Monday Week 2)

**Risk Mitigation:**
- If verification completion <70% → Add phone support + incentives
- If traffic <20K visitors → Increase ad budget + extend launch window
- If conversion <2.5% → A/B test everything, simplify checkout
- If AOV <$75 → Upsells, bundles, free shipping thresholds

**Logged:** 2025-10-03 18:45 UTC
**Fusion by:** Sonnet 4.5
**Next Fusion:** TIER1 legal/policy docs → COMPLIANCE_FUSION.md
