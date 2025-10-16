### HNC LAYER SCHEMA

```sql
-- Content Production Metrics
CREATE TABLE hnc_production_metrics (
    id SERIAL PRIMARY KEY,
    episode_number INTEGER NOT NULL,
    production_date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    production_cost DECIMAL(10,2) DEFAULT 0,
    net_profit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Licensing Revenue
CREATE TABLE hnc_licensing (
    id SERIAL PRIMARY KEY,
    licensee_name VARCHAR(100) NOT NULL,
    license_type VARCHAR(50) NOT NULL,
    monthly_fee DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
