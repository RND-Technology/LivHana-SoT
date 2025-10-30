### OPS LAYER SCHEMA

```sql
-- Policy Impact Tracking
CREATE TABLE policy_impact_metrics (
    id SERIAL PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL,
    implementation_date DATE NOT NULL,
    compliance_rate DECIMAL(5,2) DEFAULT 0,
    cost_impact DECIMAL(10,2) DEFAULT 0,
    revenue_impact DECIMAL(10,2) DEFAULT 0,
    net_impact DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advocacy Metrics
CREATE TABLE advocacy_metrics (
    id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    supporters_count INTEGER DEFAULT 0,
    donations_received DECIMAL(10,2) DEFAULT 0,
    policy_changes INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
