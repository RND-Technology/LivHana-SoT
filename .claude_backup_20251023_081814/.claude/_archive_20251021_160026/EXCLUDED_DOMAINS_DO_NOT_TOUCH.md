---
diataxis: reference
owner: Jesse Niesen (CEO)
last-reviewed: 2025-10-06
timestamp: 2025-10-06T19:47:00Z
version: 1.0
status: active
critical: YES - NEVER TOUCH THESE DOMAINS
---

# 🚨 EXCLUDED DOMAINS - DO NOT TOUCH

**⚠️ CRITICAL**: These domains are EXCLUDED from current deployment. DO NOT modify DNS, DO NOT update, DO NOT touch until Jesse explicitly authorizes.

## 🔒 EXCLUDED DOMAINS (HARD CODED) - 5 TOTAL

### 1. airbnbwaterfall.com

- **Status**: DO NOT TOUCH
- **Reason**: Special configuration - Jesse's explicit instruction
- **Current DNS**: 3.33.251.168, 15.197.225.128 (AWS)
- **Action**: LEAVE AS IS

### 2. reggieanddro.com

- **Status**: DO NOT TOUCH
- **Reason**: Main production domain - requires separate careful handling
- **Current DNS**: 52.20.90.245 (AWS)
- **Subdomains affected**:
  - brain.reggieanddro.com (DO NOT TOUCH)
  - shop.reggieanddro.com (DO NOT TOUCH)
  - voice.reggieanddro.com (DO NOT TOUCH)
- **Action**: LEAVE AS IS

### 3. reggieanddroalice.com

- **Status**: DO NOT TOUCH - REVERT TO ORIGINAL DNS
- **Reason**: Part of ReggieAndDro domain family - requires separate handling
- **Action**: REVERT to original DNS settings, DO NOT update to Cloud Run

### 4. reggieanddrodispensary.com

- **Status**: DO NOT TOUCH - REVERT TO ORIGINAL DNS
- **Reason**: Part of ReggieAndDro domain family - requires separate handling
- **Action**: REVERT to original DNS settings, DO NOT update to Cloud Run

### 5. hempress3.com

- **Status**: DO NOT TOUCH - REVERT TO ORIGINAL DNS
- **Reason**: Hempress 3 seed sales - not in current Cloud Run deployment
- **Action**: REVERT to original DNS settings, DO NOT update to Cloud Run

## 📊 DEPLOYMENT IMPACT

**Original Cloud Run domains**: 28
**Excluded from Cloud Run deployment**: 5

- airbnbwaterfall.com (Cloud Run mapped - DO NOT TOUCH)
- reggieanddro.com (Cloud Run mapped - DO NOT TOUCH)
- brain.reggieanddro.com (subdomain - DO NOT TOUCH)
- shop.reggieanddro.com (subdomain - DO NOT TOUCH)
- voice.reggieanddro.com (subdomain - DO NOT TOUCH)

**Additional DO NOT TOUCH (not in Cloud Run)**:

- reggieanddroalice.com (restore to previous DNS)
- reggieanddrodispensary.com (restore to previous DNS)
- hempress3.com (restore to previous DNS)

**Remaining domains for Cloud Run deployment**: 23

## ✅ DOMAINS TO DEPLOY (21 TOTAL) - UPLEVELED CATEGORIZATION

### Primary Business Layers (4 domains)

1. **herbitrage.com** - PRIMARY BIZ LAYER 4!
2. **highnooncartoon.com** - PRIMARY BIZ LAYER 2! (NOT in current Cloud Run)
3. **jesseniesen.com** - PRIMARY Jesse CEO personal branding
4. **oneplantsolution.com** - PRIMARY BIZ LAYER 3!

### Key Strategic Domains (3 domains)

5. **highfromhemp.com** - KEY DOMAIN FOR SUBLIME BENEFIT OF ALL TOPS!!
6. **terpwerk.com** - KEY SPIN OFF under HERB
7. **exoticcanopysolutions.com** - Hempress 3 seed sales

### B2C Retail: ReggieAndDro Support (2 domains)

8. freeweedsanantonio.com - ReggieAndDro.com support
9. thcasanantonio.com - ReggieAndDro.com support

### B2C Retail: THCa & Promo (2 domains)

10. freeweedtexas.com
11. thcacannabisdispensary.com

### B2C Retail: Edibles (2 domains)

12. cannabiscookiestexas.com
13. texascannabiscookies.com

### B2C Retail: Flower (2 domains)

14. thcaflowerstx.com
15. thcaflowertx.com

### Hempress 3 Support (3 domains)

16. aaacbdhempflower.com - Hempress 3 support
17. exoticcbdhempflower.com - Hempress 3 support
18. loudcbdbuds.com - Hempress 3 support
19. loudcbdflower.com - Hempress 3 support

### Yoga & Wellness (3 domains)

20. getlooseyoga.com - SATX Smoking Yoga (benign cannabis language for billboards)
21. smokingyoga.com - SATX Smoking Yoga at R&D
22. tokinyoga.com - SATX Smoking Yoga at R&D

### Support Domains (1 domain)

23. <www.herbitrage.com> - Herbitrage subdomain

**NOTE**: tier1treecare.com NOT in this deployment (will be restored to previous DNS separately)

## 🚨 ENFORCEMENT RULES

**BEFORE any domain operation:**

1. Check if domain in EXCLUDED list
2. Check if domain is subdomain of EXCLUDED domain
3. If EXCLUDED → STOP immediately
4. If NOT EXCLUDED and verified → Proceed

**Verification command:**

```bash
# Check if domain is excluded
grep -i "domain_name" .claude/EXCLUDED_DOMAINS_DO_NOT_TOUCH.md
```

## 🧠 MEMORY COMMITMENT

**HARD CODED INTO PERMANENT MEMORY:**

- airbnbwaterfall.com = DO NOT TOUCH
- reggieanddro.com = DO NOT TOUCH (+ all subdomains)
- hempress3.com = DO NOT TOUCH
- NEVER modify these until Jesse explicitly authorizes
- ALWAYS check exclusion list before domain operations

## 📋 OPERATION CHECKLIST

**Before ANY domain operation:**

- [ ] Check EXCLUDED_DOMAINS_DO_NOT_TOUCH.md
- [ ] Verify domain NOT in excluded list
- [ ] Verify domain NOT subdomain of excluded domain
- [ ] If excluded → STOP
- [ ] If not excluded → Check VERIFIED_DOMAINS_JESSE_NIESEN.md
- [ ] If verified and not excluded → Proceed

---

**Document Status**: Active - CRITICAL REFERENCE
**Last Updated**: 2025-10-06T19:47:00Z
**Version**: 1.0
**Owner**: Jesse Niesen (CEO)
**Classification**: Internal Use Only - AUTHORITATIVE SOURCE

---

## ✅ EXCLUSION COMMITTED TO MEMORY

**3 domains hard coded as DO NOT TOUCH:**

- airbnbwaterfall.com
- reggieanddro.com (+ 3 subdomains)
- hempress3.com

**23 domains remaining for current deployment.**

---

*Liv Hana AI EA — Excluded domains remain untouched. Always.*
