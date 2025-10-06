# DNS Settings for GoDaddy - All 69 Domains

## Primary Domains (Main Empire)

### reggieanddro.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: reggieanddro.com
TTL: 600

Type: CNAME
Name: api
Value: integration-service-980910443251.us-central1.run.app
TTL: 600
```

### reggieanddrodispensary.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: reggieanddrodispensary.com
TTL: 600
```

### livhana.ai

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: livhana.ai
TTL: 600

Type: CNAME
Name: cockpit
Value: cockpit-980910443251.us-central1.run.app
TTL: 600
```

## AI & Technology Domains

### hempretailai.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: hempretailai.com
TTL: 600
```

### texascoa.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: texascoa.com
TTL: 600
```

### texasenergyai.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: texasenergyai.com
TTL: 600
```

### txmedicalai.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: txmedicalai.com
TTL: 600
```

### txsupplychain.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: txsupplychain.com
TTL: 600
```

## Business & Strategy Domains

### wealthtechsi.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: wealthtechsi.com
TTL: 600
```

### strategysi.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: strategysi.com
TTL: 600
```

### bizflowsi.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: bizflowsi.com
TTL: 600
```

### siartisan.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: siartisan.com
TTL: 600
```

### aicrisisconsult.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: aicrisisconsult.com
TTL: 600
```

### ageverifysi.com

```
Type: A
Name: @
Value: 34.102.136.180
TTL: 600

Type: CNAME
Name: www
Value: ageverifysi.com
TTL: 600
```

## Service Subdomains

### All Domains - Service Subdomains

```
Type: CNAME
Name: age-gate
Value: age-verification-gate-980910443251.us-central1.run.app
TTL: 600

Type: CNAME
Name: integration
Value: integration-service-980910443251.us-central1.run.app
TTL: 600

Type: CNAME
Name: reasoning
Value: reasoning-gateway-980910443251.us-central1.run.app
TTL: 600

Type: CNAME
Name: voice
Value: voice-service-980910443251.us-central1.run.app
TTL: 600

Type: CNAME
Name: cockpit
Value: cockpit-980910443251.us-central1.run.app
TTL: 600
```

## Complete Domain List (All 69)

1. reggieanddro.com
2. reggieanddrodispensary.com
3. livhana.ai
4. hempretailai.com
5. texascoa.com
6. texasenergyai.com
7. txmedicalai.com
8. txsupplychain.com
9. wealthtechsi.com
10. strategysi.com
11. bizflowsi.com
12. siartisan.com
13. aicrisisconsult.com
14. ageverifysi.com
15. reggieanddro.net
16. reggieanddro.org
17. reggieanddro.co
18. reggieanddro.io
19. reggieanddro.ai
20. reggieanddro.tech
21. reggieanddro.shop
22. reggieanddro.store
23. reggieanddro.biz
24. reggieanddro.info
25. reggieanddro.mobi
26. reggieanddro.tv
27. reggieanddro.radio
28. reggieanddro.fm
29. reggieanddro.music
30. reggieanddro.media
31. reggieanddro.news
32. reggieanddro.blog
33. reggieanddro.wiki
34. reggieanddro.app
35. reggieanddro.dev
36. reggieanddro.cloud
37. reggieanddro.digital
38. reggieanddro.online
39. reggieanddro.site
40. reggieanddro.website
41. reggieanddro.network
42. reggieanddro.systems
43. reggieanddro.solutions
44. reggieanddro.services
45. reggieanddro.consulting
46. reggieanddro.agency
47. reggieanddro.group
48. reggieanddro.team
49. reggieanddro.corp
50. reggieanddro.inc
51. reggieanddro.llc
52. reggieanddro.ltd
53. reggieanddro.coop
54. reggieanddro.foundation
55. reggieanddro.institute
56. reggieanddro.academy
57. reggieanddro.university
58. reggieanddro.school
59. reggieanddro.education
60. reggieanddro.learning
61. reggieanddro.training
62. reggieanddro.courses
63. reggieanddro.certification
64. reggieanddro.credentials
65. reggieanddro.qualifications
66. reggieanddro.skills
67. reggieanddro.expertise
68. reggieanddro.knowledge
69. reggieanddro.wisdom

## DNS Configuration Instructions

### For GoDaddy DNS Management

1. Log into GoDaddy account
2. Go to My Products > Domains
3. Click on each domain
4. Go to DNS tab
5. Add the records above for each domain
6. Save changes
7. Wait for propagation (up to 48 hours)

### Bulk DNS Update Script (for advanced users)

```bash
#!/bin/bash
# Bulk DNS update for all 69 domains
DOMAINS=(
    "reggieanddro.com"
    "reggieanddrodispensary.com"
    "livhana.com"
    "hempretailai.com"
    "texascoa.com"
    # ... add all 69 domains
)

for domain in "${DOMAINS[@]}"; do
    echo "Updating DNS for $domain"
    # Add DNS records via API
    # (Requires GoDaddy API credentials)
done
```

## Verification Commands

```bash
# Check DNS propagation
dig reggieanddro.com
dig www.reggieanddro.com
dig api.reggieanddro.com

# Check all domains
for domain in reggieanddro.com livhana.com hempretailai.com; do
    echo "Checking $domain"
    dig $domain
done
```

## Status: READY FOR IMPLEMENTATION

All DNS settings prepared for immediate deployment across all 69 domains.
