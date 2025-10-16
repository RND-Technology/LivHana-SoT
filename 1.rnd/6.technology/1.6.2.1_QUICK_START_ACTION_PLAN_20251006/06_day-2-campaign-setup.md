### DAY 2: CAMPAIGN SETUP

**Morning (3 hours):**

- [ ] **SendGrid Account Setup**
  - Create account (or log in to existing)
  - Authenticate domain (SPF, DKIM records)
  - Create sender identity (<noreply@reggieanddro.com>)
  - Set up suppression groups (Marketing, Transactional)
  - **Success Metric:** Domain authenticated, test email sends successfully

- [ ] **Email Template Creation** (Use templates from EMAIL_CAMPAIGN_TEMPLATES.md)
  - Load all 4 launch campaign emails into SendGrid
  - Load verification reminder sequence (4 emails)
  - Add personalization tokens ({{first_name}}, {{order_id}}, etc.)
  - Test renders (desktop + mobile preview)
  - **Success Metric:** All templates load correctly, tokens populate

**Afternoon (4 hours):**

- [ ] **Segment Email List**
  - Past Customers (Priority 1) - purchased within 12 months
  - Lapsed Customers (Priority 2) - purchased 12-24 months ago
  - Abandoned Carts (Priority 3) - added to cart but didn't buy
  - Never Purchased (Priority 4) - signed up but never bought
  - **Success Metric:** Segments created in SendGrid, counts verified

- [ ] **Schedule Launch Emails**
  - Email 1: "The Takeover Begins" - scheduled for Monday 9:00 AM CST
  - Set up A/B test (3 subject lines, 20% test size, winner to 80%)
  - Add UTM parameters (utm_source=email, utm_campaign=texas-takeover)
  - **Success Metric:** Email scheduled, test configured, UTMs tracked in GA4

**Evening (2 hours):**

- [ ] **Social Media Prep**
  - Draft launch week posts (Instagram, Facebook, Twitter/X)
  - Create graphics in Canva (Texas flag theme, product photos)
  - Schedule posts for Monday launch (use Buffer or Hootsuite)
  - **Success Metric:** 7 days of content scheduled

---
