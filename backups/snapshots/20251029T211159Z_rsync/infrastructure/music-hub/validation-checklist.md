# VALIDATION CHECKLIST - MUSIC HUB IGNITION

**Mission:** Comprehensive QA testing for 63-domain redirect + landing page architecture

**Version:** 1.0.0
**Updated:** 2025-10-27
**Target:** music.livhana.ai

---

## Testing Overview

### Objectives

- ✅ Verify all 63 domains redirect correctly
- ✅ Validate landing page performance (<2s load)
- ✅ Test age-gate compliance (21+)
- ✅ Confirm analytics tracking
- ✅ Check mobile responsiveness
- ✅ Validate SEO metadata
- ✅ Test cross-domain attribution

### Test Environments

- [ ] **Local:** Development testing
- [ ] **Staging:** Pre-production validation
- [ ] **Production:** Live environment checks

### Testing Tools Required

- Chrome DevTools
- Google Tag Assistant
- PageSpeed Insights
- Mobile device (iOS/Android)
- curl/wget (command line)
- Browser: Chrome, Firefox, Safari, Edge

---

## Phase 1: Pre-Deployment Validation

### 1.1 File Integrity Checks

**Location:** `/infrastructure/music-hub/`

- [ ] `cloudflare-redirect-rules.yaml` exists
- [ ] `music-hub-landing.html` exists
- [ ] `age-gate-modal.html` exists
- [ ] `deploy-music-hub.sh` exists and is executable
- [ ] `analytics-setup.md` exists
- [ ] `validation-checklist.md` exists (this file)

**Validation Commands:**

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/infrastructure/music-hub
ls -lh
chmod +x deploy-music-hub.sh
```

### 1.2 Configuration Validation

#### YAML Redirect Rules

- [ ] Total redirect count = 63
- [ ] All source URLs use HTTPS
- [ ] Target URL = `https://music.livhana.ai`
- [ ] Status code = 301 (permanent)
- [ ] `preserve_path: true` on all rules
- [ ] `preserve_query: true` on all rules
- [ ] Exception domains NOT included (6 domains)

**Validation Command:**

```bash
yq eval '.redirects | length' cloudflare-redirect-rules.yaml
# Expected output: 63
```

#### Exception Domains Check

Verify these 6 domains are NOT in redirect list:

- [ ] reggieanddro.com
- [ ] oneplantsolution.com
- [ ] highnooncartoon.com
- [ ] herbitrage.com
- [ ] exoticcanopysolutions.com
- [ ] reggieandrosocialclub.com

**Validation Command:**

```bash
grep -E "reggieanddro\.com$|oneplantsolution\.com|highnooncartoon\.com|herbitrage\.com|exoticcanopysolutions\.com|reggieandrosocialclub\.com" cloudflare-redirect-rules.yaml
# Should return NO MATCHES (except in comments)
```

### 1.3 HTML Validation

#### Landing Page Checks

- [ ] Valid HTML5 (no syntax errors)
- [ ] Meta viewport tag present
- [ ] GA4 tracking code present
- [ ] Canonical URL = `https://music.livhana.ai`
- [ ] Open Graph tags complete
- [ ] Twitter Card tags complete
- [ ] Schema.org markup (MusicPlaylist, Organization)
- [ ] Suno playlist embed configured
- [ ] Age gate container div present
- [ ] CTA button with tracking

**Validation Tools:**

```bash
# HTML Validation
curl -s https://validator.w3.org/nu/?doc=file:///path/to/music-hub-landing.html

# Or use: https://validator.w3.org/
```

#### Age Gate Modal Checks

- [ ] Valid HTML5
- [ ] 21+ age verification language
- [ ] NIST-compliant THC language (0.3% Δ9-THC)
- [ ] "No medical claims" disclaimer
- [ ] Cookie-based verification (24hr)
- [ ] "Yes" and "No" buttons functional
- [ ] Exit redirect for under-21 users
- [ ] Accessibility features (keyboard nav)

---

## Phase 2: Cloudflare Redirect Testing

### 2.1 CSV Generation

- [ ] Run: `./deploy-music-hub.sh --generate-csv`
- [ ] CSV file created: `cloudflare-redirects.csv`
- [ ] CSV row count = 64 (63 redirects + 1 header)
- [ ] CSV format valid (no syntax errors)

**Validation:**

```bash
./deploy-music-hub.sh --generate-csv
wc -l cloudflare-redirects.csv
# Expected: 64 lines (1 header + 63 rules)

head -n 5 cloudflare-redirects.csv
```

### 2.2 Sample Redirect Tests (Pre-Deployment)

Use `curl` to test redirects **before** Cloudflare deployment:

**Test Command Template:**

```bash
curl -I https://DOMAIN.com 2>&1 | grep -E "HTTP|Location"
```

#### Test Sample (5 domains per silo):

**Silo 1: R&D Retail**

- [ ] reggieanddroalice.com → music.livhana.ai (301)
- [ ] thcasanantonio.com → music.livhana.ai (301)
- [ ] cannabiscookiestexas.com → music.livhana.ai (301)

**Silo 2: Content & Media**

- [ ] getlooseyoga.com → music.livhana.ai (301)
- [ ] smokingyoga.com → music.livhana.ai (301)
- [ ] loudcbdflower.com → music.livhana.ai (301)

**Silo 3: Policy & Advocacy**

- [ ] ageverifysi.com → music.livhana.ai (301)
- [ ] jesseniesen.com → music.livhana.ai (301)
- [ ] texascoa.com → music.livhana.ai (301)

**Silo 4: Commerce & B2B**

- [ ] hempretailai.com → music.livhana.ai (301)
- [ ] terpwerk.com → music.livhana.ai (301)
- [ ] shipcodesi.com → music.livhana.ai (301)

### 2.3 Query String Preservation Test

Test that UTM parameters are preserved:

```bash
curl -I "https://thcasanantonio.com?utm_source=test&utm_medium=redirect&utm_campaign=validation" 2>&1 | grep Location
# Expected: Location should include utm_source, utm_medium, utm_campaign
```

- [ ] UTM parameters preserved in redirect
- [ ] Query string intact after redirect
- [ ] No parameter encoding issues

---

## Phase 3: Landing Page Validation

### 3.1 Performance Testing

#### PageSpeed Insights

**URL:** https://pagespeed.web.dev/

- [ ] Desktop Score: 90+ (green)
- [ ] Mobile Score: 85+ (green)
- [ ] First Contentful Paint (FCP): <1.5s
- [ ] Largest Contentful Paint (LCP): <2.5s
- [ ] Total Blocking Time (TBT): <300ms
- [ ] Cumulative Layout Shift (CLS): <0.1

**Test URL:** `https://music.livhana.ai`

#### WebPageTest

**URL:** https://www.webpagetest.org/

- [ ] Load Time: <2s (target met)
- [ ] Start Render: <1s
- [ ] Speed Index: <2s
- [ ] Time to Interactive: <3s

**Test Configuration:**
- Location: Dallas, TX (closest to target audience)
- Browser: Chrome
- Connection: 4G LTE

### 3.2 Responsive Design Testing

#### Desktop (1920x1080)

- [ ] Layout renders correctly
- [ ] Suno playlist embed visible
- [ ] CTA button prominent
- [ ] No horizontal scroll
- [ ] Typography readable

#### Tablet (iPad - 768x1024)

- [ ] Layout adapts correctly
- [ ] Touch targets >44px
- [ ] No content cutoff
- [ ] Playlist embed responsive

#### Mobile (iPhone 13 - 390x844)

- [ ] Mobile-first layout active
- [ ] Single-column design
- [ ] CTA button accessible
- [ ] Age gate modal fits screen
- [ ] No pinch-to-zoom required

**Test Tools:**

- Chrome DevTools → Device Mode
- BrowserStack (real devices)
- Physical device testing

### 3.3 Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest - macOS & iOS)
- [ ] Edge (latest)
- [ ] Samsung Internet (Android)

**Test Matrix:**

| Browser | Desktop | Mobile | Pass/Fail |
|---------|---------|--------|-----------|
| Chrome 120+ | ✅ | ✅ | |
| Firefox 121+ | ✅ | ✅ | |
| Safari 17+ | ✅ | ✅ | |
| Edge 120+ | ✅ | ✅ | |
| Samsung Internet | N/A | ✅ | |

### 3.4 Age Gate Testing

#### Functionality Tests

- [ ] Age gate appears on first visit
- [ ] "I'm 21+" button works
- [ ] "I'm Under 21" button redirects to exit URL
- [ ] Cookie set on verification (24hr expiry)
- [ ] Age gate doesn't reappear within 24hrs
- [ ] Age gate reappears after 24hrs
- [ ] Private/Incognito mode shows age gate

**Manual Test Steps:**

1. Clear cookies
2. Visit `https://music.livhana.ai`
3. Verify age gate appears
4. Click "I'm 21+"
5. Check cookie: `livhana_age_verified=true`
6. Refresh page
7. Verify age gate doesn't reappear

#### Compliance Language Checks

- [ ] "21+ years or older" language present
- [ ] "0.3% or less delta-9 THC" language present
- [ ] "Hemp-derived" language present
- [ ] "2018 Farm Bill" reference present
- [ ] "NIST standards" reference present
- [ ] "No medical claims" disclaimer present
- [ ] "Not FDA approved" disclaimer present
- [ ] State law variance warning present

#### Accessibility (WCAG 2.1 AA)

- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Focus trap within modal
- [ ] Screen reader compatible (test with VoiceOver/NVDA)
- [ ] Color contrast ratio >4.5:1
- [ ] Button labels descriptive

---

## Phase 4: Analytics Validation

### 4.1 GA4 Tag Verification

#### Google Tag Assistant

- [ ] Install Chrome extension
- [ ] Visit `https://music.livhana.ai`
- [ ] Tag Assistant shows GA4 tag firing
- [ ] No errors or warnings
- [ ] Measurement ID correct (G-XXXXXXXXXX)

#### GA4 DebugView

- [ ] Enable GA Debugger extension
- [ ] Visit landing page
- [ ] Open GA4 → DebugView
- [ ] See real-time events:
  - [ ] `page_view`
  - [ ] `referrer_detected`
  - [ ] `age_gate_verified` (after clicking)
  - [ ] `cta_click` (after CTA button)
  - [ ] `playlist_play` (if Suno supports)

### 4.2 Event Tracking Tests

#### Page View Event

```javascript
// Manual trigger in console
gtag('event', 'page_view', {
    page_title: 'Test',
    page_location: window.location.href
});
```

- [ ] Event fires in GA4 DebugView
- [ ] Parameters include page_title, page_location

#### Referrer Detection Event

```javascript
// Check in console
console.log(document.referrer);
```

- [ ] Referrer tracked correctly
- [ ] UTM source extracted from URL
- [ ] Event sent to GA4

#### Age Gate Event

- [ ] Click "I'm 21+" → `age_gate_verified` fires
- [ ] Click "I'm Under 21" → `age_gate_denied` fires
- [ ] Timestamp parameter present

#### CTA Click Event

- [ ] Click CTA button
- [ ] `cta_click` event fires
- [ ] Parameters: action, destination

### 4.3 Cross-Domain Tracking

#### Linker Parameter Test

1. Visit: `https://music.livhana.ai`
2. Click CTA button
3. Check URL on reggieanddro.com
4. Verify: `?_gl=1*xxxxxx...` parameter present

- [ ] `_gl` parameter appended to CTA link
- [ ] Parameter format valid
- [ ] GA4 client ID matches across domains

#### Attribution Test

1. Open GA4 → Reports → Acquisition → Traffic Acquisition
2. Filter: Source = "music.livhana.ai"
3. Check: Sessions from music hub are attributed

- [ ] Sessions attributed to music hub source
- [ ] Not showing as "direct / none"
- [ ] User journey preserved

### 4.4 UTM Parameter Tracking

Test URL: `https://music.livhana.ai?utm_source=test&utm_medium=validation&utm_campaign=qa&utm_content=checklist`

- [ ] UTM parameters appear in GA4
- [ ] Source = "test"
- [ ] Medium = "validation"
- [ ] Campaign = "qa"
- [ ] Content = "checklist"
- [ ] Parameters preserved through redirect

---

## Phase 5: SEO Validation

### 5.1 On-Page SEO

- [ ] Title tag present and descriptive
- [ ] Meta description present (150-160 chars)
- [ ] H1 tag present and unique
- [ ] Canonical URL = `https://music.livhana.ai`
- [ ] Alt text on images (if any)
- [ ] Robots meta tag allows indexing
- [ ] Sitemap.xml generated (optional)

**Check with:**

```bash
curl -s https://music.livhana.ai | grep -E "<title>|<meta name=\"description\"|<h1>|<link rel=\"canonical\""
```

### 5.2 Schema Markup Validation

**Tool:** https://validator.schema.org/

- [ ] MusicPlaylist schema present
- [ ] Organization schema present
- [ ] No schema errors
- [ ] All required properties included

**Test:**

1. Copy HTML source
2. Paste into Schema Markup Validator
3. Verify: 0 errors, 0 warnings

### 5.3 Open Graph & Twitter Cards

#### Open Graph

- [ ] `og:type` = website
- [ ] `og:url` = https://music.livhana.ai
- [ ] `og:title` present
- [ ] `og:description` present
- [ ] `og:image` present and valid
- [ ] Image dimensions: 1200x630

#### Twitter Cards

- [ ] `twitter:card` = summary_large_image
- [ ] `twitter:title` present
- [ ] `twitter:description` present
- [ ] `twitter:image` present

**Preview Tools:**

- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator

### 5.4 Redirect Chain Analysis

Test for redirect chain efficiency:

```bash
curl -L -I -s https://reggieanddroalice.com | grep -E "HTTP|Location"
```

- [ ] Single 301 redirect (1 hop only)
- [ ] No 302 (temporary) redirects
- [ ] No redirect loops
- [ ] Final destination: 200 OK

---

## Phase 6: Security & Compliance

### 6.1 SSL/TLS Validation

- [ ] HTTPS enforced on music.livhana.ai
- [ ] Valid SSL certificate (not expired)
- [ ] Certificate chain complete
- [ ] No mixed content warnings
- [ ] TLS 1.2 or higher

**Test with:**

```bash
curl -I https://music.livhana.ai
# Should return: HTTP/2 200
```

**SSL Test:** https://www.ssllabs.com/ssltest/

- [ ] Grade: A or A+

### 6.2 Security Headers

- [ ] `X-Frame-Options: SAMEORIGIN`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Content-Security-Policy` (optional but recommended)

**Check with:**

```bash
curl -I https://music.livhana.ai | grep -E "X-Frame|X-Content|X-XSS|Referrer"
```

### 6.3 Privacy Compliance

#### Cookie Consent

- [ ] Age gate acts as implicit consent
- [ ] Privacy policy linked
- [ ] Cookie policy documented
- [ ] User can opt-out (browser settings)

#### Data Minimization

- [ ] Only essential tracking
- [ ] No PII (personally identifiable information) collected
- [ ] IP anonymization enabled in GA4
- [ ] GDPR-compliant (if applicable)
- [ ] CCPA-compliant (California)

### 6.4 Compliance Language Audit

#### Hemp Compliance (NIST)

- [ ] "0.3% or less delta-9 THC" language
- [ ] "Hemp-derived" specified
- [ ] "2018 Farm Bill" reference
- [ ] "NIST standards" reference

#### Disclaimers

- [ ] "No medical claims" present
- [ ] "Not FDA approved" present
- [ ] "21+ only" age restriction
- [ ] "State laws vary" warning

---

## Phase 7: Load & Stress Testing

### 7.1 Simulated Traffic Test

Use Apache Bench (ab) to simulate concurrent users:

```bash
ab -n 1000 -c 50 https://music.livhana.ai/
```

**Success Criteria:**

- [ ] 0% failed requests
- [ ] Mean response time <500ms
- [ ] 95th percentile <1s
- [ ] No 5xx errors

### 7.2 Redirect Load Test

Test redirect infrastructure under load:

```bash
ab -n 100 -c 10 https://thcasanantonio.com/
```

- [ ] All redirects return 301
- [ ] No timeouts
- [ ] Consistent response times

---

## Phase 8: User Acceptance Testing (UAT)

### 8.1 End-to-End User Journey

**Test as real user:**

1. **Entry:** Visit source domain (e.g., thcasanantonio.com)
2. **Redirect:** Verify 301 redirect to music.livhana.ai
3. **Age Gate:** Complete 21+ verification
4. **Engagement:** Play Suno playlist
5. **CTA:** Click "Grow baby grow..." button
6. **Commerce:** Land on reggieanddro.com
7. **Attribution:** Verify GA4 tracks full journey

**Checklist:**

- [ ] Smooth redirect (no errors)
- [ ] Page loads <2s
- [ ] Age gate appears and functions
- [ ] Playlist plays without buffering
- [ ] CTA button works
- [ ] Lands on correct shop page
- [ ] GA4 shows complete funnel

### 8.2 Mobile User Journey

Repeat end-to-end test on:

- [ ] iPhone (iOS Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad)

### 8.3 Accessibility Journey

Test with assistive technology:

- [ ] Screen reader (VoiceOver / NVDA)
- [ ] Keyboard-only navigation
- [ ] Voice control (iOS/Android)

---

## Phase 9: Post-Deployment Monitoring

### 9.1 First 24 Hours

**Hourly checks:**

- [ ] GA4 Real-Time report shows traffic
- [ ] No 404 errors in logs
- [ ] All redirects functioning
- [ ] Page load time <2s
- [ ] No JavaScript errors

**Tools:**

- GA4 Real-Time dashboard
- Cloud Run logs (GCP)
- Cloudflare Analytics
- UptimeRobot (or similar)

### 9.2 First Week

**Daily checks:**

- [ ] Traffic volume matches expectations
- [ ] Age gate conversion >85%
- [ ] Music engagement >40%
- [ ] CTA click rate >25%
- [ ] Cross-domain attribution working

### 9.3 First Month

**Weekly checks:**

- [ ] ROI calculation
- [ ] Funnel optimization opportunities
- [ ] A/B test variations
- [ ] Dashboard review with stakeholders

---

## Phase 10: Rollback Testing

### 10.1 Rollback Procedure Validation

**Test rollback capability:**

1. Disable Cloudflare redirect rule
2. Verify source domains revert to original behavior
3. Re-enable redirect rule
4. Verify redirects resume

- [ ] Rollback executes in <5 minutes
- [ ] No data loss
- [ ] No downtime
- [ ] Re-enable works correctly

### 10.2 Emergency Contacts

- [ ] Cloudflare dashboard access verified
- [ ] GCP console access verified
- [ ] Emergency contact list documented
- [ ] Escalation path defined

---

## Testing Sign-Off

### Validation Summary

| Phase | Status | Notes | Tested By | Date |
|-------|--------|-------|-----------|------|
| Phase 1: Pre-Deployment | ⬜ | | | |
| Phase 2: Cloudflare Redirects | ⬜ | | | |
| Phase 3: Landing Page | ⬜ | | | |
| Phase 4: Analytics | ⬜ | | | |
| Phase 5: SEO | ⬜ | | | |
| Phase 6: Security | ⬜ | | | |
| Phase 7: Load Testing | ⬜ | | | |
| Phase 8: UAT | ⬜ | | | |
| Phase 9: Monitoring | ⬜ | | | |
| Phase 10: Rollback | ⬜ | | | |

**Legend:**
- ⬜ Not Started
- 🔄 In Progress
- ✅ Passed
- ❌ Failed
- ⚠️ Needs Review

### Final Approval

**QA Lead:** _____________________________ Date: __________

**Technical Lead:** _____________________________ Date: __________

**Project Owner (Jesse Niesen):** _____________________________ Date: __________

### Go/No-Go Decision

- [ ] **GO:** All critical tests passed, deploy to production
- [ ] **NO-GO:** Critical issues found, resolve before deployment

**Deployment Window:** ___________________________

**Rollback Plan Confirmed:** ⬜ Yes ⬜ No

---

## Appendix: Test Scripts

### A. Bulk Redirect Validation Script

```bash
#!/bin/bash
# Test all 63 domains

DOMAINS=(
    "reggieanddroalice.com"
    "thcasanantonio.com"
    "cannabiscookiestexas.com"
    # ... add all 63 domains
)

for domain in "${DOMAINS[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "https://${domain}")
    location=$(curl -s -I "https://${domain}" | grep -i "Location:" | awk '{print $2}')

    if [[ $status -eq 301 && $location == *"music.livhana.ai"* ]]; then
        echo "✓ $domain → music.livhana.ai (301)"
    else
        echo "✗ $domain - FAILED (Status: $status, Location: $location)"
    fi
done
```

### B. Performance Benchmark Script

```bash
#!/bin/bash
# Measure page load time

for i in {1..10}; do
    time=$(curl -s -o /dev/null -w "%{time_total}" https://music.livhana.ai)
    echo "Test $i: ${time}s"
done
```

---

**BATTLE CRY:** "Grow baby grow and Sell baby Sell — Stay TOONED!"

**Status:** READY FOR QA TESTING

---

*Generated by Claude Code - LivHana Trinity SoT*
