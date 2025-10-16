### DAY 1: TECHNICAL FOUNDATION

**Morning (4 hours):**

- [ ] **Age-Gate Modal** (Claude Code CLI - use prompt from implementation guide)
  - Deploy to LightSpeed staging (if available) or production
  - Test: Desktop + mobile, all major browsers
  - Verify: SessionStorage working, exit button functional, Terms link correct
  - **Success Metric:** Modal blocks access until age confirmed

- [ ] **Hero Section Update** (Claude Code CLI)
  - Create "TEXAS TAKEOVER" branded hero with countdown timer
  - Optimize images (WebP format, <200KB)
  - Add trust badges, social proof, CTAs
  - **Success Metric:** Load time <2 seconds, mobile-responsive

**Afternoon (4 hours):**

- [ ] **Product Page Optimization** (Claude Code CLI)
  - Implement new template with reviews, terpene profiles, COA expandables
  - Add urgency triggers (low stock alerts, "X sold this week")
  - Ensure loyalty points display ("Earn XX points with this purchase")
  - **Success Metric:** Product pages render correctly, all dynamic elements working

- [ ] **Square API Integration - Phase 1** (Claude Code CLI)
  - Deploy customer verification check endpoint
  - Test with sample customer data
  - Integrate with LightSpeed checkout (webhook or manual check)
  - **Success Metric:** API returns verification status in <100ms

**Evening (2 hours):**

- [ ] **End-to-End Test**
  - Place test order on LightSpeed site
  - Verify age-gate appears
  - Complete checkout process
  - Confirm verification check triggers
  - Check email delivery (if automated)
  - **Success Metric:** Entire flow works without errors

---
