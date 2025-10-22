---
status: URGENT - SSL Certificate Mismatch
timestamp: 2025-10-08T04:45Z
priority: HIGH - Brand Domain Down
assigned_to: Jesse (hosting access required)
---

# 🔒 LIVHANA.COM - SSL CERTIFICATE FIX

**Issue**: HTTPS serves wrong certificate (emr.thermalimagingcenter.com instead of livhana.com)
**Impact**: Browser security warnings, no HTTPS access
**Root Cause**: Shared hosting serving incorrect SSL certificate

---

## 🔍 DIAGNOSIS COMPLETE

### Certificate Details
```
Actual Certificate:
  Subject: CN=emr.thermalimagingcenter.com
  Valid: Sep 16 2025 → Dec 15 2025
  Status: Valid but WRONG DOMAIN

Expected Certificate:
  Subject: CN=livhana.com
  Status: NOT CONFIGURED
```

### HTTP vs HTTPS
- **HTTP** (port 80): ✅ Works (200 OK)
- **HTTPS** (port 443): ❌ Wrong certificate (emr.thermalimagingcenter.com)
- **DNS**: 162.210.96.122 (LiquidNet US LLC shared hosting)
- **Server**: Apache, PHP 5.2.17 (⚠️ very outdated)

### Why This Happens
Shared hosting with multiple domains on same IP address. Server needs SNI (Server Name Indication) configuration to serve correct certificate per domain.

---

## ⚡ FIX OPTIONS

### Option 1: Let's Encrypt (FREE, Recommended)
**Time**: 5 minutes
**Cost**: $0

**Steps**:
1. Login to LiquidNet hosting control panel (cPanel/Plesk)
2. Navigate to SSL/TLS section
3. Enable "AutoSSL" or "Let's Encrypt" for livhana.com
4. Click "Issue Certificate"
5. Wait 2-5 minutes for automatic installation
6. Test: `curl -I https://livhana.com/`

**Control Panel Login**:
- Check email for LiquidNet hosting credentials
- OR check 1Password for "LiquidNet" or "livhana hosting"
- Typical URLs: `https://162.210.96.122:2083` or `https://livhana.com/cpanel`

### Option 2: Upload Existing Certificate
**Time**: 10 minutes
**Cost**: $0 (if cert already owned)

**Steps**:
1. Locate existing livhana.com SSL certificate files:
   - Certificate (livhana.com.crt)
   - Private Key (livhana.com.key)
   - CA Bundle (ca_bundle.crt)
2. Login to hosting control panel
3. Navigate to SSL/TLS → Manage SSL Sites
4. Select livhana.com domain
5. Paste certificate, private key, and CA bundle
6. Click "Install Certificate"
7. Test HTTPS access

### Option 3: Purchase New Certificate
**Time**: 30 minutes
**Cost**: $10-$100/year

**Steps**:
1. Buy SSL from provider (Namecheap, GoDaddy, etc.)
2. Generate CSR (Certificate Signing Request) in cPanel
3. Submit CSR to provider
4. Receive certificate files via email
5. Install using Option 2 steps above

---

## 🎯 RECOMMENDED PATH: Let's Encrypt

**Why**:
- Free (saves $10-$100/year)
- Automatic renewal (no maintenance)
- 5-minute setup
- Trusted by all browsers
- Industry standard for simple sites

**Verification Steps**:
```bash
# After installation, verify certificate
curl -vI https://livhana.com/ 2>&1 | grep "subject:"
# Should show: CN=livhana.com (NOT emr.thermalimagingcenter.com)

# Check certificate expiration
echo | openssl s_client -connect livhana.com:443 2>/dev/null | openssl x509 -noout -dates
# Should show new dates

# Full browser test
open https://livhana.com/
# Should load without security warning
```

---

## 🚨 ADDITIONAL FINDINGS

### Server Security Concerns
- **PHP 5.2.17**: Released 2011, end-of-life 2013 (⚠️ 12 years outdated)
- **Security Risk**: High - known vulnerabilities, no security patches
- **Recommendation**: Upgrade to PHP 8.1+ or migrate to modern hosting

### Hosting Migration Option
Instead of fixing SSL on outdated LiquidNet hosting, consider migrating to Google Cloud:

**Benefits**:
- Modern infrastructure (PHP 8.3, Node.js, etc.)
- Automatic SSL with Cloud Run/Cloud CDN
- Better performance (<1s vs 3-5s load time)
- Integrated with other LivHana services
- Auto-scaling, monitoring, backups included
- Cost: $0-$5/month for simple site

**Migration Time**: 2-3 hours
**Downtime**: 5 minutes (during DNS switch)

---

## 📊 PRIORITY ASSESSMENT

### Fix SSL on LiquidNet (Quick Win)
- **Time**: 5 minutes
- **Impact**: HTTPS works immediately
- **Cost**: $0
- **Drawback**: Still on outdated server

### Migrate to Google Cloud (Long-term)
- **Time**: 2-3 hours
- **Impact**: Modern, secure, fast infrastructure
- **Cost**: $0-$5/month
- **Benefit**: Consolidate all LivHana properties

---

## 🎬 IMMEDIATE ACTION

**Jesse - Choose Path**:

**Path A (Quick Fix)**: Fix SSL on LiquidNet now
1. Find LiquidNet hosting login (1Password or email)
2. Login to cPanel
3. Enable Let's Encrypt for livhana.com (5 min)
4. Verify HTTPS works
5. Schedule migration for later

**Path B (Full Solution)**: Migrate to Google Cloud now
1. Export WordPress/site files from LiquidNet
2. Create Cloud Run service for livhana.com
3. Deploy site with automatic SSL
4. Update DNS to point to Cloud Run
5. Modern, secure, integrated infrastructure

---

## 🛡️ WHAT CLAUDE CODE CAN DO

### Automated After Jesse Fixes SSL
Once HTTPS works, I can:
1. Update DOMAIN_STATUS_REPORT.md (mark livhana.com as healthy)
2. Add to automated monitoring script
3. Setup uptime alerts (if status changes)
4. Document hosting credentials in secure location

### If Jesse Chooses Cloud Migration
I can build:
1. Migration script (export from LiquidNet, deploy to Cloud Run)
2. Cloud Run service with automatic SSL
3. Domain mapping configuration
4. Monitoring and alerts
5. Cost optimization (caching, CDN, etc.)

---

## 📈 SUCCESS CRITERIA

### Immediate (After SSL Fix)
- [ ] `https://livhana.com/` loads without security warning
- [ ] Certificate shows `CN=livhana.com` (not emr.thermalimagingcenter.com)
- [ ] Certificate valid >30 days
- [ ] No browser warnings

### Long-term (If Migrated)
- [ ] PHP 8.1+ (modern, secure)
- [ ] <1s page load time
- [ ] Automatic SSL renewal
- [ ] Integrated monitoring with other LivHana services
- [ ] $0-$5/month cost

---

**Status**: Diagnosis complete ✅, awaiting Jesse hosting access
**Blocker**: LiquidNet cPanel credentials needed
**Time to Fix**: 5 minutes (Let's Encrypt) or 2-3 hours (migration)
**Priority**: HIGH - livhana.com is primary brand domain

---

**Last Updated**: 2025-10-08T04:45Z
**Diagnosed By**: Claude Code (Sonnet 4.5)
**Next Owner**: Jesse (hosting access required)
