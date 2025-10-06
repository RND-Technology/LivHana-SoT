# OPS_PAYMENT_PRD • FUSION DOC
**Source:** PRD_P1_Cannabis_Payment_Processing.md
**Fused:** 2025-10-03 18:55 UTC
**Status:** ℹ️ ALTERNATIVE SYSTEM • NOT BLOCKING TEXAS TAKEOVER
**Next Action:** Evaluate KAJA/Authorize.Net as Square backup (post-launch)

---

## CONTEXT • PAYMENT PROCESSOR LANDSCAPE

**Texas Takeover Uses:** Square (current production system)
**This PRD Proposes:** KAJA/Authorize.Net (cannabis-specific gateway)

### Why Two Systems?

**Square (Current):**
- ✅ Already integrated (production-ready)
- ✅ PCI-compliant, fraud protection built-in
- ✅ Supports hemp flower (with Veriff age verification)
- ⚠️ "High-risk" classification → termination risk if compliance issues
- ⚠️ Higher fees for cannabis-adjacent businesses

**KAJA/Authorize.Net (Proposed):**
- ✅ Cannabis-specific gateway (lower termination risk)
- ✅ Designed for DSHS-licensed operations (Texas medical cannabis)
- ✅ Built-in compliance features (age verification, geographic restrictions)
- ⚠️ Not yet integrated (requires development work)
- ⚠️ May have higher per-transaction fees than Square

**Decision:** Keep Square for Texas Takeover launch, evaluate KAJA/Authorize.Net as backup post-launch

---

## PRD SUMMARY • KEY REQUIREMENTS

**Business Goals:**
- Monthly revenue: $100K+
- Transaction success rate: 98%+
- Average order value: $75
- Customer lifetime value: $500+

**Compliance Targets:**
- Age verification: 100% (21+)
- THC compliance: 100% (≤0.3% Δ9-THC)
- Geographic restrictions: Texas residents only (or legal states)
- Regulatory audit: 100% pass rate

**Technical Specs:**
- Payment processing time: <3 seconds
- Dispute rate: <0.5%
- Chargeback rate: <1%
- PCI DSS Level 1 compliance (Authorize.Net handles this)

---

## CANNABIS-SPECIFIC FEATURES • COMPLIANCE LAYER

**Pre-Payment Validation Flow:**
```typescript
interface CannabisPayment {
  // Customer validation
  age_verified: boolean;           // 21+ (Veriff)
  identity_verified: boolean;      // Government ID + biometric
  texas_resident: boolean;         // Geographic restriction

  // Product compliance
  products: CannabisProduct[];     // THC ≤0.3%, COA verified
  total_amount: number;            // USD amount
  tax_calculation: TexasTax;       // State/local sales tax

  // Payment security
  idempotency_key: string;         // Duplicate transaction prevention
  fraud_score: number;             // Risk assessment (0-100)
  compliance_check: boolean;       // DSHS License #690 validation

  // Audit trail
  transaction_id: string;          // Unique identifier
  timestamp: ISO8601;              // Transaction timestamp
  audit_log: ComplianceLog[];      // Regulatory audit log
}
```

**Validation Sequence:**
1. **Age Check** → Customer 21+ (Veriff on file OR post-purchase verification)
2. **Geographic Check** → Shipping address in legal state
3. **Product Check** → All items have COAs showing Δ9-THC ≤0.3%
4. **Fraud Check** → Risk score <75 (decline if higher)
5. **Payment Processing** → Authorize.Net `authCaptureTransaction`
6. **Audit Logging** → Save transaction + compliance data to database

---

## INTEGRATION ARCHITECTURE • KAJA/AUTHORIZE.NET

**API Configuration:**
```javascript
class KAJAAuthorizeNetProcessor {
  constructor() {
    this.apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
    this.transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
    this.sandbox = process.env.NODE_ENV !== 'production';
    this.apiUrl = this.sandbox
      ? 'https://apitest.authorize.net/xml/v1/request.api'  // Test
      : 'https://api.authorize.net/xml/v1/request.api';     // Production
  }

  async processCannabisPayment(payment: CannabisPayment) {
    // 1. Pre-payment compliance validation
    await this.validateCannabisCompliance(payment);

    // 2. Create Authorize.Net transaction
    const transactionRequest = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: this.apiLoginId,
          transactionKey: this.transactionKey
        },
        transactionRequest: {
          transactionType: 'authCaptureTransaction',  // Authorize + Capture in one step
          amount: payment.total_amount,
          payment: {
            creditCard: payment.card_data  // Tokenized card (not raw PAN)
          },
          order: {
            invoiceNumber: payment.invoice_number,
            description: `Cannabis Order - Texas DSHS #690`
          },
          customer: {
            email: payment.customer_email,
            id: payment.customer_id  // Internal customer ID
          },
          billTo: {
            firstName: payment.billing.first_name,
            lastName: payment.billing.last_name,
            address: payment.billing.address,
            city: payment.billing.city,
            state: payment.billing.state,
            zip: payment.billing.zip
          },
          shipTo: {
            firstName: payment.shipping.first_name,
            lastName: payment.shipping.last_name,
            address: payment.shipping.address,
            city: payment.shipping.city,
            state: payment.shipping.state,
            zip: payment.shipping.zip
          }
        }
      }
    };

    // 3. Send API request
    const response = await axios.post(this.apiUrl, transactionRequest, {
      headers: { 'Content-Type': 'application/json' }
    });

    // 4. Handle response
    if (response.data.messages.resultCode === 'Ok') {
      return {
        success: true,
        transaction_id: response.data.transactionResponse.transId,
        auth_code: response.data.transactionResponse.authCode,
        avs_result: response.data.transactionResponse.avsResultCode,
        cvv_result: response.data.transactionResponse.cvvResultCode
      };
    } else {
      throw new PaymentError(response.data.messages.message[0].text);
    }
  }

  async validateCannabisCompliance(payment: CannabisPayment) {
    // 1. Age verification (Veriff status check)
    const ageVerified = await veriffAPI.checkVerification(payment.customer_email);
    if (!ageVerified) {
      throw new ComplianceError('Customer age not verified (21+ required)');
    }

    // 2. Product compliance (all items have COAs)
    for (const product of payment.products) {
      const coa = await getProductCOA(product.sku);
      if (!coa || coa.delta9_thc > 0.3) {
        throw new ComplianceError(`Product ${product.sku} exceeds 0.3% THC`);
      }
    }

    // 3. Geographic restriction (Texas or legal states only)
    const legalStates = ['TX', 'CA', 'NY', ...];  // Exclude IN, IA, ID, SD
    if (!legalStates.includes(payment.shipping.state)) {
      throw new ComplianceError(`Shipping to ${payment.shipping.state} not allowed`);
    }

    // 4. Fraud check (basic risk score)
    const fraudScore = await calculateFraudScore(payment);
    if (fraudScore > 75) {
      throw new FraudError('High fraud risk detected');
    }

    return true;  // All checks passed
  }
}
```

---

## COMPARISON • SQUARE VS KAJA/AUTHORIZE.NET

| Feature | Square (Current) | KAJA/Authorize.Net (Proposed) |
|---------|------------------|-------------------------------|
| **Integration Status** | ✅ Live (production) | ⚠️ Not integrated (requires dev work) |
| **Cannabis-Friendly** | ⚠️ Yes, but "high-risk" | ✅ Yes, designed for cannabis |
| **Age Verification** | Manual (Veriff separate) | ✅ Built-in compliance layer |
| **PCI Compliance** | ✅ Level 1 (Square hosted) | ✅ Level 1 (Authorize.Net hosted) |
| **Transaction Fees** | 2.9% + 30¢ | ~3.5% + 30¢ (cannabis premium) |
| **Chargeback Protection** | ⚠️ Limited (manual dispute process) | ✅ Advanced fraud tools (AIM, CIM) |
| **Termination Risk** | ⚠️ Higher (if compliance issues) | ✅ Lower (cannabis-specific) |
| **API Quality** | ✅ Excellent docs, modern REST | ⚠️ XML-based (older API design) |
| **Refunds** | ✅ Built-in Square Refunds API | ✅ Supported via Authorize.Net |
| **Recurring Billing** | ⚠️ Limited | ✅ Robust (CIM for subscriptions) |
| **Best For** | **Texas Takeover launch** (speed) | **Long-term stability** (compliance) |

**Recommendation:** Launch with Square (faster), migrate to KAJA/Authorize.Net if:
1. Square terminates account OR
2. Monthly volume >$50K (higher fees justify migration) OR
3. Subscription tier launches (better recurring billing support)

---

## NEXT ACTIONS • POST-TEXAS TAKEOVER

### **Phase 1: Texas Takeover Launch (Week 1-4)**
- Use Square exclusively (existing integration)
- Focus on verification completion rate (80%+ target)
- Monitor Square account health (chargeback rate, dispute rate)
- Collect data: fraud patterns, refund reasons, payment decline rates

### **Phase 2: Backup Processor Evaluation (Month 2)**
IF Square account stable (no warnings) → **Continue with Square**
IF Square shows termination risk signals → **Activate KAJA/Authorize.Net migration**

**Termination Risk Signals:**
- Chargeback rate >2% (industry standard: <1%)
- Dispute rate >5%
- Verification completion rate <70% (mass refunds)
- Square support emails warning about "high-risk activity"

### **Phase 3: KAJA/Authorize.Net Integration (If Needed)**
**Timeline:** 2-3 weeks development + testing
**Tasks:**
1. Provision Authorize.Net account (`op://livhana/authorize-net` credentials)
2. Build API integration (follow PRD code samples)
3. Add compliance validation layer (age, geographic, product checks)
4. Test in sandbox (10-20 test transactions)
5. Switch DNS payment endpoint (seamless cutover)
6. Monitor for 7 days (compare success rates vs Square)

**Evidence Required:** Migration decision memo + API test logs in `.evidence/2025-11-XX/kaja-migration/`

---

## SUBSCRIPTION BILLING • FUTURE FEATURE

**PRD Highlights Authorize.Net Advantage for Subscriptions:**
- Customer Information Manager (CIM) stores payment profiles securely
- Automated Recurring Billing (ARB) handles subscription charges
- Better support for "pause," "upgrade," "downgrade" flows
- Lower PCI compliance burden (no card data stored locally)

**Subscription Tiers (from Texas Takeover plan):**
- **Steady Supply** ($75/month) – 1 oz value flower
- **Connoisseur** ($150/month) – 1 oz premium + 1 eighth top shelf
- **Texas Legend** ($300/month) – 2 oz top shelf + variety pack

**When to Activate:**
- Texas Takeover hits $100K net sales (success milestone)
- Subscription waitlist reaches 500+ signups
- Square either (1) approves subscription billing OR (2) shows instability → migrate to Authorize.Net

---

## MEMORY ANCHORS

**Key Files:**
- Source: `docs/incoming/2025-10-03/PRD_P1_Cannabis_Payment_Processing.md`
- Fusion: `docs/fusion/ops/OPS_PAYMENT_PRD.md` (this file)

**Decision Points:**
- **Now:** Use Square for Texas Takeover (production-ready)
- **Month 2:** Evaluate Square health → Continue OR migrate to KAJA/Authorize.Net
- **Subscription Launch:** Likely requires Authorize.Net (better recurring billing)

**Integration Specs:**
- API: Authorize.Net XML API (older but stable)
- Auth: `AUTHORIZE_NET_API_LOGIN_ID` + `AUTHORIZE_NET_TRANSACTION_KEY`
- Compliance layer: Age (Veriff), Geographic (state whitelist), Product (COA check)
- Fraud protection: AVS + CVV checks + custom risk scoring

**Success Metrics:**
- Transaction success rate: 98%+
- Chargeback rate: <1%
- Dispute rate: <0.5%
- Payment processing time: <3 seconds

---

## FINAL ASSESSMENT

**This PRD is Tier-1 future planning** for a backup payment system.
**Texas Takeover can launch with Square** (no blockers).
**KAJA/Authorize.Net becomes relevant IF:**
1. Square terminates OR shows termination risk signals
2. Monthly volume justifies migration (>$50K/month)
3. Subscription tier launches (better recurring billing support)

**Recommended Path:**
1. Launch Texas Takeover with Square (use existing integration)
2. Monitor Square account health (chargeback/dispute rates)
3. Month 2: Decide to continue with Square OR migrate to KAJA/Authorize.Net
4. If migrating: 2-3 week development + testing timeline

**Logged:** 2025-10-03 18:55 UTC
**Fusion by:** Sonnet 4.5
**Next Action:** Update COMMANDER_CODEX_ORDERS.md with all extracted missions
