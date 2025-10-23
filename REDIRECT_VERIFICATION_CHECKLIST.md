# CLOUDFLARE REDIRECT VERIFICATION CHECKLIST

## Overview

Complete verification checklist for testing all 67 redirect rules across 4 canonical domains.

**Generated:** 2025-10-23
**Total Redirects:** 67
**Canonical Domains:** 4
**Deployment Method:** Cloudflare Bulk Redirects

---

## Quick Test Script

Save as `/tmp/verify_all_redirects.sh`:

```bash
#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "CLOUDFLARE REDIRECT VERIFICATION"
echo "Testing 67 redirects across 4 silos"
echo "=========================================="
echo ""

passed=0
failed=0
skipped=0

# Function to test redirect
test_redirect() {
    local source=$1
    local expected=$2
    local silo=$3

    # Get actual redirect (follow 1 redirect)
    response=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" -L --max-redirs 1 "$source")
    status_code="${response%%|*}"
    actual="${response##*|}"

    # Check if redirect matches
    if [[ "$status_code" == "301" ]] && [[ "$actual" == "$expected" ]]; then
        echo -e "${GREEN}✅ PASS${NC}: $source → $actual [$silo]"
        ((passed++))
        return 0
    elif [[ "$status_code" == "000" ]]; then
        echo -e "${YELLOW}⚠️  SKIP${NC}: $source (DNS not resolved) [$silo]"
        ((skipped++))
        return 2
    else
        echo -e "${RED}❌ FAIL${NC}: $source [$silo]"
        echo "   Expected: $expected (301)"
        echo "   Got: $actual ($status_code)"
        ((failed++))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SILO 1: REGGIEANDDRO.COM (18 domains)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_redirect "https://reggieanddroalice.com" "https://reggieanddro.com" "R&D"
test_redirect "https://reggieanddrocannabisstore.com" "https://reggieanddro.com" "R&D"
test_redirect "https://reggieanddrodispensary.com" "https://reggieanddro.com" "R&D"
test_redirect "https://reggieanddrosanantonio.com" "https://reggieanddro.com" "R&D"
test_redirect "https://reggieanddrosanantoniotx.com" "https://reggieanddro.com" "R&D"
test_redirect "https://reggieanddrosocialclub.com" "https://reggieanddro.com" "R&D"
test_redirect "https://reggieanddrostoneoak.com" "https://reggieanddro.com" "R&D"
test_redirect "https://reggieanddrotexas.com" "https://reggieanddro.com" "R&D"
test_redirect "https://freelegalweedsanantonio.com" "https://reggieanddro.com" "R&D"
test_redirect "https://freeweedsanantonio.com" "https://reggieanddro.com" "R&D"
test_redirect "https://freethcaflower.com" "https://reggieanddro.com" "R&D"
test_redirect "https://freeweedtexas.com" "https://reggieanddro.com" "R&D"
test_redirect "https://thcacannabisdispensary.com" "https://reggieanddro.com" "R&D"
test_redirect "https://thcaflowerstx.com" "https://reggieanddro.com" "R&D"
test_redirect "https://thcaflowertx.com" "https://reggieanddro.com" "R&D"
test_redirect "https://thcasanantonio.com" "https://reggieanddro.com" "R&D"
test_redirect "https://cannabiscookiestexas.com" "https://reggieanddro.com" "R&D"
test_redirect "https://texascannabiscookies.com" "https://reggieanddro.com" "R&D"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SILO 2: HIGHNOONTOONED.COM (12 domains)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_redirect "https://highnooncartoon.com" "https://highnoontooned.com" "HNC"
test_redirect "https://getlooseyoga.com" "https://highnoontooned.com" "HNC"
test_redirect "https://smokingyoga.com" "https://highnoontooned.com" "HNC"
test_redirect "https://tokinyoga.com" "https://highnoontooned.com" "HNC"
test_redirect "https://aaacbdhempflower.com" "https://highnoontooned.com" "HNC"
test_redirect "https://exoticcbdhempflower.com" "https://highnoontooned.com" "HNC"
test_redirect "https://loudcbdflower.com" "https://highnoontooned.com" "HNC"
test_redirect "https://loudcbdbuds.com" "https://highnoontooned.com" "HNC"
test_redirect "https://firecbdbuds.com" "https://highnoontooned.com" "HNC"
test_redirect "https://sinsamillahemp.com" "https://highnoontooned.com" "HNC"
test_redirect "https://highfromhemp.com" "https://highnoontooned.com" "HNC"
test_redirect "https://exoticcanopysolutions.com" "https://highnoontooned.com" "HNC"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SILO 3: ONEPLANTSOLUTION.COM (15 domains)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_redirect "https://ageverifysi.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://aicrisisconsult.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://aicrisiscoach.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://californiaenergyai.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://texasenergyai.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://camedicalai.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://clinicaldataai.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://clinicaldatasi.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://txmedicalai.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://txsupplychain.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://wealthtechsi.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://texascoa.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://jesseniesen.com" "https://oneplantsolution.com" "OPS"
test_redirect "https://livhana.ai" "https://oneplantsolution.com" "OPS"
test_redirect "https://vibecodeliv.com" "https://oneplantsolution.com" "OPS"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SILO 4: HERBITRAGE.COM (22 domains)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_redirect "https://hempretailai.com" "https://herbitrage.com" "HERB"
test_redirect "https://cannabisretailai.com" "https://herbitrage.com" "HERB"
test_redirect "https://cannabisretailsi.com" "https://herbitrage.com" "HERB"
test_redirect "https://hempretailsi.com" "https://herbitrage.com" "HERB"
test_redirect "https://retailopssi.com" "https://herbitrage.com" "HERB"
test_redirect "https://bizflowsi.com" "https://herbitrage.com" "HERB"
test_redirect "https://codenexusai.com" "https://herbitrage.com" "HERB"
test_redirect "https://codenexussi.com" "https://herbitrage.com" "HERB"
test_redirect "https://devflowsi.com" "https://herbitrage.com" "HERB"
test_redirect "https://adcopysi.com" "https://herbitrage.com" "HERB"
test_redirect "https://airbnbwaterfall.com" "https://herbitrage.com" "HERB"
test_redirect "https://autocodesi.com" "https://herbitrage.com" "HERB"
test_redirect "https://contentenginesi.com" "https://herbitrage.com" "HERB"
test_redirect "https://shipcodeai.com" "https://herbitrage.com" "HERB"
test_redirect "https://shipcodesi.com" "https://herbitrage.com" "HERB"
test_redirect "https://siartisan.com" "https://herbitrage.com" "HERB"
test_redirect "https://strategysi.com" "https://herbitrage.com" "HERB"
test_redirect "https://terpwerk.com" "https://herbitrage.com" "HERB"
test_redirect "https://tier1treecare.com" "https://herbitrage.com" "HERB"
test_redirect "https://xn--reggieanddr-v9b.com" "https://herbitrage.com" "HERB"
test_redirect "https://hempress3.com" "https://herbitrage.com" "HERB"
test_redirect "https://www.herbitrage.com" "https://herbitrage.com" "HERB"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CANONICAL DOMAINS (4 domains)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing canonical domains return 200 OK..."

for domain in "reggieanddro.com" "highnoontooned.com" "oneplantsolution.com" "herbitrage.com"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "https://$domain")
    if [[ "$status" == "200" ]]; then
        echo -e "${GREEN}✅ OK${NC}: https://$domain ($status)"
    else
        echo -e "${RED}❌ FAIL${NC}: https://$domain ($status)"
    fi
done
echo ""

echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $passed"
echo -e "${RED}Failed:${NC} $failed"
echo -e "${YELLOW}Skipped:${NC} $skipped (DNS not resolved)"
echo ""

if [[ $failed -eq 0 ]] && [[ $skipped -eq 0 ]]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    exit 0
elif [[ $failed -eq 0 ]]; then
    echo -e "${YELLOW}⚠️  SOME TESTS SKIPPED (DNS propagation in progress)${NC}"
    exit 2
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    exit 1
fi
```

---

## Manual Verification Checklist

### Phase 1: Pre-Deployment Validation

#### CSV File Validation
- [ ] CSV file exists at `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/cloudflare_bulk_redirects.csv`
- [ ] CSV contains 67 redirect rules
- [ ] All source URLs use HTTPS
- [ ] All target URLs use HTTPS
- [ ] All status codes are 301 (permanent)
- [ ] preserve_path is true for all rules
- [ ] preserve_query_string is true for all rules
- [ ] No canonical domains in source URLs (except www.herbitrage.com)

#### Cloudflare Account
- [ ] Cloudflare account accessible
- [ ] Bulk Redirects feature available
- [ ] API token with Bulk Redirects permissions (if using API)
- [ ] Account has capacity for 67 redirect rules

---

### Phase 2: Deployment Validation

#### Upload & Configuration
- [ ] Bulk redirect list created: `livhana-empire-consolidation`
- [ ] CSV uploaded without errors
- [ ] 67 rules imported successfully
- [ ] Redirect rule created: `livhana-empire-301-redirects`
- [ ] Rule enabled and active
- [ ] No conflicting rules detected

---

### Phase 3: DNS Configuration Validation

#### Canonical Domains (4)
- [ ] reggieanddro.com → A records point to Cloud Run IPs (216.239.32.21, etc.)
- [ ] highnoontooned.com → A records point to Cloud Run IPs
- [ ] oneplantsolution.com → A records point to Cloud Run IPs
- [ ] herbitrage.com → A records point to Cloud Run IPs

#### Redirect Domains (67)
- [ ] All domains added to Cloudflare account
- [ ] Nameservers updated to Cloudflare (ns1.cloudflare.com, ns2.cloudflare.com)
- [ ] A records created (proxied through Cloudflare)
- [ ] Cloudflare proxy enabled (orange cloud)
- [ ] SSL certificates provisioned

---

### Phase 4: Redirect Testing

#### SILO 1: reggieanddro.com (18 domains)

**Core R&D Domains:**
- [ ] reggieanddroalice.com → reggieanddro.com (301)
- [ ] reggieanddrocannabisstore.com → reggieanddro.com (301)
- [ ] reggieanddrodispensary.com → reggieanddro.com (301)
- [ ] reggieanddrosanantonio.com → reggieanddro.com (301)
- [ ] reggieanddrosanantoniotx.com → reggieanddro.com (301)
- [ ] reggieanddrosocialclub.com → reggieanddro.com (301)
- [ ] reggieanddrostoneoak.com → reggieanddro.com (301)
- [ ] reggieanddrotexas.com → reggieanddro.com (301)
- [ ] freelegalweedsanantonio.com → reggieanddro.com (301)
- [ ] freeweedsanantonio.com → reggieanddro.com (301)

**THCa Domains:**
- [ ] freethcaflower.com → reggieanddro.com (301)
- [ ] freeweedtexas.com → reggieanddro.com (301)
- [ ] thcacannabisdispensary.com → reggieanddro.com (301)
- [ ] thcaflowerstx.com → reggieanddro.com (301)
- [ ] thcaflowertx.com → reggieanddro.com (301)
- [ ] thcasanantonio.com → reggieanddro.com (301)

**Edibles Domains:**
- [ ] cannabiscookiestexas.com → reggieanddro.com (301)
- [ ] texascannabiscookies.com → reggieanddro.com (301)

---

#### SILO 2: highnoontooned.com (12 domains)

**Content & Media:**
- [ ] highnooncartoon.com → highnoontooned.com (301)
- [ ] getlooseyoga.com → highnoontooned.com (301)
- [ ] smokingyoga.com → highnoontooned.com (301)
- [ ] tokinyoga.com → highnoontooned.com (301)
- [ ] aaacbdhempflower.com → highnoontooned.com (301)
- [ ] exoticcbdhempflower.com → highnoontooned.com (301)
- [ ] loudcbdflower.com → highnoontooned.com (301)
- [ ] loudcbdbuds.com → highnoontooned.com (301)
- [ ] firecbdbuds.com → highnoontooned.com (301)
- [ ] sinsamillahemp.com → highnoontooned.com (301)
- [ ] highfromhemp.com → highnoontooned.com (301)
- [ ] exoticcanopysolutions.com → highnoontooned.com (301)

---

#### SILO 3: oneplantsolution.com (15 domains)

**Compliance & Advisory:**
- [ ] ageverifysi.com → oneplantsolution.com (301)
- [ ] aicrisisconsult.com → oneplantsolution.com (301)
- [ ] aicrisiscoach.com → oneplantsolution.com (301)

**Energy:**
- [ ] californiaenergyai.com → oneplantsolution.com (301)
- [ ] texasenergyai.com → oneplantsolution.com (301)

**Healthcare:**
- [ ] camedicalai.com → oneplantsolution.com (301)
- [ ] clinicaldataai.com → oneplantsolution.com (301)
- [ ] clinicaldatasi.com → oneplantsolution.com (301)
- [ ] txmedicalai.com → oneplantsolution.com (301)

**Supply Chain & Finance:**
- [ ] txsupplychain.com → oneplantsolution.com (301)
- [ ] wealthtechsi.com → oneplantsolution.com (301)

**Strategic:**
- [ ] texascoa.com → oneplantsolution.com (301)
- [ ] jesseniesen.com → oneplantsolution.com (301)
- [ ] livhana.ai → oneplantsolution.com (301)
- [ ] vibecodeliv.com → oneplantsolution.com (301)

---

#### SILO 4: herbitrage.com (22 domains)

**B2B Retail:**
- [ ] hempretailai.com → herbitrage.com (301)
- [ ] cannabisretailai.com → herbitrage.com (301)
- [ ] cannabisretailsi.com → herbitrage.com (301)
- [ ] hempretailsi.com → herbitrage.com (301)
- [ ] retailopssi.com → herbitrage.com (301)

**B2B Enablement:**
- [ ] bizflowsi.com → herbitrage.com (301)
- [ ] codenexusai.com → herbitrage.com (301)
- [ ] codenexussi.com → herbitrage.com (301)
- [ ] devflowsi.com → herbitrage.com (301)

**Tools & Tech:**
- [ ] adcopysi.com → herbitrage.com (301)
- [ ] airbnbwaterfall.com → herbitrage.com (301)
- [ ] autocodesi.com → herbitrage.com (301)
- [ ] contentenginesi.com → herbitrage.com (301)
- [ ] shipcodeai.com → herbitrage.com (301)
- [ ] shipcodesi.com → herbitrage.com (301)
- [ ] siartisan.com → herbitrage.com (301)
- [ ] strategysi.com → herbitrage.com (301)
- [ ] terpwerk.com → herbitrage.com (301)
- [ ] tier1treecare.com → herbitrage.com (301)
- [ ] xn--reggieanddr-v9b.com → herbitrage.com (301)
- [ ] hempress3.com → herbitrage.com (301)
- [ ] www.herbitrage.com → herbitrage.com (301)

---

### Phase 5: Functional Testing

#### Path Preservation
Test that URL paths are maintained:
- [ ] reggieanddroalice.com/shop → reggieanddro.com/shop (301)
- [ ] highnooncartoon.com/about → highnoontooned.com/about (301)
- [ ] ageverifysi.com/pricing → oneplantsolution.com/pricing (301)
- [ ] hempretailai.com/features → herbitrage.com/features (301)

#### Query String Preservation
Test that query parameters are maintained:
- [ ] reggieanddroalice.com?utm_source=email → reggieanddro.com?utm_source=email (301)
- [ ] highnooncartoon.com?ref=twitter → highnoontooned.com?ref=twitter (301)
- [ ] ageverifysi.com?campaign=launch → oneplantsolution.com?campaign=launch (301)
- [ ] hempretailai.com?promo=discount → herbitrage.com?promo=discount (301)

#### SSL/TLS Verification
- [ ] All redirects occur over HTTPS
- [ ] Valid SSL certificates on all domains
- [ ] No certificate warnings or errors
- [ ] HTTP → HTTPS upgrades working

#### Canonical Domain Accessibility
- [ ] reggieanddro.com loads successfully (200 OK)
- [ ] highnoontooned.com loads successfully (200 OK)
- [ ] oneplantsolution.com loads successfully (200 OK)
- [ ] herbitrage.com loads successfully (200 OK)

---

### Phase 6: SEO & Analytics

#### Search Console
- [ ] All canonical domains verified in Google Search Console
- [ ] Updated sitemaps submitted
- [ ] 301 redirects detected by Google
- [ ] No unexpected 404 errors
- [ ] Coverage report shows redirected URLs

#### Analytics
- [ ] Google Analytics tracking on canonical domains
- [ ] Referral sources preserved through redirects
- [ ] UTM parameters tracked correctly
- [ ] No traffic loss detected

---

### Phase 7: Edge Cases

#### Mobile Testing
- [ ] Redirects work on iOS Safari
- [ ] Redirects work on Android Chrome
- [ ] No mobile-specific redirect issues

#### International Testing
- [ ] Redirects work from US locations
- [ ] Redirects work from international locations (VPN test)
- [ ] Cloudflare edge locations serving redirects globally

#### Browser Testing
- [ ] Chrome: Redirects working
- [ ] Firefox: Redirects working
- [ ] Safari: Redirects working
- [ ] Edge: Redirects working

---

### Phase 8: Performance

#### Response Time
- [ ] Redirect response time < 100ms (Cloudflare edge)
- [ ] Canonical domain response time < 500ms
- [ ] No timeout errors

#### Caching
- [ ] Redirect responses cached at Cloudflare edge
- [ ] Cache-Control headers appropriate
- [ ] Vary headers configured (if needed)

---

## Automated Testing Commands

### Test All Redirects (Quick Sample)
```bash
# Test 5 redirects per silo
curl -I https://reggieanddroalice.com | grep -E "HTTP|Location"
curl -I https://highnooncartoon.com | grep -E "HTTP|Location"
curl -I https://ageverifysi.com | grep -E "HTTP|Location"
curl -I https://hempretailai.com | grep -E "HTTP|Location"
curl -I https://www.herbitrage.com | grep -E "HTTP|Location"
```

### Test Canonical Domains
```bash
curl -I https://reggieanddro.com | grep HTTP
curl -I https://highnoontooned.com | grep HTTP
curl -I https://oneplantsolution.com | grep HTTP
curl -I https://herbitrage.com | grep HTTP
```

### Test Path Preservation
```bash
curl -I https://reggieanddroalice.com/test-path | grep Location
# Expected: Location: https://reggieanddro.com/test-path
```

### Test Query String Preservation
```bash
curl -I "https://reggieanddroalice.com?test=param" | grep Location
# Expected: Location: https://reggieanddro.com?test=param
```

### Run Full Test Suite
```bash
chmod +x /tmp/verify_all_redirects.sh
/tmp/verify_all_redirects.sh
```

---

## Success Criteria Summary

### ✅ Deployment Success
- [ ] 67 redirects deployed to Cloudflare
- [ ] All redirects return HTTP 301
- [ ] 4 canonical domains return HTTP 200
- [ ] No redirect loops detected
- [ ] No broken links detected

### ✅ Functional Success
- [ ] Path preservation working
- [ ] Query string preservation working
- [ ] SSL/TLS working on all domains
- [ ] Mobile & desktop working
- [ ] All browsers working

### ✅ SEO Success
- [ ] 301 redirects indexed by Google
- [ ] No 404 errors in Search Console
- [ ] Traffic preserved to canonical domains
- [ ] UTM parameters tracked correctly

### ✅ Operational Success
- [ ] DNS propagation complete
- [ ] Rollback plan tested
- [ ] Documentation updated
- [ ] Monitoring configured

---

## Troubleshooting

### Issue: Redirect not working
**Check:**
1. DNS propagation complete? (`dig NS domain.com`)
2. Cloudflare proxy enabled? (orange cloud)
3. Redirect rule enabled in Cloudflare?
4. Domain added to Cloudflare account?

### Issue: SSL error
**Check:**
1. Cloudflare Universal SSL provisioned? (wait 5-15 min)
2. SSL mode set to "Full" or "Flexible" in Cloudflare?
3. Domain verified in Cloudflare?

### Issue: 404 on canonical domain
**Check:**
1. Cloud Run service deployed?
2. Domain mapping configured in GCP?
3. A records pointing to correct Cloud Run IPs?

### Issue: Path not preserved
**Check:**
1. CSV has `preserve_path=true`?
2. Cloudflare redirect rule configured correctly?
3. Test with trailing slash: `domain.com/path/`

---

## Contact & Support

**Owner:** Jesse Niesen (CEO)
**Email:** jesseniesen@gmail.com
**Files:**
- Checklist: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/REDIRECT_VERIFICATION_CHECKLIST.md`
- CSV: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/cloudflare_bulk_redirects.csv`
- Deployment Guide: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/CLOUDFLARE_REDIRECT_DEPLOYMENT_GUIDE.md`
- DNS Guide: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/DNS_UPDATE_REQUIREMENTS.md`

---

**Status:** READY FOR TESTING
**Last Updated:** 2025-10-23

---

*Generated by Claude Code - LivHana Trinity SoT*
