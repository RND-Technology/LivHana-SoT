### BigQuery SQL Query: Calculate Lifetime Value

**File: `/queries/square_customer_ltv_report.sql`**

```sql
-- Square Customer Lifetime Value (LTV) Report
-- Ranks all 11,348 customers by total spend from July 2023 - Present
-- Includes tier assignment for Grand Fathered Loyalty Points

WITH customer_spending AS (
  SELECT
    customer_id,
    customer_email,
    customer_first_name,
    customer_last_name,
    COUNT(DISTINCT payment_id) AS total_orders,
    SUM(amount_cents) / 100.0 AS total_spent_usd,
    MIN(created_at) AS first_order_date,
    MAX(created_at) AS last_order_date,
    DATE_DIFF(CURRENT_DATE(), DATE(MAX(created_at)), DAY) AS days_since_last_order,
    ROUND(SUM(amount_cents) / 100.0 / COUNT(DISTINCT payment_id), 2) AS avg_order_value
  FROM `livhana-422923.commerce.square_payments`
  WHERE status = 'COMPLETED'
    AND created_at >= '2023-07-01 00:00:00'
  GROUP BY customer_id, customer_email, customer_first_name, customer_last_name
),

customer_tiers AS (
  SELECT
    *,
    CASE
      WHEN total_spent_usd >= 5000 THEN 'PLATINUM'
      WHEN total_spent_usd >= 2500 THEN 'GOLD'
      WHEN total_spent_usd >= 1000 THEN 'SILVER'
      WHEN total_spent_usd >= 500 THEN 'BRONZE'
      ELSE 'MEMBER'
    END AS loyalty_tier,
    CASE
      WHEN total_spent_usd >= 5000 THEN 5000  -- Platinum: 5000 bonus points
      WHEN total_spent_usd >= 2500 THEN 2500  -- Gold: 2500 bonus points
      WHEN total_spent_usd >= 1000 THEN 1000  -- Silver: 1000 bonus points
      WHEN total_spent_usd >= 500 THEN 500    -- Bronze: 500 bonus points
      ELSE 100                                 -- Member: 100 welcome points
    END AS grand_fathered_points
  FROM customer_spending
)

SELECT
  customer_id,
  customer_email,
  customer_first_name,
  customer_last_name,
  total_orders,
  total_spent_usd AS lifetime_value_usd,
  avg_order_value,
  first_order_date,
  last_order_date,
  days_since_last_order,
  loyalty_tier,
  grand_fathered_points,
  RANK() OVER (ORDER BY total_spent_usd DESC) AS ltv_rank
FROM customer_tiers
ORDER BY total_spent_usd DESC;
```

**Tier Breakdown:**

| Tier | LTV Threshold | Grand Fathered Points | Benefits |
|------|---------------|----------------------|----------|
| 🏆 **PLATINUM** | $5,000+ | 5,000 points | Instant $50 shopping spree + VIP concierge |
| 🥇 **GOLD** | $2,500+ | 2,500 points | Instant $25 shopping spree + early access |
| 🥈 **SILVER** | $1,000+ | 1,000 points | Instant $10 shopping spree + exclusive strains |
| 🥉 **BRONZE** | $500+ | 500 points | Instant $5 shopping spree + member benefits |
| 👤 **MEMBER** | <$500 | 100 points | Welcome bonus |

---
