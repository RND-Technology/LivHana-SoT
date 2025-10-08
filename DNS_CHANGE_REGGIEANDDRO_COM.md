# DNS CHANGE: Point reggieanddro.com → Lightspeed Store

**Date:** October 2, 2025
**Task:** Point reggieanddro.com to https://reggieanddro.company.site/
**Registrar:** GoDaddy.com
**Status:** 🟡 READY TO EXECUTE

---

## VERIFICATION (Current State)

**COMMAND:** `whois reggieanddro.com`
**TIMESTAMP:** October 2, 2025 11:23 AM PDT
**OUTPUT:**
```
Registrar: GoDaddy.com, LLC
Name Servers: NS71.DOMAINCONTROL.COM, NS72.DOMAINCONTROL.COM
```

**COMMAND:** `dig reggieanddro.com +short`
**OUTPUT:**
```
199.34.228.172
```
**INTERPRETATION:** reggieanddro.com currently points to 199.34.228.172 (old server)

**COMMAND:** `curl -s https://reggieanddro.company.site/ -I`
**OUTPUT:**
```
HTTP/2 200
date: Thu, 02 Oct 2025 18:23:20 GMT
content-type: text/html; charset=utf-8
```
**INTERPRETATION:** ✅ Lightspeed store is LIVE and operational

---

## DNS CHANGE REQUIRED

### Current DNS Setup:
- **Domain:** reggieanddro.com
- **Current A Record:** 199.34.228.172
- **Registrar:** GoDaddy.com
- **Name Servers:** NS71.DOMAINCONTROL.COM, NS72.DOMAINCONTROL.COM

### Target DNS Setup:
- **Domain:** reggieanddro.com
- **Target URL:** https://reggieanddro.company.site/
- **Method:** CNAME or Domain Forwarding

---

## OPTION 1: CNAME Record (RECOMMENDED)

**Pros:**
- ✅ Maintains SSL automatically (Lightspeed handles it)
- ✅ Updates if Lightspeed changes IPs
- ✅ Professional setup

**Cons:**
- ⚠️ Cannot use CNAME on root domain (@) at GoDaddy
- ⚠️ Must use www.reggieanddro.com OR use forwarding for root

**GoDaddy DNS Configuration:**

### Step 1: Add CNAME for www subdomain
1. Go to https://dcc.godaddy.com/control/portfolio/
2. Click on reggieanddro.com → DNS
3. Find existing DNS records
4. **ADD NEW RECORD:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `reggieanddro.company.site`
   - TTL: `1 Hour` (3600 seconds)

### Step 2: Set up domain forwarding for root
1. In GoDaddy DNS settings for reggieanddro.com
2. Go to "Forwarding" tab
3. **ADD FORWARDING:**
   - Domain: `reggieanddro.com` (root)
   - Forward to: `https://www.reggieanddro.com`
   - Forward type: `Permanent (301)`
   - Settings: `Forward only` (NOT with masking)

**Result:**
- ✅ www.reggieanddro.com → Points to Lightspeed store (CNAME)
- ✅ reggieanddro.com → Redirects to www.reggieanddro.com (301)
- ✅ SSL works automatically

---

## OPTION 2: A Record + Domain Forwarding (ALTERNATIVE)

**Use if CNAME doesn't work or you prefer direct A record**

### Step 1: Get Lightspeed IP Address
**COMMAND:** `dig reggieanddro.company.site +short`

Need to run this to get the actual IP, then:

### Step 2: Update A Record
1. Go to https://dcc.godaddy.com/control/portfolio/
2. Click on reggieanddro.com → DNS
3. Find existing A record for @ (root)
4. **EDIT A RECORD:**
   - Type: `A`
   - Name: `@` (root domain)
   - Value: `[IP from dig command above]`
   - TTL: `1 Hour`

**Cons of this approach:**
- ❌ SSL certificate needs to be configured separately
- ❌ If Lightspeed changes IPs, site breaks
- ❌ More manual maintenance

---

## OPTION 3: Domain Forwarding Only (SIMPLEST)

**Best for quick setup, but loses SEO value**

### Configuration:
1. Go to https://dcc.godaddy.com/control/portfolio/
2. Click on reggieanddro.com → Forwarding
3. **ADD FORWARDING:**
   - Domain: `reggieanddro.com`
   - Forward to: `https://reggieanddro.company.site/`
   - Forward type: `Permanent (301)`
   - Settings: `Forward only` (NOT with masking)

**Result:**
- ✅ Visitors to reggieanddro.com get redirected to reggieanddro.company.site
- ⚠️ URL changes in browser bar
- ⚠️ Loses custom domain branding

---

## RECOMMENDED APPROACH: OPTION 1 (CNAME + Forwarding)

**Why:** Professional, SSL automatic, maintains if Lightspeed IPs change

**Exact Steps:**

### 1. Login to GoDaddy
- URL: https://dcc.godaddy.com/
- Login with account credentials

### 2. Navigate to DNS Settings
- Click "My Products" → Find reggieanddro.com
- Click "DNS" button next to the domain

### 3. Add CNAME Record
- Click "Add" button
- Select "CNAME" from dropdown
- **Name:** `www`
- **Value:** `reggieanddro.company.site`
- **TTL:** `1 Hour`
- Click "Save"

### 4. Set up Root Domain Forwarding
- Click "Forwarding" tab (top of DNS page)
- Click "Add Forwarding"
- **Forward FROM:** `reggieanddro.com` (http)
- **Forward TO:** `https://www.reggieanddro.com`
- **Redirect type:** `Permanent (301)`
- **Forward settings:** `Forward only`
- Click "Save"

### 5. Verify Setup (Wait 10-15 minutes for DNS propagation)
```bash
# Check CNAME
dig www.reggieanddro.com CNAME +short
# Should return: reggieanddro.company.site

# Check root forwarding
curl -I http://reggieanddro.com
# Should return: 301 redirect to https://www.reggieanddro.com

# Check final destination
curl -I https://www.reggieanddro.com
# Should return: 200 OK (Lightspeed content)
```

---

## DNS PROPAGATION TIME

- **Initial change:** 5-15 minutes (with 1 hour TTL)
- **Full global propagation:** Up to 48 hours (worst case)
- **Typical experience:** 30 minutes to 2 hours

**Check propagation status:**
- https://www.whatsmydns.net/#CNAME/www.reggieanddro.com
- https://dnschecker.org/

---

## ROLLBACK PLAN (If Something Goes Wrong)

**Current DNS (BACKUP):**
- A Record: @ → 199.34.228.172
- TTL: [Current value - check GoDaddy before changing]

**To Rollback:**
1. Login to GoDaddy DNS settings
2. Delete CNAME record for www
3. Change A record @ back to 199.34.228.172
4. Remove domain forwarding
5. Wait 15 minutes for propagation

---

## POST-CHANGE VERIFICATION CHECKLIST

After making DNS changes, verify:

- [ ] `dig www.reggieanddro.com CNAME +short` returns `reggieanddro.company.site`
- [ ] `curl -I http://reggieanddro.com` returns 301 to www
- [ ] `curl -I https://www.reggieanddro.com` returns 200 OK
- [ ] Visit https://www.reggieanddro.com in browser - loads Lightspeed store
- [ ] Visit http://reggieanddro.com - redirects to https://www.reggieanddro.com
- [ ] SSL certificate is valid (green padlock)
- [ ] All product pages load correctly
- [ ] Checkout flow works
- [ ] Age verification works

---

## BUSINESS CONTEXT

**From Andrew's Message:**
- ✅ Online sales ACTIVATED
- ✅ Lightspeed POS live
- ✅ Membership form ready
- ✅ Veriff age verification integrated
- 🎯 DNS change: Final step to go live

**Impact:**
- **Revenue:** Unlock online sales at reggieanddro.com
- **Customer Experience:** Professional branded domain
- **SEO:** Maintain domain authority
- **Compliance:** Texas-legal online hemp sales

---

## SUPPORT CONTACTS

**GoDaddy Support:**
- Phone: (480) 505-8877
- Live Chat: Available in GoDaddy dashboard
- Hours: 24/7

**Lightspeed Support:**
- If custom domain doesn't work after DNS change
- May need to configure custom domain in Lightspeed dashboard

---

## FINAL RECOMMENDATION

**Execute OPTION 1 (CNAME + Forwarding) NOW**

**Reason:**
- ✅ Lightspeed store verified live (200 OK)
- ✅ Professional setup with SSL
- ✅ Minimal risk (easy rollback)
- ✅ 15-minute DNS propagation
- ✅ Ready for immediate online sales

**Next Step:** Andrew, you need to login to GoDaddy and make the DNS changes (I cannot access your GoDaddy account). Follow the exact steps in "RECOMMENDED APPROACH" above.

---

**Document Created:** October 2, 2025, 11:30 AM PDT
**Status:** Ready for execution by Andrew
**Estimated Time:** 10 minutes to configure, 15 minutes to propagate
**Risk Level:** LOW (easy rollback available)

---

## QUESTIONS?

If you need help:
1. Screenshot the GoDaddy DNS page (before changes)
2. Follow exact steps above
3. Verify with the checklist
4. If anything fails, use rollback plan

**LET'S GO LIVE! 🚀**
