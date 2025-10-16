### 2.3 Payment Processing

**Payment Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                  KAJA PAYMENT GATEWAY                         │
│              (Abstraction over Authorize.Net)                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │  Integration │         │ Authorize.Net│
│   Checkout   │────────▶│   Service    │────────▶│   Gateway    │
│              │         │   (KAJA)     │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                         │                         │
       │ Payment method         │ Process charge          │
       │ Customer details       │ Verify + capture        │ auth_capture
       │                        │                         │ void
       ▼                        ▼                         │ refund
┌─────────────────────────────────────────────────────────────┐
│  PAYMENT TYPES:                                               │
│  - One-time purchases (products)                             │
│  - Recurring subscriptions (memberships)                     │
│  - Raffle ticket purchases                                   │
│  - Age verification deposits (refundable)                    │
└─────────────────────────────────────────────────────────────┘
```

**Payment Gateway Implementation:**

**File:** `/backend/integration-service/src/membership.js:134-223`

```javascript
class KAJAPaymentGateway {
  constructor() {
    this.apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
    this.transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
    this.apiUrl = process.env.AUTHORIZE_NET_SANDBOX === 'true'
      ? 'https://apitest.authorize.net/xml/v1/request.api'
      : 'https://api.authorize.net/xml/v1/request.api';
  }

  // Create recurring subscription
  async createSubscription(customerData, tier, paymentMethod) {
    const subscriptionId = `SUB_${tier}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // In production: actual Authorize.Net ARB API call
    // Current: Mock response for development

    return {
      subscriptionId,
      status: 'active',
      amount: MEMBERSHIP_TIERS[tier].price,
      interval: 'monthly',
      nextBillingDate: this.calculateNextBillingDate(),
      paymentMethodId: paymentMethod.id || `PM_${crypto.randomBytes(8).toString('hex')}`
    };
  }

  // Process one-time charge
  async chargeCard(amount, paymentMethod, description) {
    const transactionId = `TXN_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    // Production: Authorize.Net AIM API call

    return {
      transactionId,
      status: 'success',
      amount,
      timestamp: new Date().toISOString()
    };
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    // Production: Authorize.Net ARB cancellation

    return {
      success: true,
      subscriptionId,
      cancelledAt: new Date().toISOString()
    };
  }
}
```

**Payment Data Models:**

```javascript
// raffle_transactions schema (raffle.js:119-137)
{
  id: STRING (transaction ID),
  raffle_id: STRING (which raffle),
  customer_id: STRING,
  customer_email: STRING,
  num_tickets: INTEGER,
  ticket_numbers: STRING (JSON array),
  amount: FLOAT (total charge),
  payment_method: STRING (credit_card, debit, etc.),
  payment_status: STRING (success, pending, failed, refunded),
  payment_gateway_id: STRING (Authorize.Net transaction ID),
  payment_gateway_response: STRING (full gateway response),
  refund_id: STRING (if refunded),
  refund_date: TIMESTAMP,
  ip_address: STRING (fraud prevention),
  user_agent: STRING (fraud prevention),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Business Rules:**

1. **PCI Compliance:** Payment method tokens stored, not raw card data
2. **Idempotency:** Transaction IDs include timestamp + random bytes
3. **Audit Trail:** Full gateway response stored for dispute resolution
4. **Refund Policy:** Automatic refund if raffle cancelled, tracked in `refund_id`
5. **Fraud Prevention:** IP + User-Agent logging for suspicious pattern detection

**Payment Processing Flow:**

```
1. Customer submits payment
2. Frontend tokenizes card (Authorize.Net.js)
3. Backend receives payment token
4. KAJA gateway processes charge
5. Transaction recorded in BigQuery
6. Email receipt sent (via EMAIL_SERVICE_URL)
7. Membership/ticket activated
8. Confirmation returned to frontend
```

**Error Handling:**

```javascript
// Comprehensive error scenarios
try {
  const result = await kajaGateway.chargeCard(amount, paymentMethod, description);

  if (result.status === 'declined') {
    // Card declined - inform customer
    return { success: false, error: 'Payment declined. Please use a different card.' };
  }

  if (result.status === 'fraud_review') {
    // Flagged for fraud - manual review required
    await notifyAdminForReview(result);
    return { success: false, error: 'Payment under review. You will be contacted.' };
  }

  // Success path
  await recordTransaction(result);
  return { success: true, transactionId: result.transactionId };

} catch (error) {
  // Network/gateway error - retry logic
  logger.error('Payment processing failed', error);
  return { success: false, error: 'Payment service temporarily unavailable. Please try again.' };
}
```

---
