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
  - Create sender identity (<noreply@reggieanddro.com>)
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
