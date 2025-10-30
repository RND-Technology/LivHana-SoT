### HERB LAYER SCHEMA

```sql
-- Commerce Metrics
CREATE TABLE herb_commerce_metrics (
    id SERIAL PRIMARY KEY,
    month_year VARCHAR(7) NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    customer_acquisition_cost DECIMAL(10,2) DEFAULT 0,
    customer_lifetime_value DECIMAL(10,2) DEFAULT 0,
    churn_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Performance
CREATE TABLE product_performance (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    month_year VARCHAR(7) NOT NULL,
    units_sold INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    customer_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
