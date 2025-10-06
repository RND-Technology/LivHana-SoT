# REAL WORK REMAINING - POST-PURCHASE VERIFICATION

**Created:** October 4, 2025, 20:30 PDT
**Status:** PLACEHOLDER CODE EXISTS, REAL INTEGRATION NEEDED

---

## ✅ DONE (Placeholder Code)

1. API routes structure (543 lines)
2. Webhook handler skeleton
3. 72-hour countdown logic
4. Cloud Scheduler setup script
5. Documentation (deployment guide, Terms rewrite)

---

## 🔴 NOT DONE (Real Integration Required)

### 1. VERIFF INTEGRATION (2-3 hours)

**Tasks:**
- [ ] Sign up for Veriff account (veriff.com)
- [ ] Get API key from Veriff dashboard
- [ ] Add `VERIFF_API_KEY` to GCP Secret Manager
- [ ] Install Veriff SDK: `npm install @veriff/js-sdk`
- [ ] Build `startVeriffSession()` function
- [ ] Build `/veriff-webhook` endpoint
- [ ] Test with Veriff sandbox environment

**Code to Write:**
```javascript
// backend/integration-service/src/lib/veriff-client.js
import fetch from 'node-fetch';

export async function createVeriffSession(customerEmail, orderId) {
  const response = await fetch('https://stationapi.veriff.com/v1/sessions', {
    method: 'POST',
    headers: {
      'X-AUTH-CLIENT': process.env.VERIFF_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      verification: {
        callback: `${process.env.API_BASE_URL}/api/v1/veriff/webhook`,
        person: {
          firstName: '',
          lastName: '',
          idNumber: ''
        },
        vendorData: JSON.stringify({ orderId, email: customerEmail })
      }
    })
  });

  const data = await response.json();
  return {
    sessionId: data.verification.id,
    verificationUrl: data.verification.url
  };
}
```

---

### 2. MEMBERSHIP CHECK (1-2 hours)

**Options:**

**Option A: LightSpeed Custom Fields**
```javascript
async function checkMembership(email) {
  const client = new LightspeedClient();
  const customer = await client.getCustomerByEmail(email);

  return {
    exists: !!customer,
    verified: customer?.customFields?.age_verified === 'true',
    membershipActive: customer?.customFields?.membership_status === 'active'
  };
}
```

**Option B: BigQuery Membership Table**
```sql
CREATE TABLE livhana.memberships (
  customer_id STRING,
  email STRING,
  membership_status STRING,  -- 'active', 'inactive', 'pending'
  age_verified BOOL,
  verified_at TIMESTAMP,
  verification_method STRING,  -- 'veriff', 'manual', 'existing'
  loyalty_id STRING,
  PRIMARY KEY (customer_id)
);
```

**Option C: Hybrid (Recommended)**
- Check LightSpeed first (fast, real-time)
- Fallback to BigQuery if not found (historical data)
- Update both on verification success

**Tasks:**
- [ ] Decide on Option A, B, or C
- [ ] Create BigQuery table (if Option B/C)
- [ ] Write `checkMembership()` function
- [ ] Write `updateMembership()` function
- [ ] Test with existing customer data

---

### 3. LOYALTY PROGRAM AUTO-ENROLLMENT (2-3 hours)

**Current:** Mock function returns fake `loyaltyId`

**Real Integration Options:**

**Option A: LightSpeed Loyalty Module**
```javascript
async function enrollInLoyalty(customer) {
  const client = new LightspeedClient();

  // Create loyalty account
  const loyalty = await client.createLoyaltyAccount({
    customerId: customer.id,
    programId: process.env.LIGHTSPEED_LOYALTY_PROGRAM_ID,
    points: 100  // Welcome bonus
  });

  return {
    success: true,
    loyaltyId: loyalty.id,
    points: loyalty.points
  };
}
```

**Option B: Custom Loyalty System (BigQuery + API)**
```sql
CREATE TABLE livhana.loyalty_accounts (
  loyalty_id STRING PRIMARY KEY,
  customer_id STRING,
  email STRING,
  points INT64,
  tier STRING,  -- 'bronze', 'silver', 'gold'
  created_at TIMESTAMP,
  last_activity TIMESTAMP
);
```

**Tasks:**
- [ ] Check if LightSpeed has loyalty module enabled
- [ ] If yes: Get API credentials, implement Option A
- [ ] If no: Build custom loyalty system (Option B)
- [ ] Define loyalty benefits (points, tiers, rewards)
- [ ] Build loyalty dashboard endpoint

---

### 4. AUTO-REFUND (KAJA/Authorize.Net Integration) (3-4 hours)

**Current:** Mock function returns fake success

**Real Refund:**
```javascript
async function processAutoRefund(order) {
  const kaja = new AuthorizeNetClient({
    apiLoginId: process.env.KAJA_API_LOGIN_ID,
    transactionKey: process.env.KAJA_TRANSACTION_KEY,
    gatewayId: process.env.KAJA_GATEWAY_ID
  });

  // Refund original transaction
  const refund = await kaja.refundTransaction({
    transactionId: order.paymentTransactionId,
    amount: order.totalAmount,
    reason: 'Age verification not completed within 72 hours'
  });

  if (refund.success) {
    // Update order status in LightSpeed
    await updateOrderStatus(order.orderId, 'refunded');

    // Send refund notification email
    await sendRefundEmail(order.customerEmail, order.orderId, refund.refundId);
  }

  return refund;
}
```

**Tasks:**
- [ ] Get KAJA/Authorize.Net API credentials from 1Password
- [ ] Install SDK: `npm install authorizenet`
- [ ] Build `AuthorizeNetClient` wrapper
- [ ] Implement `refundTransaction()` method
- [ ] Test with Authorize.Net sandbox
- [ ] Handle refund failures (retry logic)

---

### 5. EMAIL INTEGRATION (SendGrid/Mailgun) (2-3 hours)

**4 Email Templates Needed:**

1. **Order Confirmation + Verification Link**
   - Subject: "Order Confirmed! Complete Verification Within 72 Hours"
   - CTA: Click to verify button → Veriff session URL

2. **Verification Success + Loyalty Welcome**
   - Subject: "Welcome to R&D! Your Order is Being Processed"
   - Content: Loyalty benefits, free gram coupon code

3. **Verification Reminder (48 hours)**
   - Subject: "24 Hours Left to Verify Your Order"
   - Urgency: "Click now to avoid auto-refund"

4. **Auto-Refund Notification**
   - Subject: "Order Refunded - Verification Not Completed"
   - Content: Refund amount, timeline (3-5 business days)

**Tasks:**
- [ ] Get SendGrid API key from 1Password
- [ ] Install SDK: `npm install @sendgrid/mail`
- [ ] Create 4 email templates in SendGrid UI
- [ ] Build `sendVerificationEmail()` function
- [ ] Build `sendReminderEmail()` function
- [ ] Build `sendRefundEmail()` function
- [ ] Test email delivery (sandbox mode)

---

### 6. LIGHTSPEED WEBHOOK CONFIGURATION (30 minutes)

**Current:** Webhook handler exists but not connected

**Tasks:**
- [ ] Access LightSpeed admin: reggieanddro.company.site/admin
- [ ] Navigate to: Settings → Webhooks
- [ ] Create new webhook:
   - Event: `order.created`
   - URL: `https://[integration-service-url]/api/v1/post-purchase/webhook`
   - Secret: Generate random string, store in Secret Manager
- [ ] Add webhook signature verification to webhook handler
- [ ] Test webhook with test order

---

### 7. BIGQUERY PERSISTENCE (1-2 hours)

**Current:** In-memory Map (lost on restart)

**Real Persistence:**
```sql
CREATE TABLE livhana.verification_records (
  order_id STRING PRIMARY KEY,
  customer_id STRING,
  customer_email STRING,
  order_total FLOAT64,
  status STRING,  -- 'pending_verification', 'verified', 'refunded_unverified'
  created_at TIMESTAMP,
  deadline TIMESTAMP,
  verified_at TIMESTAMP,
  verification_method STRING,
  membership_opt_in BOOL,
  loyalty_id STRING,
  refund_amount FLOAT64,
  refunded_at TIMESTAMP
);
```

**Tasks:**
- [ ] Create BigQuery table
- [ ] Replace in-memory Map with BigQuery queries
- [ ] Build `saveVerificationRecord()` function
- [ ] Build `getVerificationRecord()` function
- [ ] Build `updateVerificationStatus()` function

---

### 8. CLOUD SCHEDULER DEPLOYMENT (15 minutes)

**Current:** Setup script exists but not run

**Tasks:**
- [ ] Deploy integration-service to Cloud Run first
- [ ] Get Cloud Run service URL
- [ ] Run: `./scripts/setup-verification-scheduler.sh`
- [ ] Verify job created: `gcloud scheduler jobs list`
- [ ] Test job manually: `gcloud scheduler jobs run verification-expiration-check`

---

### 9. TESTING (3-4 hours)

**Unit Tests:**
- [ ] Test webhook handler (valid/invalid payloads)
- [ ] Test verification endpoint (success/failure cases)
- [ ] Test expired check (mock time)
- [ ] Test membership check (existing/new customers)

**Integration Tests:**
- [ ] Test Veriff session creation
- [ ] Test Veriff webhook callback
- [ ] Test KAJA refund API
- [ ] Test SendGrid email delivery
- [ ] Test LightSpeed customer lookup

**E2E Test:**
- [ ] Place test order on reggieanddro.com
- [ ] Verify webhook received
- [ ] Complete Veriff verification
- [ ] Verify loyalty enrollment
- [ ] Wait 72 hours (or mock) → Verify refund

---

### 10. MONITORING & ALERTS (1-2 hours)

**Cloud Monitoring:**
- [ ] Alert: Webhook failures (>5% error rate)
- [ ] Alert: Verification completion rate <75%
- [ ] Alert: Auto-refunds >20% of orders
- [ ] Alert: Veriff API errors
- [ ] Alert: KAJA refund failures

**Dashboard Metrics:**
- [ ] Total orders pending verification
- [ ] Verification completion rate
- [ ] Membership opt-in rate
- [ ] Auto-refund count & amount
- [ ] Average time to verification

---

## 📊 TIME ESTIMATE

| Task | Time | Priority |
|------|------|----------|
| Veriff Integration | 2-3 hours | P0 |
| Membership Check | 1-2 hours | P0 |
| Loyalty Enrollment | 2-3 hours | P1 |
| Auto-Refund (KAJA) | 3-4 hours | P0 |
| Email Integration | 2-3 hours | P0 |
| LightSpeed Webhook | 30 min | P0 |
| BigQuery Persistence | 1-2 hours | P1 |
| Cloud Scheduler | 15 min | P0 |
| Testing | 3-4 hours | P0 |
| Monitoring | 1-2 hours | P1 |

**Total:** 16-24 hours of real development work

---

## ✅ RECOMMENDED APPROACH

**Phase 1 (MVP - 8 hours):**
1. Veriff integration (2-3 hrs)
2. Email integration (2-3 hrs)
3. LightSpeed webhook (30 min)
4. Cloud Scheduler (15 min)
5. Basic testing (2 hrs)

**Result:** Customers can verify, get confirmation emails, system tracks 72hrs

**Phase 2 (Full System - 8 hours):**
1. KAJA auto-refund (3-4 hrs)
2. Loyalty enrollment (2-3 hrs)
3. BigQuery persistence (1-2 hrs)
4. Comprehensive testing (2 hrs)

**Result:** Full auto-refund + loyalty system operational

**Phase 3 (Polish - 4 hours):**
1. Monitoring & alerts (1-2 hrs)
2. Membership check optimization (1 hr)
3. E2E testing (1 hr)
4. Production deployment (30 min)

**Result:** Production-ready, monitored, optimized

---

## 🚨 HONEST ANSWER TO YOUR QUESTION

**"Does it work?"**

**NO.** The code I wrote is:
- ✅ Structurally sound (routes, handlers, logic flow)
- ✅ Ready to be filled in with real integrations
- ❌ Using placeholder functions that return fake data
- ❌ Not connected to Veriff
- ❌ Not connected to KAJA for refunds
- ❌ Not connected to loyalty system
- ❌ Not persisting to BigQuery
- ❌ Not tested

**What I delivered:**
- Architecture blueprint (how it should work)
- Skeleton code (where integrations plug in)
- Deployment scripts (how to deploy when ready)
- Documentation (what needs to be built)

**What's needed:**
- 16-24 hours of real integration work
- API credentials (Veriff, KAJA, SendGrid)
- Testing on reggieanddro.com
- Production deployment

---

**Want me to build Phase 1 (MVP) now with Codex? 8 hours of focused work to get verification + emails working?**
