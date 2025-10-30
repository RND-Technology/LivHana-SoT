# ANALYTICS SETUP - MUSIC HUB IGNITION

**Mission:** Track music engagement → traffic → commerce conversion across 63-domain redirect architecture

**Version:** 1.0.0
**Updated:** 2025-10-27
**Target:** music.livhana.ai

---

## Table of Contents

1. [Overview](#overview)
2. [Google Analytics 4 (GA4) Setup](#google-analytics-4-ga4-setup)
3. [Cross-Domain Tracking](#cross-domain-tracking)
4. [Event Tracking Strategy](#event-tracking-strategy)
5. [UTM Parameter Preservation](#utm-parameter-preservation)
6. [Dashboard Configuration](#dashboard-configuration)
7. [Key Metrics & KPIs](#key-metrics--kpis)
8. [Testing & Validation](#testing--validation)
9. [Privacy & Compliance](#privacy--compliance)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Business Objectives

The Music Hub analytics architecture tracks the **"Grow Sell Heal" SEO flywheel**:

1. **Grow:** Redirect traffic from 63 domains to unified music hub
2. **Sell:** Convert music engagement into commerce action
3. **Heal:** Build brand loyalty through unified experience

### Key Questions We Answer

- Which domains drive the most music engagement?
- What's the conversion path from music → shop?
- Which Suno tracks drive the most CTA clicks?
- How effective is the age-gate at qualifying traffic?
- What's the ROI of the domain consolidation?

### Architecture

```
63 Source Domains → music.livhana.ai (Landing) → CTA → reggieanddro.com (Shop)
                         ↓
                    GA4 Analytics
                         ↓
                Cross-Domain Tracking
                         ↓
              Conversion Attribution
```

---

## Google Analytics 4 (GA4) Setup

### Step 1: Create GA4 Property

1. **Go to:** [Google Analytics](https://analytics.google.com/)
2. **Click:** Admin (gear icon)
3. **Create Property:**
   - Property Name: `Liv Hana Music Hub`
   - Reporting Time Zone: `US/Central (America/Chicago)`
   - Currency: `USD`
4. **Create Data Stream:**
   - Platform: `Web`
   - Website URL: `https://music.livhana.ai`
   - Stream Name: `Music Hub Production`
   - Enhanced Measurement: `ON` (enable all)

5. **Copy Measurement ID:** `G-XXXXXXXXXX`

### Step 2: Install GA4 Tag

Replace `G-XXXXXXXXXX` in `/infrastructure/music-hub/music-hub-landing.html`:

```html
<!-- Google Analytics 4 (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX', {
        'anonymize_ip': true,
        'cookie_flags': 'SameSite=None;Secure',
        'linker': {
            'domains': ['reggieanddro.com', 'oneplantsolution.com', 'highnoontooned.com', 'herbitrage.com']
        }
    });
</script>
```

### Step 3: Enable Enhanced Measurement

In GA4 Admin → Data Streams → Your Stream → Enhanced Measurement:

- ✅ Page views
- ✅ Scrolls (90% threshold)
- ✅ Outbound clicks
- ✅ Site search (disabled - not applicable)
- ✅ Video engagement (Suno iframe tracking)
- ✅ File downloads (disabled)

---

## Cross-Domain Tracking

### Configuration

Cross-domain tracking is **critical** for attribution from music hub → commerce sites.

#### Linker Domains

Configure in GA4 tag (already in `music-hub-landing.html`):

```javascript
'linker': {
    'domains': [
        'reggieanddro.com',
        'oneplantsolution.com',
        'highnoontooned.com',
        'herbitrage.com'
    ]
}
```

#### How It Works

1. User visits `music.livhana.ai` → GA4 sets cookie
2. User clicks CTA → redirects to `reggieanddro.com?_gl=xxxxx`
3. `_gl` parameter contains GA4 client ID
4. reggieanddro.com GA4 tag reads `_gl` and attributes session

### Implementation Checklist

- [ ] Install GA4 on music.livhana.ai (landing page)
- [ ] Install GA4 on reggieanddro.com (same property ID)
- [ ] Install GA4 on oneplantsolution.com (same property ID)
- [ ] Install GA4 on highnoontooned.com (same property ID)
- [ ] Install GA4 on herbitrage.com (same property ID)
- [ ] Configure linker domains in all sites
- [ ] Test cross-domain tracking (see Testing section)

### Referral Exclusions

In GA4 Admin → Data Streams → Configure Tag Settings → More Tagging Settings → List Unwanted Referrals:

Add all domains to prevent self-referrals:
- `music.livhana.ai`
- `reggieanddro.com`
- `oneplantsolution.com`
- `highnoontooned.com`
- `herbitrage.com`

---

## Event Tracking Strategy

### Auto-Tracked Events (Enhanced Measurement)

- `page_view` - Landing page loads
- `scroll` - User scrolls 90% down page
- `click` - Outbound link clicks (CTA button)
- `video_start` - Suno playlist plays (if iframe supports)
- `video_progress` - Playlist progress (25%, 50%, 75%, 100%)

### Custom Events (JavaScript)

#### 1. Referrer Detection

Tracks which source domain sent the user:

```javascript
gtag('event', 'referrer_detected', {
    source: document.referrer || 'direct',
    utm_source: new URLSearchParams(window.location.search).get('source') || 'unknown'
});
```

**Parameters:**
- `source`: Full referrer URL
- `utm_source`: UTM source parameter (if present)

#### 2. Age Gate Verification

Tracks age gate interaction:

```javascript
// User clicks "I'm 21+"
gtag('event', 'age_gate_verified', {
    timestamp: new Date().toISOString()
});

// User clicks "I'm Under 21"
gtag('event', 'age_gate_denied', {
    timestamp: new Date().toISOString()
});
```

**Parameters:**
- `timestamp`: ISO 8601 timestamp

#### 3. CTA Click

Tracks "Grow baby grow..." button clicks:

```javascript
function trackCTA(action) {
    gtag('event', 'cta_click', {
        action: action,
        destination: 'reggieanddro.com'
    });
}
```

**Parameters:**
- `action`: CTA action name (e.g., "shop_now")
- `destination`: Target domain

#### 4. Playlist Interaction

Tracks Suno playlist engagement:

```javascript
// Play event
gtag('event', 'playlist_play', {
    song: 'Track Title',
    position: 1
});

// Complete event
gtag('event', 'playlist_complete', {
    song: 'Track Title',
    duration: 180 // seconds
});
```

**Parameters:**
- `song`: Track name
- `position`: Track number in playlist
- `duration`: Playback duration (seconds)

---

## UTM Parameter Preservation

### UTM Taxonomy

Use consistent UTM parameters across all marketing channels:

#### Campaign Structure

```
https://music.livhana.ai?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content}&utm_term={term}
```

#### Parameter Definitions

| Parameter | Purpose | Example Values |
|-----------|---------|----------------|
| `utm_source` | Traffic source | `reggieanddro`, `facebook`, `google`, `email` |
| `utm_medium` | Marketing medium | `redirect`, `social`, `cpc`, `email`, `organic` |
| `utm_campaign` | Campaign name | `music-hub-launch`, `summer-2025`, `thca-promo` |
| `utm_content` | Ad/link variant | `banner-ad`, `cta-button`, `footer-link` |
| `utm_term` | Paid keywords | `thca-flower`, `hemp-music`, `reggie-dro` |

#### Example URLs

```bash
# Email campaign
https://music.livhana.ai?utm_source=email&utm_medium=newsletter&utm_campaign=music-hub-launch&utm_content=cta-listen-now

# Facebook ad
https://music.livhana.ai?utm_source=facebook&utm_medium=cpc&utm_campaign=summer-2025&utm_content=video-ad-1

# Organic redirect (from thcasanantonio.com)
https://music.livhana.ai?utm_source=thcasanantonio&utm_medium=redirect&utm_campaign=domain-consolidation
```

### Preservation Logic

The landing page JavaScript **automatically preserves UTM parameters** when redirecting to CTA:

```javascript
// Extract UTM params from current URL
const urlParams = new URLSearchParams(window.location.search);

// Append to CTA link
const ctaLink = 'https://reggieanddro.com?' + urlParams.toString();
```

This ensures attribution is maintained throughout the funnel.

---

## Dashboard Configuration

### Custom Reports

#### 1. Domain Performance Report

**Dimensions:**
- First User Source (UTM source)
- Page Location (full URL)
- Landing Page

**Metrics:**
- Users
- Sessions
- Engagement Rate
- Average Engagement Time
- Event Count (cta_click)
- Conversion Rate (age_gate_verified)

**Filters:**
- Include: Landing Page contains "music.livhana.ai"

**Segments:**
- By Source Domain (reggieanddro, thcasanantonio, etc.)
- By Age Gate Status (verified vs. denied)
- By CTA Click (clicked vs. not clicked)

#### 2. Music Engagement Funnel

**Steps:**
1. Page View (landing)
2. Age Gate Verified
3. Playlist Play
4. Scroll 90%
5. CTA Click
6. Shop Page View (reggieanddro.com)

**Metrics:**
- Users at each step
- Drop-off rate
- Average time between steps
- Conversion rate (end-to-end)

#### 3. Cross-Domain Attribution

**Dimensions:**
- Source Domain
- Target Domain
- Conversion Path

**Metrics:**
- Sessions
- Transactions (if ecommerce enabled)
- Revenue
- AOV (Average Order Value)

**Comparison:**
- music.livhana.ai → reggieanddro.com
- Direct reggieanddro.com traffic

#### 4. Playlist Performance

**Dimensions:**
- Event Name (playlist_play, playlist_complete)
- Song Title
- Track Position

**Metrics:**
- Plays
- Completions
- Completion Rate
- Average Play Duration
- CTA Clicks (after play)

---

## Key Metrics & KPIs

### Primary KPIs

| Metric | Target | Description |
|--------|--------|-------------|
| **Redirect Success Rate** | 99%+ | % of source domains successfully redirecting |
| **Age Gate Conversion** | 85%+ | % of users clicking "I'm 21+" |
| **Music Engagement Rate** | 40%+ | % of users playing playlist |
| **CTA Click Rate** | 25%+ | % of users clicking shop CTA |
| **Cross-Domain Attribution** | 90%+ | % of shop sessions attributed to music hub |

### Secondary KPIs

| Metric | Target | Description |
|--------|--------|-------------|
| Avg. Session Duration | 2+ min | Time spent on landing page |
| Bounce Rate | <30% | % of single-page sessions |
| Playlist Completion Rate | 50%+ | % of users completing playlist |
| Mobile Traffic % | 60%+ | Mobile vs. desktop split |
| Page Load Time | <2s | Time to First Contentful Paint |

### North Star Metric

**Music → Commerce Conversion Rate:** % of music hub visitors who purchase within 7 days

**Formula:** (Transactions from Music Hub Source / Music Hub Sessions) × 100

**Target:** 5%+

---

## Testing & Validation

### Pre-Launch Checklist

- [ ] **GA4 Tag Firing:** Use Google Tag Assistant to verify
- [ ] **Events Tracking:** Trigger each custom event and verify in GA4 DebugView
- [ ] **Cross-Domain Tracking:** Test _gl parameter passes correctly
- [ ] **UTM Preservation:** Verify UTMs persist through redirects
- [ ] **Age Gate Events:** Test both "verified" and "denied" events
- [ ] **CTA Tracking:** Click CTA and verify event fires
- [ ] **Mobile Testing:** Test on iOS/Android devices

### Testing Tools

#### 1. Google Tag Assistant (Chrome Extension)

1. Install: [Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Visit: `https://music.livhana.ai`
3. Click Tag Assistant icon
4. Verify: GA4 tag is present and firing

#### 2. GA4 DebugView

1. Go to: GA4 Admin → DebugView
2. Enable: Chrome extension [GA Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
3. Visit: `https://music.livhana.ai`
4. Verify: Real-time events appear in DebugView

#### 3. Network Inspector

1. Open: Chrome DevTools (F12) → Network tab
2. Filter: `analytics` or `google-analytics`
3. Visit: `https://music.livhana.ai`
4. Verify: GA4 requests are sent (200 OK)

#### 4. Cross-Domain Test

```bash
# Test cross-domain parameter
curl -L https://music.livhana.ai | grep "_gl="

# Or manually:
1. Visit: https://music.livhana.ai
2. Click CTA button
3. Check URL bar on reggieanddro.com
4. Should see: ?_gl=1*xxxxxx...
```

### Post-Launch Monitoring

**Daily (First Week):**
- Check GA4 Real-Time report for traffic
- Verify events are firing correctly
- Monitor error logs for JavaScript issues

**Weekly:**
- Review domain performance report
- Check cross-domain attribution accuracy
- Analyze funnel drop-off points

**Monthly:**
- Calculate ROI of domain consolidation
- Optimize underperforming domains
- A/B test landing page variations

---

## Privacy & Compliance

### GDPR / CCPA

The landing page is **privacy-compliant** by default:

- ✅ **IP Anonymization:** Enabled in GA4 config (`anonymize_ip: true`)
- ✅ **Cookie Consent:** Age gate acts as implicit consent (21+ users)
- ✅ **Data Minimization:** Only essential tracking parameters
- ✅ **User Control:** Users can opt-out via browser settings

### Privacy Policy Requirements

Update your privacy policy to include:

```markdown
### Analytics & Cookies

We use Google Analytics to understand how visitors interact with our site.
This includes:
- Pages visited
- Time spent on site
- Click behavior
- Referral sources

We do NOT collect:
- Personal identification (name, email, phone)
- Payment information
- Medical information
- Location data (beyond IP-based region)

You can opt-out of Google Analytics by:
1. Installing the [Google Analytics Opt-Out Browser Add-on](https://tools.google.com/dlpage/gaoptout)
2. Enabling "Do Not Track" in your browser
3. Using privacy-focused browsers (Brave, Firefox)
```

### Cookie Policy

| Cookie | Purpose | Duration | Type |
|--------|---------|----------|------|
| `_ga` | Google Analytics user ID | 2 years | Analytics |
| `_ga_*` | Google Analytics session ID | 2 years | Analytics |
| `_gid` | Google Analytics visitor ID | 24 hours | Analytics |
| `livhana_age_verified` | Age gate verification | 24 hours | Functional |

---

## Troubleshooting

### Issue: GA4 Tag Not Firing

**Symptoms:**
- No data in GA4 Real-Time report
- Tag Assistant shows "No tags found"

**Solutions:**
1. Check Measurement ID is correct (`G-XXXXXXXXXX`)
2. Verify GA4 script is in `<head>` section
3. Check browser console for errors
4. Disable ad blockers / privacy extensions
5. Test in incognito mode

### Issue: Cross-Domain Tracking Broken

**Symptoms:**
- Sessions break when transitioning domains
- Attribution shows "direct" instead of "music hub"

**Solutions:**
1. Verify linker domains are configured in all GA4 tags
2. Check CTA links include `?_gl=` parameter
3. Ensure target domain has same GA4 property ID
4. Test in incognito to clear cached cookies
5. Verify referral exclusions are configured

### Issue: Events Not Tracking

**Symptoms:**
- Custom events don't appear in GA4
- DebugView shows no events

**Solutions:**
1. Open browser console → check for JavaScript errors
2. Verify `gtag()` function is defined (GA4 loaded)
3. Test event trigger manually in console:
   ```javascript
   gtag('event', 'test_event', {test: true});
   ```
4. Check GA4 DebugView within 30 seconds
5. Verify event name spelling (case-sensitive)

### Issue: UTM Parameters Not Preserved

**Symptoms:**
- UTMs disappear after redirect
- Attribution shows "direct / none"

**Solutions:**
1. Check CTA link JavaScript preserves query params
2. Verify Cloudflare redirects preserve query strings
3. Test manually:
   ```bash
   curl -I "https://music.livhana.ai?utm_source=test" | grep Location
   ```
4. Ensure `preserve_query: true` in redirect config

### Issue: High Bounce Rate

**Symptoms:**
- Bounce rate >70%
- Users leave immediately

**Solutions:**
1. Check page load speed (<2s target)
2. Verify Suno playlist embeds correctly
3. Test age gate UX (ensure it's not blocking)
4. Check mobile responsiveness
5. Analyze exit pages in GA4

---

## Advanced Configurations

### Google Tag Manager (GTM)

For advanced tracking, consider migrating to GTM:

**Benefits:**
- No-code event tracking
- A/B testing triggers
- Third-party integrations (Facebook Pixel, LinkedIn Insight)

**Setup:**
1. Create GTM container
2. Install GTM script on landing page
3. Create GA4 Configuration Tag
4. Create custom event triggers
5. Test in GTM Preview mode

### Enhanced Ecommerce Tracking

If reggieanddro.com has ecommerce:

1. **Enable Enhanced Ecommerce** in GA4
2. **Track Purchase Events** with revenue
3. **Calculate Music Hub ROI:**
   ```
   ROI = (Revenue from Music Hub Source - Redirect Infrastructure Cost) / Infrastructure Cost × 100
   ```

### Heatmap & Session Recording

Integrate with:
- **Hotjar:** Heatmaps, session recordings
- **Microsoft Clarity:** Free heatmaps, click tracking
- **FullStory:** Advanced session replay

---

## Success Criteria

### Week 1 (Validation)

- [ ] GA4 tracking confirmed on all domains
- [ ] Cross-domain attribution working
- [ ] All custom events firing correctly
- [ ] UTM parameters preserving
- [ ] No JavaScript errors in console

### Month 1 (Baseline)

- [ ] 10,000+ sessions tracked
- [ ] 85%+ age gate conversion rate
- [ ] 40%+ music engagement rate
- [ ] 25%+ CTA click rate
- [ ] <2s average page load time

### Month 3 (Optimization)

- [ ] 5%+ music → commerce conversion rate
- [ ] 50%+ playlist completion rate
- [ ] Cross-domain attribution >90%
- [ ] ROI calculated and positive
- [ ] Dashboard shared with stakeholders

---

## Support & Resources

### Documentation

- [GA4 Official Docs](https://support.google.com/analytics/answer/10089681)
- [Cross-Domain Tracking Guide](https://support.google.com/analytics/answer/10071811)
- [Event Tracking Best Practices](https://support.google.com/analytics/answer/9267735)

### Tools

- [Google Tag Assistant](https://tagassistant.google.com/)
- [GA4 Query Explorer](https://ga-dev-tools.web.app/ga4/query-explorer/)
- [UTM Builder](https://ga-dev-tools.web.app/campaign-url-builder/)

### Contact

**Analytics Lead:** Jesse Niesen
**Email:** jesseniesen@gmail.com
**Dashboard:** [GA4 Music Hub Property](#) (replace with actual link)

---

## Changelog

### v1.0.0 - 2025-10-27

- Initial analytics architecture
- GA4 setup guide
- Cross-domain tracking config
- Custom event definitions
- Dashboard templates
- Testing procedures
- Privacy compliance notes

---

**BATTLE CRY:** "Grow baby grow and Sell baby Sell — Stay TOONED!"

**Status:** READY FOR DEPLOYMENT

---

*Generated by Claude Code - LivHana Trinity SoT*
