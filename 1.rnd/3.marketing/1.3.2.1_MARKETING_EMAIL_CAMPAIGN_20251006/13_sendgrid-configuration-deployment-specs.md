## SENDGRID CONFIGURATION • DEPLOYMENT SPECS

**Account Settings:**

- Sender: `noreply@reggieanddro.com`
- Reply-To: `support@reggieanddro.com`
- From Name: "Reggie & Dro"
- Unsubscribe Group: "Marketing Emails"
- Suppression: Bounces, Spam Reports, Unsubscribes

**Domain Authentication:**

- ⚠️ **REQUIRED:** DKIM + SPF records configured for reggieanddro.com
- ⚠️ **BLOCKER:** If domain auth not set up, emails will land in spam
- **Action:** Add DNS records via Cloudflare/Google Domains
  - TXT record for DKIM
  - TXT record for SPF (`v=spf1 include:sendgrid.net ~all`)

**Tracking:**

- Open tracking: YES
- Click tracking: YES
- UTM parameters: **Always include**
  - `utm_source=email`
  - `utm_medium=[launch/verification/review/cart]`
  - `utm_campaign=texas-takeover`

**A/B Testing:**

- Test duration: 4 hours OR 20% of list (whichever first)
- Winning metric: Click rate (not open rate)
- Confidence level: 95%
- Auto-send winner after test completes

**Send Time Optimization:**

- Monday-Friday: 9-11 AM CST, 2-4 PM CST
- Weekend: 10 AM - 2 PM CST
- Avoid: Before 8 AM, after 8 PM

**Reference:** Lines 736-763 of source doc

---
