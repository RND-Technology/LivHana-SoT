### R&D LAYER SCHEMA

```sql
-- AI Improvement Rate Tracking
CREATE TABLE ai_improvement_rates (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    benchmark_type VARCHAR(50) NOT NULL,
    improvement_points DECIMAL(10,2) NOT NULL,
    quarterly_rate DECIMAL(5,2) NOT NULL,
    monthly_rate DECIMAL(5,2) NOT NULL,
    daily_rate DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue Tracking
CREATE TABLE revenue_metrics (
    id SERIAL PRIMARY KEY,
    month_year VARCHAR(7) NOT NULL,
    b2b_revenue DECIMAL(12,2) DEFAULT 0,
    retail_revenue DECIMAL(12,2) DEFAULT 0,
    hnc_revenue DECIMAL(12,2) DEFAULT 0,
    consulting_revenue DECIMAL(12,2) DEFAULT 0,
    total_revenue DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cost Tracking
CREATE TABLE cost_metrics (
    id SERIAL PRIMARY KEY,
    month_year VARCHAR(7) NOT NULL,
    infrastructure_cost DECIMAL(12,2) DEFAULT 0,
    team_cost DECIMAL(12,2) DEFAULT 0,
    marketing_cost DECIMAL(12,2) DEFAULT 0,
    legal_cost DECIMAL(12,2) DEFAULT 0,
    total_cost DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profit Analysis
CREATE TABLE profit_analysis (
    id SERIAL PRIMARY KEY,
    month_year VARCHAR(7) NOT NULL,
    revenue DECIMAL(12,2) NOT NULL,
    costs DECIMAL(12,2) NOT NULL,
    net_profit DECIMAL(12,2) NOT NULL,
    profit_margin DECIMAL(5,2) NOT NULL,
    roi_percentage DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scenario Planning
CREATE TABLE scenario_projections (
    id SERIAL PRIMARY KEY,
    scenario_type VARCHAR(20) NOT NULL, -- optimistic, moderate, pessimistic
    month_year VARCHAR(7) NOT NULL,
    projected_revenue DECIMAL(12,2) NOT NULL,
    projected_costs DECIMAL(12,2) NOT NULL,
    projected_profit DECIMAL(12,2) NOT NULL,
    probability DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
