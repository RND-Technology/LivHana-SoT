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
