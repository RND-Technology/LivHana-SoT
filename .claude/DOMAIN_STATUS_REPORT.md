---
status: ACTIVE - Domain Health Monitoring
timestamp: 2025-10-07T21:35:00Z
last_check: 2025-10-08T04:27:47 UTC
---

# DOMAIN VALIDATION STATUS - ALL LIVHANA PROPERTIES

**Total Domains**: 8
**Working**: 6/8 (75%)
**Broken**: 2/8 (25%)

---

## ✅ HEALTHY DOMAINS (6)

### 1. herbitrage.com
- DNS: 216.239.38.21, 216.239.34.21, 216.239.32.21, 216.239.36.21
- HTTP: 302 (redirect)
- HTTPS: 200 ✅
- SSL: Valid (Oct 7 2025 → Jan 5 2026)
- Cloud Run: Not mapped (hosted elsewhere)

### 2. aaacbdhempflower.com
- DNS: 216.239.36.21, 216.239.34.21, 216.239.38.21, 216.239.32.21
- HTTP: 302 (redirect)
- HTTPS: 200 ✅
- SSL: Valid (Oct 7 2025 → Jan 5 2026)
- Cloud Run: Not mapped

### 3. jesseniesen.com
- DNS: 216.239.34.21, 216.239.32.21, 216.239.36.21, 216.239.38.21
- HTTP: 302 (redirect)
- HTTPS: 200 ✅
- SSL: Valid (Oct 7 2025 → Jan 5 2026)
- Cloud Run: Not mapped

### 4. loudcbdflower.com
- DNS: 216.239.38.21, 216.239.32.21, 216.239.34.21, 216.239.36.21
- HTTP: 302 (redirect)
- HTTPS: 200 ✅
- SSL: Valid (Oct 7 2025 → Jan 5 2026)
- Cloud Run: Not mapped

### 5. thcasanantonio.com
- DNS: 216.239.34.21, 216.239.38.21, 216.239.32.21, 216.239.36.21
- HTTP: 302 (redirect)
- HTTPS: 200 ✅
- SSL: Valid (Oct 7 2025 → Jan 5 2026)
- Cloud Run: Not mapped

### 6. reggieanddro.com
- DNS: 52.20.90.245
- HTTP: 301 (redirect)
- HTTPS: 200 ✅
- SSL: Valid (Oct 3 2025 → Jan 1 2026)
- Cloud Run: Not mapped
- Note: Different DNS (AWS host)

---

## ❌ BROKEN DOMAINS (2)

### 1. highnooncartoon.com 🚨 CRITICAL
- DNS: 216.239.38.21, 216.239.34.21, 216.239.32.21, 216.239.36.21
- HTTP: 404 ❌
- HTTPS: FAILED (SSL connection error) ❌
- SSL: None
- Cloud Run: Not mapped
- **Issue**: Service not deployed, awaiting GCP permissions
- **Fix**: See HNC_SITE_DOWN_FIX.md
- **Blocker**: Jesse needs to grant iam.serviceAccountUser role

### 2. livhana.com ⚠️ WARNING
- DNS: 162.210.96.122
- HTTP: 200 ✅
- HTTPS: FAILED ❌
- SSL: Valid but expires soon (Sep 14 2025 → Dec 13 2025)
- Cloud Run: Not mapped
- **Issue**: HTTPS not working, SSL renewal needed
- **Fix**: Renew SSL certificate, fix HTTPS configuration

---

## 🔧 AUTOMATED VALIDATION SCRIPT

**Location**: `/tmp/validate_all_domains.sh`

**Usage**:
```bash
/tmp/validate_all_domains.sh > domain_status.txt
```

**Checks**:
- DNS A/CNAME records
- HTTP status codes
- HTTPS status codes
- SSL certificate validity
- Cloud Run domain mappings

**Run Frequency**: Daily minimum, hourly recommended

---

## 📊 HEALTH METRICS

### SSL Certificate Status
- Valid & Current: 6/8 (75%)
- Expiring Soon (<60 days): 1/8 (livhana.com)
- Missing/Invalid: 1/8 (highnooncartoon.com)

### HTTP/HTTPS Status
- Both Working: 6/8 (75%)
- HTTP Only: 0/8
- Neither Working: 1/8 (highnooncartoon.com)
- HTTPS Failed: 2/8 (highnooncartoon.com, livhana.com)

### DNS Configuration
- Google Cloud IPs (216.239.x.x): 7/8 (87.5%)
- AWS IPs: 1/8 (reggieanddro.com)
- Other: 1/8 (livhana.com)

---

## 🚨 IMMEDIATE ACTION ITEMS

### Priority 1: Fix highnooncartoon.com (JESSE)
**Time**: 2 minutes
**Action**: Grant GCP permissions
```bash
gcloud projects add-iam-policy-binding reggieanddrodispensary \
  --member="user:high@reggieanddro.com" \
  --role="roles/iam.serviceAccountUser"
```

### Priority 2: Fix livhana.com HTTPS (CHEETAH)
**Time**: 15 minutes
**Action**:
1. Identify hosting provider
2. Renew SSL certificate
3. Configure HTTPS properly
4. Test HTTPS access

### Priority 3: Setup Automated Monitoring (CHEETAH)
**Time**: 1 hour
**Action**:
1. Deploy validation script to Cloud Run
2. Schedule hourly checks (Cloud Scheduler)
3. Alert on failures (Cloud Monitoring)
4. Log to BigQuery for analysis

---

## 📈 MONITORING PLAN

### Cloud Monitoring Setup
```yaml
uptimeChecks:
  - name: herbitrage-com
    resource: https://herbitrage.com/
    period: 300s  # 5 minutes
    timeout: 10s

  - name: highnooncartoon-com
    resource: https://highnooncartoon.com/
    period: 60s  # 1 minute (critical)
    timeout: 10s

  # ... repeat for all 8 domains

alertPolicies:
  - name: domain-down-alert
    conditions:
      - displayName: "Domain returns 4xx or 5xx"
        conditionThreshold:
          filter: metric.type="monitoring.googleapis.com/uptime_check/check_passed"
          comparison: COMPARISON_LT
          thresholdValue: 1
    notificationChannels:
      - email: jesseniesen@gmail.com
      - slack: #livhana-alerts
```

### BigQuery Logging
```sql
CREATE TABLE domain_health_log (
    timestamp TIMESTAMP,
    domain VARCHAR,
    http_status INT,
    https_status INT,
    ssl_valid BOOLEAN,
    ssl_expiry_days INT,
    response_time_ms INT,
    dns_resolution_time_ms INT,
    error_message TEXT
);

-- Query for trends
SELECT
    domain,
    DATE(timestamp) as date,
    AVG(response_time_ms) as avg_response_time,
    SUM(CASE WHEN https_status = 200 THEN 1 ELSE 0 END) / COUNT(*) as uptime_pct
FROM domain_health_log
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY domain, date
ORDER BY date DESC, domain;
```

---

## 🎯 SUCCESS CRITERIA

### Immediate (Next 24 Hours)
- [ ] All 8 domains return 200 on HTTPS
- [ ] All SSL certificates valid >30 days
- [ ] Automated monitoring deployed
- [ ] Alerts configured and tested

### Ongoing (Weekly)
- [ ] 99.9% uptime across all domains
- [ ] <3s average response time
- [ ] SSL renewals automated (60+ days before expiry)
- [ ] Weekly health reports generated

---

**Status**: 6/8 HEALTHY, 2/8 NEED FIXES
**Next Check**: Hourly (automated)
**Owner**: 🛡️ CODEX (monitoring), 🐆 CHEETAH (fixes)

---

**Last Updated**: 2025-10-08T04:27:47 UTC
**Generated By**: Automated validation script
**Maintained By**: 🛡️ CODEX (Taskmaster)
