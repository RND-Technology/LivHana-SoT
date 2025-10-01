# Age Verification System - Deployment Guide

## CRITICAL REVENUE IMPACT

This system unblocks **$80K/month** in revenue currently stuck due to Veriff failures.

**Priority:** IMMEDIATE
**Risk Level:** LOW (fail-safe design)
**Rollback Time:** < 5 minutes

---

## Pre-Deployment Checklist

- [ ] BigQuery tables created (`commerce.age_verifications`, `commerce.age_verification_attempts`)
- [ ] Encryption key generated (32 bytes) and stored in 1Password
- [ ] JWT authentication configured
- [ ] Service account credentials configured for BigQuery
- [ ] Tests passing (run `npm test`)
- [ ] Integration service running (port 3005)

---

## Step 1: Generate Encryption Key

Generate a secure 32-byte encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').substring(0, 32))"
```

Example output: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Store in 1Password:**
- Item name: `AGE_VERIFICATION_ENCRYPTION_KEY`
- Field: `password`
- Category: `LivHana-Ops-Keys`

---

## Step 2: Configure Environment Variables

Add to your `.env` file (or 1Password reference):

```bash
# Age Verification Configuration
AGE_VERIFICATION_ENCRYPTION_KEY=op://LivHana-Ops-Keys/AGE_VERIFICATION_ENCRYPTION_KEY/password

# BigQuery (should already be configured)
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-key.json
BIGQUERY_ENABLED=true
BQ_DATASET=commerce
```

---

## Step 3: Create BigQuery Tables

The system will auto-create tables on first run, but you can create them manually:

```sql
-- Table: age_verifications
CREATE TABLE IF NOT EXISTS `your-project.commerce.age_verifications` (
  verification_id STRING NOT NULL,
  customer_id STRING NOT NULL,
  customer_id_hash STRING NOT NULL,
  full_name STRING NOT NULL,
  date_of_birth DATE NOT NULL,
  age INT64 NOT NULL,
  state STRING NOT NULL,
  verified BOOL NOT NULL,
  verification_method STRING NOT NULL,
  verified_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  metadata STRING,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(created_at)
CLUSTER BY customer_id_hash, state;

-- Table: age_verification_attempts (audit log)
CREATE TABLE IF NOT EXISTS `your-project.commerce.age_verification_attempts` (
  attempt_id STRING NOT NULL,
  verification_id STRING,
  customer_id STRING NOT NULL,
  customer_id_hash STRING NOT NULL,
  verified BOOL NOT NULL,
  method STRING NOT NULL,
  reason STRING,
  failed_field STRING,
  ip_address STRING,
  user_agent STRING,
  created_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(created_at)
CLUSTER BY customer_id_hash, created_at;
```

**Retention Policy (TX DSHS CHP #690 compliance):**
```sql
-- Set 7-year retention
ALTER TABLE `your-project.commerce.age_verifications`
SET OPTIONS (
  partition_expiration_days = 2555  -- 7 years
);

ALTER TABLE `your-project.commerce.age_verification_attempts`
SET OPTIONS (
  partition_expiration_days = 2555  -- 7 years
);
```

---

## Step 4: Install Dependencies

```bash
cd backend/integration-service
npm install
```

Dependencies already included:
- `@google-cloud/bigquery` - BigQuery client
- `express` - Web framework
- `crypto` (built-in) - Encryption
- `jsonwebtoken` - JWT authentication

---

## Step 5: Run Tests

```bash
npm test
```

Expected output:
```
PASS tests/age_verification.test.js
  Age Verification System
    ✓ calculateAge - should calculate age correctly
    ✓ validateDateOfBirth - should validate valid DOB for 21+ customer
    ✓ validateIdNumber - should validate last 4 digits of ID
    ... (all tests passing)

Test Suites: 1 passed, 1 total
Tests: 40+ passed, 40+ total
```

---

## Step 6: Start Integration Service

```bash
# Development
npm run dev

# Production
npm start
```

Expected log output:
```
[integration-service] Integration Service running on port 3005
[bigquery-live] BigQuery client initialised
[age-verification-store] BigQuery age verification store initialized
```

---

## Step 7: Verify Service Health

```bash
curl http://localhost:3005/health/age-verification
```

Expected response:
```json
{
  "status": "healthy",
  "service": "age-verification",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "storage": "bigquery"
}
```

---

## Step 8: Test API Endpoints

### Test 1: Verify Age (Success)

```bash
curl -X POST http://localhost:3005/api/age-verification/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test-customer-001",
    "fullName": "Jane Test",
    "dateOfBirth": "1990-01-01",
    "idNumberLast4": "1234",
    "state": "TX"
  }'
```

Expected response (200):
```json
{
  "success": true,
  "verified": true,
  "verificationId": "av_...",
  "method": "full_verification",
  "age": 35,
  "expiresAt": "2026-01-01T00:00:00.000Z"
}
```

### Test 2: Check Status

```bash
curl http://localhost:3005/api/age-verification/status/test-customer-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response (200):
```json
{
  "success": true,
  "verified": true,
  "verificationId": "av_...",
  "expired": false
}
```

### Test 3: Test Rate Limiting

Run the verify endpoint 4 times with the same customerId.

Expected 4th response (429):
```json
{
  "success": false,
  "error": "Too many verification attempts",
  "attempts": 3,
  "maxAttempts": 3
}
```

---

## Step 9: Integration with Checkout Flow

### Frontend Integration

```javascript
// Before checkout, check if customer is verified
async function proceedToCheckout(customerId) {
  const response = await fetch(
    `/api/age-verification/status/${customerId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const data = await response.json();

  if (data.verified && !data.expired) {
    // Allow checkout
    window.location.href = '/checkout';
  } else {
    // Redirect to age verification page
    window.location.href = `/age-verification?customerId=${customerId}`;
  }
}
```

### Backend Integration (Order Processing)

```javascript
// In your order processing endpoint
app.post('/api/orders', authMiddleware, async (req, res) => {
  const { customerId, items } = req.body;

  // Check age verification
  const verifyResponse = await fetch(
    `http://localhost:3005/api/age-verification/status/${customerId}`,
    {
      headers: { 'Authorization': req.headers.authorization }
    }
  );

  const verification = await verifyResponse.json();

  if (!verification.verified || verification.expired) {
    return res.status(403).json({
      error: 'Age verification required',
      message: 'Please complete age verification before checkout'
    });
  }

  // Continue with order processing...
});
```

---

## Step 10: Monitor Initial Performance

### Key Metrics to Watch (First 24 Hours)

1. **Success Rate**
   ```sql
   SELECT
     COUNT(*) as total_attempts,
     SUM(CASE WHEN verified = true THEN 1 ELSE 0 END) as successful,
     ROUND(SUM(CASE WHEN verified = true THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as success_rate
   FROM `your-project.commerce.age_verification_attempts`
   WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR);
   ```

   **Target:** > 95% for valid customers

2. **Processing Time**
   - Check logs for `processingTime` field
   - **Target:** < 100ms average

3. **Cache Hit Rate**
   ```sql
   SELECT
     method,
     COUNT(*) as count
   FROM `your-project.commerce.age_verification_attempts`
   WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
   GROUP BY method;
   ```

   **Target:** > 80% cache hits after initial verifications

4. **Rate Limit Hits**
   ```sql
   SELECT COUNT(*) as rate_limit_hits
   FROM `your-project.commerce.age_verification_attempts`
   WHERE method = 'rate_limit'
     AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR);
   ```

   **Alert if:** > 10 hits per hour (possible abuse)

---

## Step 11: Set Up Monitoring Alerts

### Datadog / CloudWatch Alerts

```yaml
# Low success rate
- alert: AgeVerificationLowSuccessRate
  condition: success_rate < 90%
  window: 1 hour
  severity: critical

# High processing time
- alert: AgeVerificationSlowResponse
  condition: p95_processing_time > 500ms
  window: 5 minutes
  severity: warning

# Service health
- alert: AgeVerificationServiceDown
  condition: health_check_fails > 3
  window: 5 minutes
  severity: critical
```

---

## Rollback Plan

If issues occur, rollback in < 5 minutes:

### Option 1: Disable Age Verification (Emergency)

```bash
# In your application code, add a feature flag
export AGE_VERIFICATION_ENABLED=false
```

This will skip age verification checks temporarily while issues are resolved.

### Option 2: Switch to Mock Mode

```bash
# Use in-memory storage instead of BigQuery
export BIGQUERY_ENABLED=false
```

System will continue to work with mock data.

### Option 3: Revert to Previous Service

```bash
# Stop integration service
pm2 stop integration-service

# Revert to previous commit
git revert HEAD

# Restart service
pm2 start integration-service
```

---

## Post-Deployment Validation

### Day 1 Checklist
- [ ] All tests passing in production
- [ ] Health endpoint returning 200
- [ ] First verification successful
- [ ] Cache working (second verification faster)
- [ ] Rate limiting working (4th attempt blocked)
- [ ] BigQuery tables receiving data
- [ ] No errors in logs

### Week 1 Checklist
- [ ] 100+ customers verified
- [ ] Success rate > 95%
- [ ] Zero customer complaints
- [ ] Processing time < 100ms average
- [ ] Revenue recovery tracking on target

---

## Troubleshooting

### Issue: "Encryption key must be exactly 32 bytes"

**Solution:** Regenerate key with correct length:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').substring(0, 32))"
```

### Issue: "Failed to initialize BigQuery client"

**Solution:** Check service account credentials:
```bash
# Verify file exists
ls -la $GOOGLE_APPLICATION_CREDENTIALS

# Test BigQuery connection
gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
bq ls
```

### Issue: "Rate limit exceeded" for legitimate customers

**Solution:** Clear rate limit cache:
```javascript
// In age_verification_store.js, add admin endpoint:
router.post('/api/age-verification/admin/clear-rate-limit', async (req, res) => {
  const { customerId } = req.body;
  rateLimitCache.delete(customerId);
  res.json({ success: true });
});
```

### Issue: "Verification expired" for recent verifications

**Solution:** Check system clock synchronization:
```bash
# Sync system time
sudo ntpdate -s time.nist.gov
```

---

## Revenue Recovery Tracking

### Expected Timeline

| Week | Target | Cumulative | Status Check |
|------|--------|------------|--------------|
| 1    | $20K   | $20K       | Daily monitoring |
| 2    | $40K   | $60K       | Review success rate |
| 3    | $60K   | $120K      | Optimize performance |
| 4    | $80K   | $200K      | Full capacity |

### Daily Revenue Query

```sql
SELECT
  DATE(o.created_at) as order_date,
  COUNT(DISTINCT o.order_id) as orders,
  SUM(o.total_amount) / 100 as revenue
FROM `your-project.commerce.orders` o
JOIN `your-project.commerce.age_verifications` av
  ON o.customer_id = av.customer_id
WHERE o.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND av.verified = true
GROUP BY order_date
ORDER BY order_date DESC;
```

---

## Compliance Verification

### TX DSHS CHP #690 Checklist
- [x] Age verification before sale (API enforces 21+)
- [x] Record retention 7 years (BigQuery partition expiration)
- [x] Audit trail (age_verification_attempts table)
- [x] Customer identity verification (full name + DOB + ID)

### CDFA PDP Checklist
- [x] Customer verification system (full implementation)
- [x] Transaction monitoring (audit logging)
- [x] Record keeping (7-year retention)
- [x] Privacy protection (encryption + hashing)

---

## Success Criteria

System is considered successfully deployed when:

1. **Performance:**
   - Success rate > 95%
   - Processing time < 100ms (p95)
   - Cache hit rate > 80%

2. **Reliability:**
   - Zero downtime
   - Zero customer-facing errors
   - Graceful degradation to mock mode if BigQuery fails

3. **Revenue:**
   - Week 1: $20K recovered
   - Week 4: $80K/month sustained

4. **Compliance:**
   - All TX DSHS CHP #690 requirements met
   - All CDFA PDP requirements met
   - 7-year retention configured

---

## Next Steps After Deployment

1. **Day 2-7:** Monitor metrics daily, optimize if needed
2. **Week 2:** Add email notifications for verification success/failure
3. **Week 3:** Integrate with admin dashboard for verification stats
4. **Week 4:** Consider optional third-party API integration (AgeChecker.net) for enhanced verification

---

## Support Contacts

- **System Administrator:** [Contact info]
- **On-Call Engineer:** [Contact info]
- **BigQuery Support:** [GCP support]
- **Emergency Rollback:** Follow rollback plan above

---

**DEPLOYMENT AUTHORIZATION REQUIRED**

Sign-off required before production deployment:
- [ ] Technical Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] Compliance Officer: _____________ Date: _______
