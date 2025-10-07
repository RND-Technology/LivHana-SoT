# 🔧 DNS UPDATES REQUIRED FOR HERBITRAGE.COM

**Issue**: herbitrage.com currently points to OLD Cloud Run IP (34.143.72.2)
**Fix**: Update DNS to NEW Cloud Run IPs for proper routing

---

## Current DNS (INCORRECT)
```
herbitrage.com → 34.143.72.2 (old IP)
```

## Required DNS Updates

### herbitrage.com
**Remove**: A record pointing to 34.143.72.2
**Add these A records**:
- 216.239.32.21
- 216.239.34.21
- 216.239.36.21
- 216.239.38.21

**Add these AAAA records (IPv6)**:
- 2001:4860:4802:32::15
- 2001:4860:4802:34::15
- 2001:4860:4802:36::15
- 2001:4860:4802:38::15

### www.herbitrage.com
**Add CNAME record**:
- CNAME: ghs.googlehosted.com.

---

## How to Update (GoDaddy)

1. Go to: https://dcc.godaddy.com/control/portfolio
2. Find herbitrage.com
3. Click "DNS" button
4. Delete existing A record (34.143.72.2)
5. Add new A records (one at a time):
   - 216.239.32.21
   - 216.239.34.21
   - 216.239.36.21
   - 216.239.38.21
6. Add AAAA records (one at a time) for IPv6 support
7. Repeat for www subdomain
8. Save changes

---

## Verification

After DNS propagates (5-30 minutes), verify:
```bash
dig herbitrage.com +short
# Should show the 4 new IPs

curl -I https://herbitrage.com
# Should return HTTP 200 from integration-service
```

---

## Status
- ✅ Cloud Run domain mapping created (herbitrage.com → integration-service)
- ✅ Cloud Run domain mapping created (www.herbitrage.com → integration-service)
- ⏳ DNS updates required (Jesse action)
- ⏳ SSL certificate provisioning (automatic after DNS updates)

Once DNS is updated, SSL certificates will be automatically provisioned by Cloud Run.

---

## reggieanddroalice.com - Different Issue

This domain has a DIFFERENT problem:
- ❌ NOT verified in Google Cloud
- Cannot create domain mapping until domain is verified
- Requires adding domain to Search Console and completing verification

See WEBSITE_STATUS_REPORT.md for details.
