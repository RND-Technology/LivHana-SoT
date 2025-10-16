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
