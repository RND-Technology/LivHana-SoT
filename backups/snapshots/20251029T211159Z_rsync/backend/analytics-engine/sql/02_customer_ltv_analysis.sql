-- ============================================
-- CUSTOMER LIFETIME VALUE (LTV) ANALYSIS
-- Predictive Customer Segmentation
-- ============================================
-- Created: 2025-10-07
-- Purpose: Identify high-value customers + retention opportunities
-- Model: RFM (Recency, Frequency, Monetary) Segmentation
-- ============================================

-- ============================================
-- 1. CUSTOMER RFM SEGMENTATION
-- ============================================

CREATE OR REPLACE VIEW `commerce.customer_rfm_analysis` AS
WITH customer_metrics AS (
  SELECT
    customer_id,

    -- Recency: Days since last purchase
    DATE_DIFF(CURRENT_DATE(), MAX(DATE(created_at)), DAY) as days_since_last_purchase,

    -- Frequency: Total number of purchases
    COUNT(DISTINCT id) as total_purchases,

    -- Monetary: Total amount spent
    SUM(amount_money_amount) / 100.0 as total_spent,
    AVG(amount_money_amount) / 100.0 as avg_order_value,

    -- Additional Metrics
    MIN(DATE(created_at)) as first_purchase_date,
    MAX(DATE(created_at)) as last_purchase_date,
    DATE_DIFF(MAX(DATE(created_at)), MIN(DATE(created_at)), DAY) as customer_lifespan_days

  FROM `commerce.square_payments`
  WHERE status = 'COMPLETED'
    AND customer_id IS NOT NULL
  GROUP BY customer_id
),
rfm_scores AS (
  SELECT
    *,

    -- R Score (1-5, lower recency = higher score)
    NTILE(5) OVER (ORDER BY days_since_last_purchase DESC) as recency_score,

    -- F Score (1-5, higher frequency = higher score)
    NTILE(5) OVER (ORDER BY total_purchases ASC) as frequency_score,

    -- M Score (1-5, higher monetary = higher score)
    NTILE(5) OVER (ORDER BY total_spent ASC) as monetary_score

  FROM customer_metrics
)
SELECT
  customer_id,
  days_since_last_purchase,
  total_purchases,
  total_spent,
  avg_order_value,
  first_purchase_date,
  last_purchase_date,
  customer_lifespan_days,

  -- RFM Scores
  recency_score,
  frequency_score,
  monetary_score,
  (recency_score + frequency_score + monetary_score) / 3.0 as rfm_composite_score,

  -- Customer Segment
  CASE
    WHEN recency_score >= 4 AND frequency_score >= 4 AND monetary_score >= 4 THEN 'CHAMPIONS'
    WHEN recency_score >= 3 AND frequency_score >= 3 AND monetary_score >= 4 THEN 'LOYAL_CUSTOMERS'
    WHEN recency_score >= 4 AND frequency_score <= 2 AND monetary_score >= 3 THEN 'BIG_SPENDERS'
    WHEN recency_score >= 4 AND frequency_score <= 2 AND monetary_score <= 2 THEN 'NEW_CUSTOMERS'
    WHEN recency_score >= 3 AND frequency_score >= 2 AND monetary_score >= 2 THEN 'POTENTIAL_LOYALISTS'
    WHEN recency_score <= 2 AND frequency_score >= 3 AND monetary_score >= 3 THEN 'AT_RISK'
    WHEN recency_score <= 2 AND frequency_score <= 2 AND monetary_score >= 3 THEN 'CANT_LOSE_THEM'
    WHEN recency_score <= 2 AND frequency_score <= 2 AND monetary_score <= 2 THEN 'HIBERNATING'
    ELSE 'NEEDS_ATTENTION'
  END as customer_segment,

  -- Lifetime Value Estimate (next 12 months)
  CASE
    WHEN customer_lifespan_days > 0 THEN
      (total_spent / NULLIF(customer_lifespan_days, 0)) * 365
    ELSE
      avg_order_value * 12  -- Assume monthly purchase for new customers
  END as estimated_annual_ltv,

  CURRENT_TIMESTAMP() as last_updated

FROM rfm_scores
ORDER BY rfm_composite_score DESC;

-- ============================================
-- 2. CUSTOMER SEGMENT SUMMARY
-- ============================================

CREATE OR REPLACE VIEW `commerce.customer_segment_summary` AS
SELECT
  customer_segment,

  -- Count & Percentage
  COUNT(DISTINCT customer_id) as customer_count,
  COUNT(DISTINCT customer_id) * 100.0 /
    (SELECT COUNT(DISTINCT customer_id) FROM `commerce.customer_rfm_analysis`) as segment_percentage,

  -- Revenue Metrics
  SUM(total_spent) as segment_revenue,
  AVG(total_spent) as avg_customer_ltv,
  AVG(avg_order_value) as avg_order_value,

  -- Behavioral Metrics
  AVG(total_purchases) as avg_purchases_per_customer,
  AVG(days_since_last_purchase) as avg_days_since_last_purchase,
  AVG(customer_lifespan_days) as avg_customer_lifespan_days,

  -- Predicted Annual Value
  SUM(estimated_annual_ltv) as predicted_annual_revenue,
  AVG(estimated_annual_ltv) as avg_predicted_annual_ltv,

  CURRENT_TIMESTAMP() as last_updated

FROM `commerce.customer_rfm_analysis`
GROUP BY customer_segment
ORDER BY segment_revenue DESC;

-- ============================================
-- 3. CUSTOMER COHORT ANALYSIS
-- ============================================

-- Monthly Cohort Retention
CREATE OR REPLACE VIEW `commerce.customer_cohort_retention` AS
WITH first_purchase AS (
  SELECT
    customer_id,
    FORMAT_TIMESTAMP('%Y-%m', MIN(created_at)) as cohort_month,
    MIN(DATE(created_at)) as first_purchase_date
  FROM `commerce.square_payments`
  WHERE status = 'COMPLETED'
    AND customer_id IS NOT NULL
  GROUP BY customer_id
),
purchase_months AS (
  SELECT
    p.customer_id,
    fp.cohort_month,
    FORMAT_TIMESTAMP('%Y-%m', p.created_at) as purchase_month,
    DATE_DIFF(
      DATE(p.created_at),
      fp.first_purchase_date,
      MONTH
    ) as months_since_first_purchase
  FROM `commerce.square_payments` p
  JOIN first_purchase fp ON p.customer_id = fp.customer_id
  WHERE p.status = 'COMPLETED'
)
SELECT
  cohort_month,
  months_since_first_purchase as cohort_age_months,

  -- Cohort Size
  COUNT(DISTINCT CASE WHEN months_since_first_purchase = 0 THEN customer_id END) as cohort_size,

  -- Active Customers per Month
  COUNT(DISTINCT customer_id) as active_customers,

  -- Retention Rate
  COUNT(DISTINCT customer_id) * 100.0 /
    NULLIF(COUNT(DISTINCT CASE WHEN months_since_first_purchase = 0 THEN customer_id END), 0) as retention_rate_percent,

  CURRENT_TIMESTAMP() as last_updated

FROM purchase_months
WHERE cohort_month >= FORMAT_TIMESTAMP('%Y-%m', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 12 MONTH))
GROUP BY cohort_month, months_since_first_purchase
ORDER BY cohort_month DESC, months_since_first_purchase ASC;

-- ============================================
-- 4. HIGH-VALUE CUSTOMER IDENTIFICATION
-- ============================================

-- Top 20% Customers (Pareto Principle)
CREATE OR REPLACE VIEW `commerce.high_value_customers` AS
WITH customer_revenue AS (
  SELECT
    customer_id,
    SUM(amount_money_amount) / 100.0 as total_revenue,
    COUNT(DISTINCT id) as total_orders,
    AVG(amount_money_amount) / 100.0 as avg_order_value,
    MAX(created_at) as last_purchase_date,
    MIN(created_at) as first_purchase_date
  FROM `commerce.square_payments`
  WHERE status = 'COMPLETED'
    AND customer_id IS NOT NULL
  GROUP BY customer_id
),
revenue_ranking AS (
  SELECT
    *,
    PERCENT_RANK() OVER (ORDER BY total_revenue DESC) as revenue_percentile,
    SUM(total_revenue) OVER () as total_business_revenue
  FROM customer_revenue
)
SELECT
  customer_id,
  total_revenue,
  total_orders,
  avg_order_value,
  last_purchase_date,
  first_purchase_date,

  -- Revenue Contribution
  total_revenue / total_business_revenue * 100 as revenue_contribution_percent,
  revenue_percentile * 100 as revenue_percentile_rank,

  -- Classification
  CASE
    WHEN revenue_percentile <= 0.20 THEN 'TOP_20_PERCENT'
    WHEN revenue_percentile <= 0.50 THEN 'TOP_50_PERCENT'
    ELSE 'REMAINING_50_PERCENT'
  END as value_tier,

  -- Engagement Score
  CASE
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) <= 30 THEN 'HIGHLY_ENGAGED'
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) <= 90 THEN 'MODERATELY_ENGAGED'
    ELSE 'LOW_ENGAGEMENT'
  END as engagement_status,

  CURRENT_TIMESTAMP() as last_updated

FROM revenue_ranking
WHERE revenue_percentile <= 0.20  -- Top 20%
ORDER BY total_revenue DESC;

-- ============================================
-- 5. CUSTOMER CHURN PREDICTION
-- ============================================

-- At-Risk Customer Detection
CREATE OR REPLACE VIEW `commerce.at_risk_customers` AS
WITH customer_behavior AS (
  SELECT
    customer_id,
    MAX(created_at) as last_purchase_date,
    COUNT(DISTINCT id) as total_purchases,
    SUM(amount_money_amount) / 100.0 as total_spent,
    AVG(amount_money_amount) / 100.0 as avg_order_value,

    -- Calculate average days between purchases
    DATE_DIFF(MAX(DATE(created_at)), MIN(DATE(created_at)), DAY) /
      NULLIF(COUNT(DISTINCT id) - 1, 0) as avg_days_between_purchases

  FROM `commerce.square_payments`
  WHERE status = 'COMPLETED'
    AND customer_id IS NOT NULL
  GROUP BY customer_id
)
SELECT
  customer_id,
  last_purchase_date,
  total_purchases,
  total_spent,
  avg_order_value,
  avg_days_between_purchases,

  -- Days since last purchase
  DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) as days_since_last_purchase,

  -- Churn Risk Score (0-100, higher = more risk)
  CASE
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) >
         (avg_days_between_purchases * 2) THEN 90  -- Critical
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) >
         (avg_days_between_purchases * 1.5) THEN 70  -- High
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) >
         avg_days_between_purchases THEN 40  -- Medium
    ELSE 10  -- Low risk
  END as churn_risk_score,

  -- Risk Category
  CASE
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) >
         (avg_days_between_purchases * 2) THEN 'CRITICAL_RISK'
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) >
         (avg_days_between_purchases * 1.5) THEN 'HIGH_RISK'
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) >
         avg_days_between_purchases THEN 'MEDIUM_RISK'
    ELSE 'LOW_RISK'
  END as risk_category,

  -- Recommended Action
  CASE
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) >
         (avg_days_between_purchases * 2) THEN 'URGENT_OUTREACH_REQUIRED'
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) >
         (avg_days_between_purchases * 1.5) THEN 'SEND_WIN_BACK_CAMPAIGN'
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) >
         avg_days_between_purchases THEN 'SEND_RE_ENGAGEMENT_EMAIL'
    ELSE 'MAINTAIN_REGULAR_COMMUNICATION'
  END as recommended_action,

  CURRENT_TIMESTAMP() as last_updated

FROM customer_behavior
WHERE total_purchases >= 2  -- Only customers with repeat purchase history
  AND DATE_DIFF(CURRENT_DATE(), DATE(last_purchase_date), DAY) > avg_days_between_purchases
ORDER BY churn_risk_score DESC, total_spent DESC;

-- ============================================
-- 6. CUSTOMER ACQUISITION COST (CAC) TRACKING
-- ============================================

-- Monthly CAC vs LTV Analysis
CREATE OR REPLACE VIEW `commerce.cac_ltv_analysis` AS
WITH monthly_customers AS (
  SELECT
    FORMAT_TIMESTAMP('%Y-%m', MIN(created_at)) as acquisition_month,
    COUNT(DISTINCT customer_id) as new_customers_acquired
  FROM `commerce.square_payments`
  WHERE status = 'COMPLETED'
    AND customer_id IS NOT NULL
  GROUP BY acquisition_month
),
customer_ltv AS (
  SELECT
    FORMAT_TIMESTAMP('%Y-%m', MIN(p.created_at)) as acquisition_month,
    p.customer_id,
    SUM(p.amount_money_amount) / 100.0 as customer_lifetime_value
  FROM `commerce.square_payments` p
  WHERE p.status = 'COMPLETED'
    AND p.customer_id IS NOT NULL
  GROUP BY acquisition_month, p.customer_id
)
SELECT
  mc.acquisition_month,
  mc.new_customers_acquired,

  -- LTV Metrics
  AVG(ltv.customer_lifetime_value) as avg_customer_ltv,
  SUM(ltv.customer_lifetime_value) as total_cohort_ltv,

  -- CAC Estimation (placeholder - integrate with marketing spend data)
  50.0 as estimated_cac_per_customer,  -- TODO: Pull from marketing_spend table

  -- LTV:CAC Ratio (healthy ratio = 3:1 or higher)
  AVG(ltv.customer_lifetime_value) / 50.0 as ltv_to_cac_ratio,

  -- Payback Period (months to recover CAC)
  50.0 / NULLIF((AVG(ltv.customer_lifetime_value) / 12.0), 0) as payback_period_months,

  CURRENT_TIMESTAMP() as last_updated

FROM monthly_customers mc
JOIN customer_ltv ltv ON mc.acquisition_month = ltv.acquisition_month
WHERE mc.acquisition_month >= FORMAT_TIMESTAMP('%Y-%m', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 12 MONTH))
GROUP BY mc.acquisition_month, mc.new_customers_acquired
ORDER BY mc.acquisition_month DESC;

-- ============================================
-- 7. CUSTOMER LIFETIME VALUE LEADERBOARD
-- ============================================

-- Top 100 Customers by Lifetime Value
CREATE OR REPLACE VIEW `commerce.ltv_leaderboard` AS
SELECT
  customer_id,

  -- Revenue Metrics
  SUM(amount_money_amount) / 100.0 as lifetime_value,
  COUNT(DISTINCT id) as total_orders,
  AVG(amount_money_amount) / 100.0 as avg_order_value,

  -- Temporal Metrics
  MIN(DATE(created_at)) as first_purchase_date,
  MAX(DATE(created_at)) as last_purchase_date,
  DATE_DIFF(MAX(DATE(created_at)), MIN(DATE(created_at)), DAY) as customer_age_days,

  -- Engagement
  DATE_DIFF(CURRENT_DATE(), MAX(DATE(created_at)), DAY) as days_since_last_purchase,

  -- Revenue per Day (velocity)
  SUM(amount_money_amount) / 100.0 /
    NULLIF(DATE_DIFF(MAX(DATE(created_at)), MIN(DATE(created_at)), DAY), 0) as revenue_per_day,

  -- Ranking
  RANK() OVER (ORDER BY SUM(amount_money_amount) DESC) as ltv_rank,

  CURRENT_TIMESTAMP() as last_updated

FROM `commerce.square_payments`
WHERE status = 'COMPLETED'
  AND customer_id IS NOT NULL
GROUP BY customer_id
ORDER BY lifetime_value DESC
LIMIT 100;

-- Optimized: 2025-10-07
-- Last updated: 2025-10-07
