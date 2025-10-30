# DNS UPDATE REQUIREMENTS - CLOUDFLARE REDIRECT DEPLOYMENT

## Overview

This document outlines DNS changes required for deploying Cloudflare bulk redirects across 69 domains to 4 canonical targets.

**Generated:** 2025-10-23
**Total Domains:** 69 (67 redirects + 4 canonical targets - 2 DO NOT TOUCH)
**Deployment Method:** Cloudflare Bulk Redirects

---

## 1. DNS Configuration Options

### Option A: Cloudflare Proxied (RECOMMENDED)

**Best for:** Easy redirect management, DDoS protection, CDN benefits

**Requirements per domain:**
1. Add domain to Cloudflare account
2. Update nameservers to Cloudflare:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
3. Create DNS record (once nameservers propagate):
   - Type: `A`
   - Name: `@`
   - Value: `192.0.2.1` (dummy IP - will be proxied)
   - Proxy: **ON** (orange cloud)
   - TTL: Auto

**Pros:**
- Redirects happen at Cloudflare edge (faster)
- No origin server needed for redirect-only domains
- Built-in SSL/TLS
- DDoS protection
- Analytics included

**Cons:**
- Requires changing nameservers (24-48h propagation)
- All 67 domains must be added to Cloudflare

---

### Option B: Cloud Run Direct (ALTERNATIVE)

**Best for:** Keeping existing nameservers, already on GCP

**Requirements per domain:**
1. Keep existing nameservers (GoDaddy, etc.)
2. Update A records to Cloud Run IPs:
   ```
   216.239.32.21
   216.239.34.21
   216.239.36.21
   216.239.38.21
   ```
3. Cloudflare redirects won't work - need Nginx/Cloud Run redirects

**Pros:**
- No nameserver changes
- Faster DNS propagation (5-30 min)
- Integrated with existing Cloud Run setup

**Cons:**
- Requires Cloud Run configuration per domain
- Higher infrastructure costs
- Manual redirect management

---

## 2. Recommended Approach: Hybrid Strategy

### Phase 1: Canonical Domains (4 domains) - Cloud Run
Keep these on Cloud Run with full sites:
1. **reggieanddro.com** - Full e-commerce site
2. **highnoontooned.com** - Content hub
3. **oneplantsolution.com** - Policy advocacy site
4. **herbitrage.com** - Commerce intelligence dashboard

**DNS Configuration:**
```
Type: A
Name: @
Values: 216.239.32.21, 216.239.34.21, 216.239.36.21, 216.239.38.21
TTL: 3600
```

---

### Phase 2: Redirect-Only Domains (67 domains) - Cloudflare Proxied
Use Cloudflare bulk redirects for efficiency:

**DNS Configuration:**
```
Type: A
Name: @
Value: 192.0.2.1 (proxied through Cloudflare)
Proxy: ON (orange cloud)
TTL: Auto
```

**Nameservers:**
```
ns1.cloudflare.com
ns2.cloudflare.com
```

---

## 3. DNS Changes by Domain Silo

### SILO 1: reggieanddro.com Target (18 domains)

**Canonical (keep on Cloud Run):**
- reggieanddro.com → Cloud Run IPs

**Redirect to Cloudflare (17 domains):**
- reggieanddroalice.com
- reggieanddrocannabisstore.com
- reggieanddrodispensary.com
- reggieanddrosanantonio.com
- reggieanddrosanantoniotx.com
- reggieanddrosocialclub.com
- reggieanddrostoneoak.com
- reggieanddrotexas.com
- freelegalweedsanantonio.com
- freeweedsanantonio.com
- freethcaflower.com
- freeweedtexas.com
- thcacannabisdispensary.com
- thcaflowerstx.com
- thcaflowertx.com
- thcasanantonio.com
- cannabiscookiestexas.com
- texascannabiscookies.com

---

### SILO 2: highnoontooned.com Target (12 domains)

**Canonical (keep on Cloud Run):**
- highnoontooned.com → Cloud Run IPs

**Redirect to Cloudflare (11 domains):**
- highnooncartoon.com
- getlooseyoga.com
- smokingyoga.com
- tokinyoga.com
- aaacbdhempflower.com
- exoticcbdhempflower.com
- loudcbdflower.com
- loudcbdbuds.com
- firecbdbuds.com
- sinsamillahemp.com
- highfromhemp.com
- exoticcanopysolutions.com

---

### SILO 3: oneplantsolution.com Target (15 domains)

**Canonical (keep on Cloud Run):**
- oneplantsolution.com → Cloud Run IPs

**Redirect to Cloudflare (14 domains):**
- ageverifysi.com
- aicrisisconsult.com
- aicrisiscoach.com
- californiaenergyai.com
- texasenergyai.com
- camedicalai.com
- clinicaldataai.com
- clinicaldatasi.com
- txmedicalai.com
- txsupplychain.com
- wealthtechsi.com
- texascoa.com
- jesseniesen.com
- livhana.ai
- vibecodeliv.com

---

### SILO 4: herbitrage.com Target (22 domains)

**Canonical (keep on Cloud Run):**
- herbitrage.com → Cloud Run IPs

**Redirect to Cloudflare (21 domains):**
- hempretailai.com
- cannabisretailai.com
- cannabisretailsi.com
- hempretailsi.com
- retailopssi.com
- bizflowsi.com
- codenexusai.com
- codenexussi.com
- devflowsi.com
- adcopysi.com
- airbnbwaterfall.com
- autocodesi.com
- contentenginesi.com
- shipcodeai.com
- shipcodesi.com
- siartisan.com
- strategysi.com
- terpwerk.com
- tier1treecare.com
- xn--reggieanddr-v9b.com
- hempress3.com
- www.herbitrage.com

---

## 4. Current DNS Status (Before Changes)

From `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/_archive_20251021_160026/VERIFIED_DOMAINS_JESSE_NIESEN.md`:

**WRONG DNS (need update):** 28/28 domains
- 22 domains pointing to 34.143.72.2 (old Cloud Run IP)
- 3 domains pointing to AWS IPs (legacy)
- 3 subdomains with NO A RECORDS (need CNAME)

**Target DNS for Cloud Run (4 canonical domains):**
```
A records:
216.239.32.21
216.239.34.21
216.239.36.21
216.239.38.21
```

**Target DNS for Cloudflare (67 redirect domains):**
```
Nameservers:
ns1.cloudflare.com
ns2.cloudflare.com

A record (proxied):
192.0.2.1
```

---

## 5. DNS Update Automation

### GoDaddy API Script
Existing script: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/README-godaddy-dns-automation.md`

**Update Script:**
```bash
#!/bin/bash
# Update GoDaddy DNS for redirect domains

# Set GoDaddy API credentials
GODADDY_KEY="your-api-key"
GODADDY_SECRET="your-api-secret"

# Array of domains to update nameservers
REDIRECT_DOMAINS=(
    "reggieanddroalice.com"
    "highnooncartoon.com"
    "ageverifysi.com"
    "hempretailai.com"
    # ... add all 67 redirect domains
)

# Update nameservers to Cloudflare
for domain in "${REDIRECT_DOMAINS[@]}"; do
    echo "Updating nameservers for $domain..."

    curl -X PUT "https://api.godaddy.com/v1/domains/$domain/nameservers" \
        -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET" \
        -H "Content-Type: application/json" \
        -d '{
            "nameservers": [
                "ns1.cloudflare.com",
                "ns2.cloudflare.com"
            ]
        }'

    echo "✅ $domain updated"
done
```

### Cloudflare API Script
```bash
#!/bin/bash
# Add domains to Cloudflare and configure DNS

CF_ACCOUNT_ID="your-account-id"
CF_API_TOKEN="your-api-token"

# Array of redirect domains
REDIRECT_DOMAINS=(
    "reggieanddroalice.com"
    "highnooncartoon.com"
    # ... all 67 domains
)

for domain in "${REDIRECT_DOMAINS[@]}"; do
    echo "Adding $domain to Cloudflare..."

    # Add domain to Cloudflare
    ZONE_ID=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"account\": {\"id\": \"$CF_ACCOUNT_ID\"},
            \"name\": \"$domain\",
            \"type\": \"full\"
        }" | jq -r '.result.id')

    # Create proxied A record
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "type": "A",
            "name": "@",
            "content": "192.0.2.1",
            "ttl": 1,
            "proxied": true
        }'

    echo "✅ $domain configured"
done
```

---

## 6. DNS Propagation Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Nameserver update | 24-48 hours | Varies by registrar |
| DNS record update | 5-30 minutes | TTL dependent |
| Cloudflare SSL provisioning | 5-15 minutes | Automatic |
| Global propagation | 24-48 hours | Full worldwide |

**Tip:** Use `dig` or `nslookup` to check propagation:
```bash
dig @8.8.8.8 reggieanddroalice.com
nslookup reggieanddroalice.com 1.1.1.1
```

---

## 7. SSL/TLS Certificates

### Cloudflare (Automatic)
- Universal SSL automatically provisioned
- Edge certificates for all proxied domains
- Origin certificates for Cloud Run backends
- No manual certificate management needed

### Cloud Run (Automatic)
- Google-managed certificates for mapped domains
- Auto-renewal every 90 days
- Requires DNS verification (A/AAAA records)

---

## 8. Verification Commands

### Check Nameservers
```bash
dig NS reggieanddroalice.com +short
# Expected: ns1.cloudflare.com, ns2.cloudflare.com
```

### Check A Record
```bash
dig A reggieanddroalice.com +short
# Expected: Cloudflare IP (varies by location)
```

### Check Redirect
```bash
curl -I https://reggieanddroalice.com
# Expected: HTTP/2 301 Location: https://reggieanddro.com
```

### Check SSL
```bash
curl -vI https://reggieanddroalice.com 2>&1 | grep "SSL certificate"
# Expected: Valid Cloudflare certificate
```

---

## 9. Rollback Procedure

### Revert Nameservers (GoDaddy)
```bash
# Restore original nameservers per domain
DOMAIN="reggieanddroalice.com"
ORIGINAL_NS="ns01.domaincontrol.com,ns02.domaincontrol.com"

curl -X PUT "https://api.godaddy.com/v1/domains/$DOMAIN/nameservers" \
    -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET" \
    -H "Content-Type: application/json" \
    -d "{
        \"nameservers\": [
            \"${ORIGINAL_NS%%,*}\",
            \"${ORIGINAL_NS##*,}\"
        ]
    }"
```

### Revert to Cloud Run IPs
```bash
# Update A records back to Cloud Run
curl -X PUT "https://api.godaddy.com/v1/domains/$DOMAIN/records/A/@" \
    -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET" \
    -H "Content-Type: application/json" \
    -d '[
        {"data": "216.239.32.21", "ttl": 3600},
        {"data": "216.239.34.21", "ttl": 3600},
        {"data": "216.239.36.21", "ttl": 3600},
        {"data": "216.239.38.21", "ttl": 3600}
    ]'
```

---

## 10. DO NOT TOUCH Domains (2)

**EXCLUDED FROM REDIRECT DEPLOYMENT:**

These domains should remain on their current DNS configuration:

1. **hempress3.com** - Hempress 3 seed sales (active external business)
2. **tier1treecare.com** - Tree care services (separate business)

**Note:** These were included in the CSV but marked as redirects to herbitrage.com. If these should remain independent, remove them from the redirect list or disable their specific rules in Cloudflare.

---

## 11. DNS Update Checklist

### Pre-Deployment
- [ ] Export current DNS records for all 69 domains (backup)
- [ ] Verify Cloudflare account access
- [ ] Verify GoDaddy API credentials
- [ ] Confirm redirect CSV is correct
- [ ] Identify domains NOT on GoDaddy (if any)

### Canonical Domains (4)
- [ ] reggieanddro.com → Verify Cloud Run A records
- [ ] highnoontooned.com → Verify Cloud Run A records
- [ ] oneplantsolution.com → Verify Cloud Run A records
- [ ] herbitrage.com → Verify Cloud Run A records

### Redirect Domains (67)
- [ ] Add all domains to Cloudflare account
- [ ] Update nameservers via GoDaddy API
- [ ] Wait for nameserver propagation (24-48h)
- [ ] Create A records (proxied) in Cloudflare
- [ ] Enable Cloudflare proxy (orange cloud)
- [ ] Verify SSL certificates provisioned

### Post-Deployment
- [ ] Test 5+ redirects per silo
- [ ] Verify SSL on all domains
- [ ] Check DNS propagation globally
- [ ] Monitor for 404 errors
- [ ] Update documentation with completion date

---

## 12. Cost Estimate

### Cloudflare
- **Free Plan:** Unlimited domains, basic redirects
- **Pro Plan ($20/mo per domain):** Advanced features (optional)
- **Bulk Redirects:** Included in Free plan (up to 100 rules)
- **SSL Certificates:** Free (Universal SSL)

**Estimated Cost:** $0/month (Free plan sufficient)

### Cloud Run (4 canonical domains)
- **Domain Mappings:** Free
- **SSL Certificates:** Free (Google-managed)
- **Traffic Costs:** Pay per request (already incurred)

**Estimated Cost:** $0/month additional (existing Cloud Run costs)

---

## 13. Success Criteria

### DNS Success
- ✅ All 67 redirect domains point to Cloudflare nameservers
- ✅ All 4 canonical domains point to Cloud Run IPs
- ✅ All domains have valid SSL certificates
- ✅ DNS propagation complete globally

### Functional Success
- ✅ All redirects return HTTP 301
- ✅ All canonical domains return HTTP 200
- ✅ No SSL certificate errors
- ✅ No DNS resolution failures

---

## 14. Contact & Support

**Owner:** Jesse Niesen (CEO)
**Email:** jesseniesen@gmail.com
**Files Location:**
- This Guide: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/DNS_UPDATE_REQUIREMENTS.md`
- CSV: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/cloudflare_bulk_redirects.csv`
- Deployment Guide: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/CLOUDFLARE_REDIRECT_DEPLOYMENT_GUIDE.md`

---

**Status:** READY FOR IMPLEMENTATION
**Priority:** HIGH (domain consolidation critical)
**Timeline:** 2-3 hours active work + 24-48h propagation

---

*Generated by Claude Code - LivHana Trinity SoT*
*Last Updated: 2025-10-23*
