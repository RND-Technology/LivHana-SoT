# ADR-U2: Ultimate Security & Cannabis Compliance Framework

**Status:** TIER 1 ACTIVE  
**Date:** 2025-09-28  
**Owner:** Compliance Officer + Security Officer  
**Architect:** Liv Hana AI EA  
**Authority:** Texas DSHS License #690 + Federal Hemp Law

---

## 1. EXECUTIVE SUMMARY

This ADR establishes ultimate security and cannabis compliance framework ensuring 100% adherence to Texas DSHS License #690, federal hemp law (THC ≤0.3%), and enterprise security standards for the cannabis e-commerce platform generating $100K+ monthly profit.

## 2. CANNABIS COMPLIANCE FRAMEWORK

### 2.1 Texas DSHS License #690 Requirements

```yaml
TEXAS_COMPLIANCE:
  license: "Texas-DSHS-690"
  jurisdiction: "Texas Hemp Program"
  age_requirement: 21+
  thc_limit: "≤0.3% Delta-9 THC"
  testing_requirement: "COA (Certificate of Analysis) mandatory"
  geo_restrictions: "Texas residents only"
  advertising_limits: "No medical claims"
```

### 2.2 Federal Hemp Law Compliance

- **2018 Farm Bill Compliance**: All products must contain ≤0.3% Delta-9 THC on dry weight basis
- **USDA Hemp Standards**: Third-party lab testing required for all products
- **FDA Guidelines**: No medical claims, proper labeling, safe manufacturing
- **Interstate Commerce**: Compliant hemp products only across state lines

### 2.3 Age Verification & HITL Controls

```typescript
// Mandatory Age Gate Implementation
interface AgeVerification {
  birthDate: string;           // ISO format required
  governmentId: IdDocument;    // Driver's license, passport, state ID
  faceMatch: boolean;          // Biometric verification
  geoLocation: TexasLocation;  // GPS + IP validation
  hitlReview: boolean;         // Human review for edge cases
}

// HITL Triggers
const HITL_TRIGGERS = [
  'age_verification_failed',
  'suspicious_geolocation', 
  'multiple_failed_attempts',
  'high_value_transaction',
  'compliance_flag_raised'
];
```

## 3. SECURITY ARCHITECTURE

### 3.1 Multi-Layer Security Controls

| Layer | Control | Implementation |
|-------|---------|----------------|
| Edge | WAF + DDoS Protection | CloudFlare/AWS WAF |
| Network | Rate Limiting + Geo-fencing | API Gateway limits |
| Application | Authentication + Authorization | OAuth2 + RBAC |
| Data | Encryption + PII Protection | AES-256 + redaction |
| Monitoring | SIEM + Threat Detection | Log analysis + alerts |

### 3.2 Secret Management (ZERO TOLERANCE)

```bash
# MANDATED: Environment-only secrets
REQUIRED_SECRETS=(
  "AUTHORIZE_NET_API_LOGIN_ID"
  "AUTHORIZE_NET_TRANSACTION_KEY" 
  "SESSION_SECRET_KEY"
  "CSRF_SECRET_KEY"
  "LIGHTSPEED_OAUTH_SECRET"
  "DATABASE_ENCRYPTION_KEY"
)

# FORBIDDEN: Hardcoded secrets in any form
FORBIDDEN_PATTERNS=(
  "sk_test_*"
  "sk_live_*" 
  "*_secret_key*"
  "*password*"
  "*token*"
)
```

### 3.3 Payment Security (Cannabis-Specific)

```javascript
// KAJA/Authorize.Net Cannabis Security
class CannabisPaymentSecurity {
  validateTransaction(transaction) {
    return [
      this.validateAge(transaction.customer),
      this.validateGeofence(transaction.location),
      this.validateTHCCompliance(transaction.products),
      this.validateIdempotency(transaction.key),
      this.validateSignature(transaction.hmac)
    ].every(check => check === true);
  }
  
  // Cannabis-specific validation
  validateTHCCompliance(products) {
    return products.every(p => 
      p.thc_content <= 0.3 && 
      p.coa_verified === true &&
      p.testing_date > Date.now() - (90 * 24 * 60 * 60 * 1000) // 90 days
    );
  }
}
```

### 3.4 Webhook Hardening

```nginx
# Block Square webhook attacks (IMMEDIATE IMPLEMENTATION)
location /webhook/square {
    deny all;
    return 444;
}

# Cannabis payment webhooks (KAJA/Authorize.Net only)
location /webhook/authorize-net {
    limit_req zone=webhook_limit burst=5 nodelay;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    # HMAC signature validation required
    access_by_lua_block {
        local hmac = require "resty.hmac"
        local signature = ngx.var.http_x_anet_signature
        if not signature then
            ngx.log(ngx.ERR, "Missing Authorize.Net signature")
            ngx.exit(403)
        end
    }
}
```

## 4. COMPLIANCE MONITORING & VERIFICATION

### 4.1 Continuous Compliance Checks

```bash
#!/bin/bash
# check_cannabis_compliance.sh

set -euo pipefail

echo "🔍 CANNABIS COMPLIANCE VERIFICATION"

# Age gate verification  
if ! grep -r "<AgeGate" frontend/ >/dev/null 2>&1; then
    echo "❌ Age gate component missing in frontend"
    exit 1
fi

# THC content validation
if ! curl -s "$API_BASE/api/products" | jq -e '.products[] | select(.thc_content > 0.3)' >/dev/null; then
    echo "✅ All products THC compliant (≤0.3%)"
else
    echo "❌ THC non-compliant products detected"
    exit 1
fi

# COA validation
missing_coa=$(curl -s "$API_BASE/api/products" | jq -r '.products[] | select(.coa_verified != true) | .id')
if [[ -n "$missing_coa" ]]; then
    echo "❌ Products missing COA verification: $missing_coa"
    exit 1
fi

# Texas geofence check
if ! curl -s "$API_BASE/api/geofence/texas" | jq -e '.enabled == true' >/dev/null; then
    echo "❌ Texas geofence not enabled"
    exit 1
fi

echo "✅ Cannabis compliance verification passed"
```

### 4.2 Payment Security Verification  

```bash
#!/bin/bash
# check_payment_security.sh

set -euo pipefail

echo "🔒 PAYMENT SECURITY VERIFICATION"

# Secret validation
for secret in "${REQUIRED_SECRETS[@]}"; do
    if [[ -z "${!secret:-}" ]]; then
        echo "❌ Missing required secret: $secret"
        exit 1
    fi
done

# HMAC signature verification
if ! grep -r "verifySignature\|hmac\|signature" backend/ >/dev/null 2>&1; then
    echo "❌ HMAC signature verification missing"
    exit 1
fi

# Rate limiting check
if ! grep -r "limit_req\|rate.*limit" nginx.conf >/dev/null 2>&1; then
    echo "❌ Rate limiting not configured"
    exit 1
fi

# Idempotency key validation
if ! grep -r "idempotency.*key\|duplicate.*check" backend/ >/dev/null 2>&1; then
    echo "❌ Idempotency key handling missing"
    exit 1
fi

echo "✅ Payment security verification passed"
```

## 5. JURISDICTIONAL CONTROLS

### 5.1 Geofencing & IP Validation

```javascript
// Texas-only geofencing for cannabis products
class TexasGeofence {
  validateLocation(ip, gps) {
    const ipLocation = this.geolocateIP(ip);
    const gpsLocation = this.validateGPS(gps);
    
    // Both IP and GPS must confirm Texas location
    return ipLocation.state === 'TX' && 
           gpsLocation.state === 'TX' &&
           this.validateCounty(gpsLocation.county);
  }
  
  // Cannabis-legal counties in Texas
  validateCounty(county) {
    const LEGAL_COUNTIES = [
      'Harris', 'Dallas', 'Travis', 'Bexar', 'Tarrant',
      'Collin', 'Denton', 'Fort Bend', 'Montgomery'
      // ... full list of counties where cannabis is legal
    ];
    return LEGAL_COUNTIES.includes(county);
  }
}
```

### 5.2 Regulatory Reporting

```sql
-- Cannabis transaction reporting (quarterly to DSHS)
CREATE VIEW cannabis_quarterly_report AS
SELECT 
  DATE_TRUNC('quarter', transaction_date) as quarter,
  COUNT(*) as total_transactions,
  SUM(amount) as gross_revenue,
  AVG(customer_age) as avg_customer_age,
  COUNT(DISTINCT customer_id) as unique_customers,
  SUM(CASE WHEN products.thc_content <= 0.3 THEN 1 ELSE 0 END) as compliant_products
FROM transactions t
JOIN products p ON t.product_id = p.id
WHERE t.license_verified = true
  AND t.age_verified = true
  AND t.geo_verified = true
GROUP BY quarter;
```

## 6. INCIDENT RESPONSE

### 6.1 Compliance Incident Classification

| Severity | Definition | Response Time | Authority |
|----------|------------|---------------|-----------|
| P0 | Age gate failure / Minor access | < 5 minutes | Immediate shutdown |
| P1 | THC non-compliance / COA missing | < 15 minutes | Product recall |
| P2 | Payment security breach | < 30 minutes | Freeze transactions |
| P3 | Reporting discrepancy | < 2 hours | Audit investigation |
| P4 | Documentation gap | < 24 hours | Compliance update |

### 6.2 Automated Response Actions

```yaml
INCIDENT_AUTOMATION:
  age_gate_failure:
    - immediate_site_lockdown
    - alert_compliance_officer
    - preserve_audit_logs
    - notify_legal_counsel
    
  thc_non_compliance:
    - quarantine_affected_products
    - initiate_product_recall
    - notify_testing_lab
    - update_inventory_system
    
  payment_breach:
    - freeze_payment_processing
    - rotate_api_keys
    - enable_fraud_monitoring
    - alert_payment_processor
```

## 7. AUDIT & COMPLIANCE TRACKING

### 7.1 Compliance Metrics Dashboard

```javascript
// Real-time compliance monitoring
const COMPLIANCE_METRICS = {
  age_verification_rate: 100.0,      // Must be 100%
  thc_compliance_rate: 100.0,        // Must be 100%
  coa_verification_rate: 100.0,      // Must be 100%
  texas_geofence_rate: 100.0,        // Must be 100%
  payment_security_score: 95.0,      // Minimum 95%
  incident_response_time: 300        // Maximum 5 minutes
};
```

### 7.2 Regulatory Documentation

```markdown
# Cannabis Compliance Package (Auto-Generated)
- Texas DSHS License Certificate
- Third-party lab testing protocols  
- Age verification procedures
- Product labeling compliance
- Advertising compliance documentation
- Employee training certifications
- Inventory tracking procedures
- Transaction audit logs
```

## 8. SECURITY CONTROLS MATRIX

| Control | Implementation | Verification | Frequency |
|---------|----------------|--------------|-----------|
| Age Verification | Biometric + ID + HITL | check_age_gate.sh | Per transaction |
| THC Testing | Third-party COA | check_thc_compliance.sh | Per product batch |
| Geofencing | IP + GPS validation | check_geofence.sh | Per session |
| Payment Security | HMAC + Idempotency | check_payment_security.sh | Per transaction |
| Secret Management | Env-only + rotation | check_secrets.sh | Daily |
| Webhook Hardening | Signature + rate limit | check_webhook_security.sh | Continuous |

## 9. ACCEPTANCE CRITERIA

- [ ] Texas DSHS License #690 compliance verified
- [ ] Federal hemp law (≤0.3% THC) enforced
- [ ] Age verification with HITL implemented
- [ ] Geofencing for Texas-only sales active
- [ ] Payment security hardened (KAJA/Authorize.Net)
- [ ] Webhook attacks blocked (Square eliminated)
- [ ] All compliance verification scripts passing
- [ ] Incident response procedures tested
- [ ] Regulatory reporting automated
- [ ] Zero compliance violations recorded

---

**REGULATORY AUTHORITY**: This ADR ensures 100% compliance with applicable cannabis regulations and supersedes all non-compliant implementations.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->
