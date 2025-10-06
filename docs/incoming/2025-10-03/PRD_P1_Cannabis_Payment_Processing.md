# PRD-P1: Cannabis Payment Processing (KAJA/Authorize.Net)

**Status:** TIER 1 ACTIVE  
**Date:** 2025-09-28  
**Owner:** Payment Team + Compliance Officer  
**Stakeholders:** Jesse (CEO), Cannabis Operations, Finance  
**Priority:** P0 - REVENUE CRITICAL

---

## 1. EXECUTIVE SUMMARY

Implement cannabis-compliant payment processing using KAJA/Authorize.Net gateway for Texas DSHS License #690 operations, supporting $100K+ monthly revenue with full compliance, security, and fraud protection.

## 2. BUSINESS CONTEXT

### 2.1 Cannabis Payment Challenges
- Traditional payment processors (Stripe, Square) prohibit cannabis transactions
- Cannabis businesses require specialized "cannabis-friendly" payment gateways
- Higher fraud risk and regulatory compliance requirements
- Need for robust age verification and geographic restrictions

### 2.2 Success Metrics
```yaml
REVENUE_TARGETS:
  monthly_gross_revenue: "$100,000+"
  transaction_success_rate: "98%+"
  average_order_value: "$75"
  customer_lifetime_value: "$500+"
  
COMPLIANCE_TARGETS:
  age_verification_success: "100%"
  thc_compliance_rate: "100%"
  regulatory_audit_score: "100%"
  
OPERATIONAL_TARGETS:
  payment_processing_time: "<3 seconds"
  dispute_rate: "<0.5%"
  chargeback_rate: "<1%"
```

## 3. CORE REQUIREMENTS

### 3.1 Cannabis-Specific Payment Features
```typescript
interface CannabisPayment {
  // Customer validation
  age_verified: boolean;           // 21+ required
  identity_verified: boolean;      // Government ID + biometric
  texas_resident: boolean;         // Geographic restriction
  
  // Product compliance
  products: CannabisProduct[];     // THC ≤0.3%, COA verified
  total_amount: number;            // USD amount
  tax_calculation: TexasTax;       // State/local taxes
  
  // Payment security
  idempotency_key: string;         // Duplicate prevention
  fraud_score: number;             // Risk assessment
  compliance_check: boolean;       // DSHS License validation
  
  // Audit trail
  transaction_id: string;          // Unique identifier
  timestamp: ISO8601;              // Transaction time
  audit_log: ComplianceLog[];      // Regulatory tracking
}
```

### 3.2 KAJA/Authorize.Net Integration
```javascript
class KAJAAuthorizeNetProcessor {
  constructor() {
    this.apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
    this.transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
    this.sandbox = process.env.NODE_ENV !== 'production';
    this.apiUrl = this.sandbox 
      ? 'https://apitest.authorize.net/xml/v1/request.api'
      : 'https://api.authorize.net/xml/v1/request.api';
  }

  async processCannabisPayment(payment: CannabisPayment) {
    // 1. Pre-payment validation
    await this.validateCannabisCompliance(payment);
    
    // 2. Create Authorize.Net transaction
    const transactionRequest = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: this.apiLoginId,
          transactionKey: this.transactionKey
        },
        transactionRequest: {
          transactionType: 'authCaptureTransaction',
          amount: payment.total_amount,
          payment: {
            creditCard: payment.card_data
          },
          order: {
            invoiceNumber: payment.invoice_number,
            description: `Cannabis Order - Texas DSHS #690`
          },
          userFields: [
            { name: 'cannabis_license', value: 'Texas-DSHS-690' },
            { name: 'age_verified', value: payment.age_verified.toString() },
            { name: 'thc_compliant', value: 'true' }
          ]
        }
      }
    };
    
    // 3. Process payment with retry logic
    return await this.executeWithRetry(transactionRequest);
  }
}
```

### 3.3 3D Secure 2.0 Implementation
```javascript
// Enhanced security for cannabis transactions
class ThreeDSecure2Integration {
  async authenticate(payment) {
    const authenticationRequest = {
      amount: payment.total_amount,
      currency: 'USD',
      merchantCategoryCode: '5969', // Cannabis retail
      threeDSRequestorAuthenticationInd: '01', // Payment authentication
      deviceChannel: '02', // Browser
      messageCategory: '01', // Payment Authentication
      
      // Cannabis-specific data
      merchantRiskIndicator: {
        shipIndicator: '01',        // Ship to billing address
        deliveryTimeframe: '02',    // Same day delivery
        preOrderPurchaseInd: '01',  // Merchandise available
        reorderItemsInd: '01',      // First time ordered
        giftCardAmount: '0',        // No gift cards (cannabis restriction)
        giftCardCount: '0'
      },
      
      // Customer verification
      acctInfo: {
        chAccAgeInd: payment.customer.account_age_indicator,
        chAccDate: payment.customer.account_created_date,
        chAccPwChange: payment.customer.password_changed_date
      }
    };
    
    return await this.performAuthentication(authenticationRequest);
  }
}
```

## 4. FRAUD PROTECTION & SECURITY

### 4.1 Cannabis-Specific Fraud Detection
```python
class CannabisFraudDetection:
    def __init__(self):
        self.risk_factors = {
            'age_verification_mismatch': 100,    # Immediate block
            'non_texas_location': 95,           # Very high risk
            'multiple_failed_age_checks': 90,   # High risk
            'unusual_purchase_amount': 70,      # Medium-high risk
            'new_customer_large_order': 60,     # Medium risk
            'rapid_repeat_purchases': 50        # Monitor closely
        }
    
    def calculate_risk_score(self, transaction):
        score = 0
        
        # Age verification inconsistencies
        if not transaction.age_verified:
            score += self.risk_factors['age_verification_mismatch']
        
        # Geographic restrictions
        if transaction.customer.location.state != 'TX':
            score += self.risk_factors['non_texas_location']
        
        # Purchase pattern analysis
        if transaction.amount > transaction.customer.avg_order * 3:
            score += self.risk_factors['unusual_purchase_amount']
        
        # Velocity checks
        recent_orders = self.get_recent_orders(transaction.customer.id, hours=24)
        if len(recent_orders) > 5:
            score += self.risk_factors['rapid_repeat_purchases']
        
        return min(score, 100)  # Cap at 100%
    
    def determine_action(self, risk_score):
        if risk_score >= 90:
            return 'BLOCK'
        elif risk_score >= 70:
            return 'MANUAL_REVIEW'
        elif risk_score >= 50:
            return 'ENHANCED_VERIFICATION'
        else:
            return 'APPROVE'
```

### 4.2 Idempotency & Duplicate Prevention
```javascript
class PaymentIdempotency {
  constructor() {
    this.cache = new Redis(process.env.REDIS_URL);
    this.ttl = 86400; // 24 hours
  }
  
  async checkIdempotency(idempotencyKey, paymentData) {
    const existingResult = await this.cache.get(`payment:${idempotencyKey}`);
    
    if (existingResult) {
      const parsed = JSON.parse(existingResult);
      
      // Verify payload matches to prevent key reuse attacks
      if (this.payloadMatches(parsed.original_data, paymentData)) {
        return {
          duplicate: true,
          original_result: parsed.result
        };
      } else {
        throw new Error('Idempotency key reused with different payload');
      }
    }
    
    return { duplicate: false };
  }
  
  async storeResult(idempotencyKey, paymentData, result) {
    const record = {
      original_data: this.hashPayload(paymentData),
      result: result,
      timestamp: new Date().toISOString()
    };
    
    await this.cache.setex(
      `payment:${idempotencyKey}`, 
      this.ttl, 
      JSON.stringify(record)
    );
  }
}
```

## 5. DISPUTE & CHARGEBACK MANAGEMENT

### 5.1 Cannabis Dispute Prevention
```javascript
class CannabisDisputePrevention {
  async preventDispute(transaction) {
    const preventionMeasures = {
      // Clear product documentation
      product_documentation: {
        detailed_lab_results: transaction.products.map(p => p.coa_url),
        thc_content_disclosure: transaction.products.map(p => p.thc_content),
        legal_disclaimers: this.getCannabisDisclaimers(),
        purchase_confirmation: this.generateDetailedReceipt(transaction)
      },
      
      // Customer communication
      customer_communication: {
        order_confirmation_email: true,
        shipping_notifications: true,
        delivery_confirmation: true,
        satisfaction_followup: true
      },
      
      // Documentation retention
      compliance_records: {
        age_verification_proof: transaction.age_verification_data,
        identity_verification: transaction.identity_data,
        purchase_intent_confirmation: transaction.consent_data,
        delivery_confirmation: transaction.delivery_proof
      }
    };
    
    return preventionMeasures;
  }
  
  async handleDispute(dispute) {
    // Cannabis-specific dispute response
    const evidence_package = {
      age_verification: dispute.transaction.age_verification_proof,
      product_compliance: dispute.transaction.products.map(p => ({
        name: p.name,
        thc_content: p.thc_content,
        coa_certificate: p.coa_url,
        lab_testing_date: p.testing_date
      })),
      delivery_confirmation: dispute.transaction.delivery_proof,
      customer_communication: dispute.transaction.email_trail,
      legal_compliance: {
        dshs_license: 'Texas-DSHS-690',
        federal_compliance: 'Hemp Farm Bill 2018',
        state_compliance: 'Texas Agriculture Code Chapter 121'
      }
    };
    
    return await this.submitDisputeEvidence(dispute.id, evidence_package);
  }
}
```

### 5.2 Chargeback Protection
```yaml
CHARGEBACK_PROTECTION:
  prevention_measures:
    - clear_billing_descriptor: "REGGIE&DRO CANNABIS TX"
    - customer_service_phone: "1-800-REGGIE-DRO"
    - detailed_receipts: "itemized with THC content"
    - shipping_confirmation: "signature required delivery"
    - satisfaction_guarantee: "30-day return policy"
    
  evidence_collection:
    - transaction_logs: "complete audit trail"
    - customer_communications: "email/SMS history"
    - delivery_confirmation: "GPS + signature"
    - product_documentation: "COA + lab results"
    - compliance_records: "age verification + ID"
    
  response_timeline:
    - initial_response: "within 7 days"
    - evidence_submission: "within 14 days"
    - representment: "within 30 days"
```

## 6. TECHNICAL IMPLEMENTATION

### 6.1 API Endpoints
```typescript
// Cannabis payment processing endpoints
interface PaymentAPI {
  // Create payment intent
  POST /api/payments/cannabis/intent: {
    amount: number;
    products: CannabisProduct[];
    customer: VerifiedCustomer;
    compliance_check: boolean;
  }
  
  // Process payment
  POST /api/payments/cannabis/process: {
    payment_intent_id: string;
    payment_method: PaymentMethod;
    idempotency_key: string;
  }
  
  // Verify payment status
  GET /api/payments/cannabis/:id/status: PaymentStatus;
  
  // Handle webhooks
  POST /api/webhooks/authorize-net: AuthorizeNetWebhook;
  
  // Refund processing
  POST /api/payments/cannabis/:id/refund: RefundRequest;
}
```

### 6.2 Database Schema
```sql
-- Cannabis payment transactions
CREATE TABLE cannabis_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    
    -- Payment details
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL,
    
    -- Cannabis compliance
    age_verified BOOLEAN NOT NULL DEFAULT false,
    texas_resident BOOLEAN NOT NULL DEFAULT false,
    dshs_license VARCHAR(50) DEFAULT 'Texas-DSHS-690',
    
    -- Product information
    products JSONB NOT NULL,
    thc_compliant BOOLEAN NOT NULL DEFAULT false,
    coa_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Authorize.Net details
    auth_net_transaction_id VARCHAR(50),
    auth_net_auth_code VARCHAR(10),
    auth_net_response_code VARCHAR(5),
    
    -- Fraud & risk
    fraud_score INTEGER DEFAULT 0,
    risk_factors JSONB,
    manual_review BOOLEAN DEFAULT false,
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance tracking
    compliance_log JSONB,
    audit_trail JSONB
);

-- Indexes for performance
CREATE INDEX idx_cannabis_payments_customer ON cannabis_payments(customer_id);
CREATE INDEX idx_cannabis_payments_status ON cannabis_payments(status);
CREATE INDEX idx_cannabis_payments_created ON cannabis_payments(created_at);
CREATE INDEX idx_cannabis_payments_transaction ON cannabis_payments(transaction_id);
```

## 7. TESTING & VALIDATION

### 7.1 Cannabis Payment Test Scenarios
```javascript
// Comprehensive test suite for cannabis payments
describe('Cannabis Payment Processing', () => {
  
  test('successful_21_plus_texas_resident_payment', async () => {
    const payment = createValidCannabisPayment({
      customer_age: 25,
      location: 'Austin, TX',
      products: [{ name: 'Hemp Oil', thc_content: 0.2, coa_verified: true }]
    });
    
    const result = await processor.processCannabisPayment(payment);
    expect(result.success).toBe(true);
    expect(result.compliance.hemp_law).toBe('compliant');
  });
  
  test('blocked_under_21_payment', async () => {
    const payment = createInvalidCannabisPayment({
      customer_age: 19,
      location: 'Austin, TX'
    });
    
    await expect(processor.processCannabisPayment(payment))
      .rejects.toThrow('Age verification failed');
  });
  
  test('blocked_non_texas_payment', async () => {
    const payment = createInvalidCannabisPayment({
      customer_age: 25,
      location: 'Los Angeles, CA'
    });
    
    await expect(processor.processCannabisPayment(payment))
      .rejects.toThrow('Geographic restriction violation');
  });
  
  test('blocked_high_thc_product', async () => {
    const payment = createInvalidCannabisPayment({
      products: [{ name: 'High THC Product', thc_content: 0.8 }]
    });
    
    await expect(processor.processCannabisPayment(payment))
      .rejects.toThrow('THC content exceeds legal limit');
  });
});
```

### 7.2 Performance Testing
```yaml
PERFORMANCE_REQUIREMENTS:
  payment_processing_time:
    target: "< 3 seconds"
    max_acceptable: "< 5 seconds"
    
  throughput:
    target: "100 transactions/minute"
    peak_capacity: "500 transactions/minute"
    
  availability:
    target: "99.9% uptime"
    max_downtime: "8.76 hours/year"
    
  fraud_detection:
    response_time: "< 500ms"
    accuracy: "> 95%"
```

## 8. MONITORING & ALERTING

### 8.1 Payment Metrics Dashboard
```javascript
const CANNABIS_PAYMENT_METRICS = {
  // Revenue metrics
  daily_revenue: 'sum(amount) where date = today',
  monthly_revenue: 'sum(amount) where month = current',
  average_order_value: 'avg(amount) where status = success',
  
  // Success metrics
  payment_success_rate: 'success_count / total_count * 100',
  authorization_rate: 'authorized_count / attempted_count * 100',
  settlement_rate: 'settled_count / authorized_count * 100',
  
  // Compliance metrics
  age_verification_rate: 'age_verified_count / total_count * 100',
  thc_compliance_rate: 'thc_compliant_count / total_count * 100',
  texas_resident_rate: 'texas_resident_count / total_count * 100',
  
  // Risk metrics
  fraud_detection_rate: 'fraud_detected_count / total_count * 100',
  chargeback_rate: 'chargeback_count / total_count * 100',
  dispute_rate: 'dispute_count / total_count * 100'
};
```

### 8.2 Alert Configuration
```yaml
PAYMENT_ALERTS:
  critical:
    - payment_success_rate < 95%
    - age_verification_failure
    - thc_non_compliance_detected
    - authorize_net_connection_failure
    
  warning:
    - payment_success_rate < 98%
    - fraud_score > 70
    - unusual_transaction_volume
    - high_dispute_rate
    
  info:
    - daily_revenue_milestone
    - new_customer_first_purchase
    - monthly_revenue_target_reached
```

## 9. COMPLIANCE & AUDIT

### 9.1 Regulatory Reporting
```python
class CannabisPaymentReporting:
    def generate_dshs_report(self, period):
        """Generate quarterly report for Texas DSHS"""
        return {
            'reporting_period': period,
            'license_number': 'Texas-DSHS-690',
            'total_transactions': self.get_transaction_count(period),
            'gross_revenue': self.get_gross_revenue(period),
            'tax_collected': self.get_tax_amount(period),
            'customer_demographics': self.get_age_demographics(period),
            'product_sales_breakdown': self.get_product_metrics(period),
            'compliance_incidents': self.get_compliance_incidents(period)
        }
    
    def generate_audit_trail(self, transaction_id):
        """Generate complete audit trail for specific transaction"""
        return {
            'transaction_details': self.get_transaction(transaction_id),
            'customer_verification': self.get_verification_data(transaction_id),
            'product_compliance': self.get_product_compliance(transaction_id),
            'payment_processing': self.get_payment_flow(transaction_id),
            'regulatory_checks': self.get_compliance_checks(transaction_id)
        }
```

## 10. DEPLOYMENT & ROLLOUT

### 10.1 Phased Deployment Plan
```yaml
DEPLOYMENT_PHASES:
  phase_1_sandbox:
    duration: "1 week"
    scope: "Development environment testing"
    success_criteria:
      - all_unit_tests_pass
      - integration_tests_complete
      - security_scan_clean
      
  phase_2_staging:
    duration: "1 week"  
    scope: "Staging environment with test transactions"
    success_criteria:
      - end_to_end_flow_working
      - compliance_validation_active
      - fraud_detection_functional
      
  phase_3_production:
    duration: "2 weeks"
    scope: "Gradual production rollout"
    success_criteria:
      - 100_successful_transactions
      - zero_compliance_violations
      - target_success_rate_achieved
```

### 10.2 Rollback Plan
```bash
#!/bin/bash
# Cannabis payment rollback procedure

echo "🚨 INITIATING CANNABIS PAYMENT ROLLBACK"

# 1. Stop new payment processing
kubectl scale deployment cannabis-payment-api --replicas=0

# 2. Enable maintenance mode
kubectl apply -f maintenance-mode.yaml

# 3. Revert to previous payment processor
kubectl rollout undo deployment/cannabis-payment-api

# 4. Verify rollback success
./check_payment_health.sh

# 5. Re-enable with previous version
kubectl scale deployment cannabis-payment-api --replicas=3

echo "✅ Cannabis payment rollback complete"
```

## 11. SUCCESS CRITERIA

### 11.1 Go-Live Criteria
- [ ] Authorize.Net sandbox integration complete and tested
- [ ] Cannabis compliance validation 100% functional
- [ ] Age verification with HITL review active
- [ ] Texas geofencing enforced
- [ ] Fraud detection tuned and operational
- [ ] 3D Secure 2.0 authentication working
- [ ] Idempotency and duplicate prevention active
- [ ] Dispute management procedures documented
- [ ] Monitoring and alerting configured
- [ ] Regulatory reporting capability ready

### 11.2 Success Metrics (30 days post-launch)
- [ ] $100K+ monthly revenue achieved
- [ ] >98% payment success rate
- [ ] 100% cannabis compliance (zero violations)
- [ ] <1% chargeback rate
- [ ] <0.5% dispute rate
- [ ] <500ms fraud detection response time
- [ ] 99.9% payment processing uptime

---

**REGULATORY COMPLIANCE**: This PRD ensures 100% adherence to Texas DSHS License #690 and federal hemp law requirements for payment processing.

**REVENUE COMMITMENT**: This implementation targets $100K+ monthly revenue through optimized, compliant cannabis payment processing.