-- ============================================
-- REVENUE ANALYTICS QUERIES
-- $100K Path Validation Dashboard
-- ============================================
-- Created: 2025-10-07
-- Target: Real-time revenue tracking (80K → 100K/month)
-- Latency: <60s data refresh
-- ============================================

-- ============================================
-- 1. REAL-TIME REVENUE DASHBOARD
-- ============================================

-- Daily Revenue Summary (Last 90 Days)
CREATE OR REPLACE VIEW `commerce.daily_revenue_summary` AS
SELECT
  DATE(created_at) as revenue_date,

  -- Total Revenue
  COUNT(DISTINCT id) as total_transactions,
  SUM(amount_money_amount) / 100.0 as gross_revenue_usd,
  AVG(amount_money_amount) / 100.0 as avg_transaction_value,

  -- Revenue by Status
  SUM(CASE WHEN status = 'COMPLETED' THEN amount_money_amount ELSE 0 END) / 100.0 as completed_revenue,
  SUM(CASE WHEN status = 'FAILED' THEN amount_money_amount ELSE 0 END) / 100.0 as failed_revenue,

  -- Customer Metrics
  COUNT(DISTINCT customer_id) as unique_customers,
  COUNT(DISTINCT CASE WHEN status = 'COMPLETED' THEN customer_id END) as paying_customers,

  -- Payment Methods
  COUNT(DISTINCT CASE WHEN card_brand = 'VISA' THEN id END) as visa_transactions,
  COUNT(DISTINCT CASE WHEN card_brand = 'MASTERCARD' THEN id END) as mastercard_transactions,
  COUNT(DISTINCT CASE WHEN card_brand = 'AMERICAN_EXPRESS' THEN id END) as amex_transactions,

  -- Hourly Peak Detection
  EXTRACT(HOUR FROM created_at) as peak_hour,

  -- Timestamp
  CURRENT_TIMESTAMP() as last_updated

FROM `commerce.square_payments`
WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
  AND created_at <= CURRENT_TIMESTAMP()
GROUP BY revenue_date, peak_hour
ORDER BY revenue_date DESC;

-- Monthly Revenue Trend (Current vs Target)
CREATE OR REPLACE VIEW `commerce.monthly_revenue_trend` AS
WITH monthly_data AS (
  SELECT
    FORMAT_TIMESTAMP('%Y-%m', created_at) as month,
    SUM(amount_money_amount) / 100.0 as monthly_revenue,
    COUNT(DISTINCT id) as transaction_count,
    COUNT(DISTINCT customer_id) as unique_customers,
    AVG(amount_money_amount) / 100.0 as avg_transaction_value
  FROM `commerce.square_payments`
  WHERE status = 'COMPLETED'
    AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 12 MONTH)
  GROUP BY month
)
SELECT
  month,
  monthly_revenue,
  transaction_count,
  unique_customers,
  avg_transaction_value,

  -- Growth Metrics
  LAG(monthly_revenue) OVER (ORDER BY month) as prev_month_revenue,
  (monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY month)) /
    NULLIF(LAG(monthly_revenue) OVER (ORDER BY month), 0) * 100 as growth_rate_percent,

  -- Target Tracking
  100000.0 as target_monthly_revenue,
  (monthly_revenue / 100000.0) * 100 as target_achievement_percent,
  100000.0 - monthly_revenue as gap_to_target,

  -- Projection
  ROUND(monthly_revenue *
    (1 + ((monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY month)) /
    NULLIF(LAG(monthly_revenue) OVER (ORDER BY month), 0))), 2) as projected_next_month

FROM monthly_data
ORDER BY month DESC;

-- Real-Time Revenue Counter (Today)
CREATE OR REPLACE VIEW `commerce.realtime_revenue_today` AS
SELECT
  DATE(CURRENT_TIMESTAMP()) as today,

  -- Current Revenue
  SUM(amount_money_amount) / 100.0 as revenue_today,
  COUNT(DISTINCT id) as transactions_today,
  COUNT(DISTINCT customer_id) as customers_today,
  AVG(amount_money_amount) / 100.0 as avg_transaction_today,

  -- Hourly Rate
  SUM(amount_money_amount) / 100.0 /
    NULLIF(EXTRACT(HOUR FROM CURRENT_TIMESTAMP()), 0) as revenue_per_hour,

  -- Projected End of Day
  (SUM(amount_money_amount) / 100.0 /
    NULLIF(EXTRACT(HOUR FROM CURRENT_TIMESTAMP()), 0)) * 24 as projected_daily_revenue,

  -- Yesterday Comparison
  (SELECT SUM(amount_money_amount) / 100.0
   FROM `commerce.square_payments`
   WHERE DATE(created_at) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
     AND status = 'COMPLETED') as revenue_yesterday,

  -- Growth vs Yesterday
  ((SUM(amount_money_amount) / 100.0) -
   (SELECT SUM(amount_money_amount) / 100.0
    FROM `commerce.square_payments`
    WHERE DATE(created_at) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
      AND status = 'COMPLETED')) /
   NULLIF((SELECT SUM(amount_money_amount) / 100.0
    FROM `commerce.square_payments`
    WHERE DATE(created_at) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
      AND status = 'COMPLETED'), 0) * 100 as growth_vs_yesterday_percent,

  CURRENT_TIMESTAMP() as last_updated

FROM `commerce.square_payments`
WHERE DATE(created_at) = CURRENT_DATE()
  AND status = 'COMPLETED';

-- ============================================
-- 2. PRODUCT PERFORMANCE RANKING
-- ============================================

CREATE OR REPLACE VIEW `commerce.product_performance_ranking` AS
WITH product_sales AS (
  SELECT
    i.id as product_id,
    i.name as product_name,
    i.category as product_category,
    i.sku as product_sku,

    -- Sales Metrics (Last 30 Days)
    COUNT(DISTINCT p.id) as total_orders,
    SUM(p.amount_money_amount) / 100.0 as total_revenue,
    AVG(p.amount_money_amount) / 100.0 as avg_order_value,

    -- Customer Metrics
    COUNT(DISTINCT p.customer_id) as unique_buyers,
    COUNT(DISTINCT p.customer_id) / NULLIF(COUNT(DISTINCT p.id), 0) as repeat_purchase_rate,

    -- Profitability (if cost data available)
    i.price / 100.0 as unit_price,

    CURRENT_TIMESTAMP() as last_updated

  FROM `commerce.square_items` i
  LEFT JOIN `commerce.square_payments` p
    ON CAST(i.id AS STRING) = CAST(p.id AS STRING)
    AND p.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
    AND p.status = 'COMPLETED'

  WHERE i.available = true
  GROUP BY i.id, i.name, i.category, i.sku, i.price
)
SELECT
  *,

  -- Performance Ranking
  RANK() OVER (ORDER BY total_revenue DESC) as revenue_rank,
  RANK() OVER (ORDER BY total_orders DESC) as popularity_rank,
  RANK() OVER (ORDER BY avg_order_value DESC) as aov_rank,

  -- Performance Score (weighted)
  (RANK() OVER (ORDER BY total_revenue DESC) * 0.5 +
   RANK() OVER (ORDER BY total_orders DESC) * 0.3 +
   RANK() OVER (ORDER BY unique_buyers DESC) * 0.2) as performance_score

FROM product_sales
ORDER BY performance_score ASC
LIMIT 100;

-- Top 20 Best Sellers (Last 7 Days)
CREATE OR REPLACE VIEW `commerce.top_sellers_weekly` AS
SELECT
  i.name as product_name,
  i.category as category,
  COUNT(DISTINCT p.id) as orders_count,
  SUM(p.amount_money_amount) / 100.0 as total_revenue,
  AVG(p.amount_money_amount) / 100.0 as avg_price,
  COUNT(DISTINCT p.customer_id) as unique_customers,

  -- Velocity
  COUNT(DISTINCT p.id) / 7.0 as avg_daily_orders,
  SUM(p.amount_money_amount) / 100.0 / 7.0 as avg_daily_revenue,

  CURRENT_TIMESTAMP() as last_updated

FROM `commerce.square_items` i
JOIN `commerce.square_payments` p
  ON CAST(i.id AS STRING) = CAST(p.id AS STRING)
WHERE p.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND p.status = 'COMPLETED'
  AND i.available = true
GROUP BY i.name, i.category
ORDER BY total_revenue DESC
LIMIT 20;

-- ============================================
-- 3. DELIVERY COST SAVINGS TRACKER
-- ============================================

-- Lightspeed Delivery Analytics
CREATE OR REPLACE VIEW `commerce.delivery_cost_analysis` AS
WITH delivery_orders AS (
  SELECT
    order_id,
    customer_id,
    total as order_value,
    created_at,

    -- Extract delivery cost from JSON if available
    JSON_EXTRACT_SCALAR(raw_json, '$.delivery_cost') as delivery_cost,
    JSON_EXTRACT_SCALAR(raw_json, '$.delivery_provider') as delivery_provider,
    JSON_EXTRACT_SCALAR(raw_json, '$.delivery_zone') as delivery_zone

  FROM `commerce.lightspeed_orders`
  WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
)
SELECT
  DATE(created_at) as delivery_date,

  -- Volume
  COUNT(DISTINCT order_id) as total_deliveries,

  -- Cost Metrics
  AVG(CAST(delivery_cost AS FLOAT64)) as avg_delivery_cost,
  SUM(CAST(delivery_cost AS FLOAT64)) as total_delivery_costs,

  -- Efficiency
  AVG(order_value) as avg_order_value,
  AVG(CAST(delivery_cost AS FLOAT64) / NULLIF(order_value, 0)) * 100 as delivery_cost_percent_of_order,

  -- Provider Performance
  delivery_provider,
  COUNT(DISTINCT delivery_zone) as zones_covered,

  -- Savings (Nash beating strategy)
  SUM(CAST(delivery_cost AS FLOAT64)) * 0.15 as estimated_savings_15_percent,

  CURRENT_TIMESTAMP() as last_updated

FROM delivery_orders
WHERE delivery_cost IS NOT NULL
GROUP BY delivery_date, delivery_provider
ORDER BY delivery_date DESC;

-- ============================================
-- 4. CONTENT ENGAGEMENT CORRELATION
-- ============================================

-- YouTube Viral Pattern Impact on Sales
CREATE OR REPLACE VIEW `commerce.content_sales_correlation` AS
WITH daily_content AS (
  SELECT
    DATE(analyzed_at) as content_date,
    COUNT(DISTINCT video_id) as videos_analyzed,
    AVG(engagement_rate) as avg_engagement_rate,
    AVG(view_count) as avg_views
  FROM `commerce.youtube_viral_patterns`
  WHERE analyzed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
  GROUP BY content_date
),
daily_sales AS (
  SELECT
    DATE(created_at) as sales_date,
    SUM(amount_money_amount) / 100.0 as daily_revenue,
    COUNT(DISTINCT id) as daily_transactions,
    COUNT(DISTINCT customer_id) as daily_customers
  FROM `commerce.square_payments`
  WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
    AND status = 'COMPLETED'
  GROUP BY sales_date
)
SELECT
  c.content_date,
  c.videos_analyzed,
  c.avg_engagement_rate,
  c.avg_views,

  -- Sales Metrics (same day + next 3 days)
  s.daily_revenue as same_day_revenue,
  s.daily_transactions as same_day_transactions,

  -- 3-day forward revenue (content impact)
  (SELECT SUM(amount_money_amount) / 100.0
   FROM `commerce.square_payments`
   WHERE DATE(created_at) BETWEEN c.content_date AND DATE_ADD(c.content_date, INTERVAL 3 DAY)
     AND status = 'COMPLETED') as revenue_3day_forward,

  -- Correlation Score (simplified)
  CASE
    WHEN c.avg_engagement_rate > 5.0 AND s.daily_revenue > 2500 THEN 'HIGH_IMPACT'
    WHEN c.avg_engagement_rate > 3.0 AND s.daily_revenue > 2000 THEN 'MEDIUM_IMPACT'
    ELSE 'LOW_IMPACT'
  END as impact_category,

  CURRENT_TIMESTAMP() as last_updated

FROM daily_content c
LEFT JOIN daily_sales s ON c.content_date = s.sales_date
ORDER BY c.content_date DESC;

-- Cannabis News Buzz Index
CREATE OR REPLACE VIEW `commerce.news_buzz_index` AS
SELECT
  DATE(published_at) as news_date,

  -- News Volume
  COUNT(DISTINCT url) as articles_published,

  -- Category Distribution
  SUM(CASE WHEN category = 'legalization' THEN 1 ELSE 0 END) as legalization_news,
  SUM(CASE WHEN category = 'business' THEN 1 ELSE 0 END) as business_news,
  SUM(CASE WHEN category = 'medical' THEN 1 ELSE 0 END) as medical_news,

  -- Engagement Potential
  AVG(JSON_EXTRACT_SCALAR(properties, '$.engagementScore')) as avg_engagement_score,

  -- Sales Correlation (next day revenue bump)
  (SELECT SUM(amount_money_amount) / 100.0
   FROM `commerce.square_payments`
   WHERE DATE(created_at) = DATE_ADD(DATE(cn.published_at), INTERVAL 1 DAY)
     AND status = 'COMPLETED') as next_day_revenue,

  CURRENT_TIMESTAMP() as last_updated

FROM `commerce.cannabis_news_feed` cn
WHERE published_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
GROUP BY news_date
ORDER BY news_date DESC;

-- ============================================
-- 5. $100K PATH VISUALIZATION DATA
-- ============================================

CREATE OR REPLACE VIEW `commerce.revenue_path_to_100k` AS
WITH current_performance AS (
  SELECT
    FORMAT_TIMESTAMP('%Y-%m', created_at) as month,
    SUM(amount_money_amount) / 100.0 as actual_revenue,
    COUNT(DISTINCT customer_id) as customers,
    AVG(amount_money_amount) / 100.0 as avg_transaction
  FROM `commerce.square_payments`
  WHERE status = 'COMPLETED'
    AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 6 MONTH)
  GROUP BY month
),
growth_calculation AS (
  SELECT
    AVG((actual_revenue - LAG(actual_revenue) OVER (ORDER BY month)) /
        NULLIF(LAG(actual_revenue) OVER (ORDER BY month), 0)) as avg_growth_rate
  FROM current_performance
)
SELECT
  cp.month,
  cp.actual_revenue,
  cp.customers,
  cp.avg_transaction,

  -- Target Metrics
  100000.0 as monthly_target,
  cp.actual_revenue / 100000.0 * 100 as target_achievement_percent,

  -- Gap Analysis
  100000.0 - cp.actual_revenue as revenue_gap,
  (100000.0 - cp.actual_revenue) / NULLIF(cp.avg_transaction, 0) as transactions_needed,
  (100000.0 - cp.actual_revenue) / NULLIF(cp.customers, 0) as revenue_per_customer_needed,

  -- Projection
  ROUND(cp.actual_revenue * (1 + gc.avg_growth_rate), 2) as projected_next_month,
  ROUND(100000.0 / NULLIF((cp.actual_revenue * (1 + gc.avg_growth_rate)), 0), 1) as months_to_target,

  CURRENT_TIMESTAMP() as last_updated

FROM current_performance cp
CROSS JOIN growth_calculation gc
ORDER BY cp.month DESC;

-- Key Metrics Summary for Dashboard
CREATE OR REPLACE VIEW `commerce.dashboard_metrics_summary` AS
SELECT
  -- Current Month
  (SELECT SUM(amount_money_amount) / 100.0
   FROM `commerce.square_payments`
   WHERE FORMAT_TIMESTAMP('%Y-%m', created_at) = FORMAT_TIMESTAMP('%Y-%m', CURRENT_TIMESTAMP())
     AND status = 'COMPLETED') as current_month_revenue,

  -- Previous Month
  (SELECT SUM(amount_money_amount) / 100.0
   FROM `commerce.square_payments`
   WHERE FORMAT_TIMESTAMP('%Y-%m', created_at) = FORMAT_TIMESTAMP('%Y-%m', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 MONTH))
     AND status = 'COMPLETED') as previous_month_revenue,

  -- Today
  (SELECT SUM(amount_money_amount) / 100.0
   FROM `commerce.square_payments`
   WHERE DATE(created_at) = CURRENT_DATE()
     AND status = 'COMPLETED') as today_revenue,

  -- Yesterday
  (SELECT SUM(amount_money_amount) / 100.0
   FROM `commerce.square_payments`
   WHERE DATE(created_at) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
     AND status = 'COMPLETED') as yesterday_revenue,

  -- Customer Counts
  (SELECT COUNT(DISTINCT customer_id)
   FROM `commerce.square_payments`
   WHERE FORMAT_TIMESTAMP('%Y-%m', created_at) = FORMAT_TIMESTAMP('%Y-%m', CURRENT_TIMESTAMP())
     AND status = 'COMPLETED') as current_month_customers,

  -- Target Achievement
  ((SELECT SUM(amount_money_amount) / 100.0
    FROM `commerce.square_payments`
    WHERE FORMAT_TIMESTAMP('%Y-%m', created_at) = FORMAT_TIMESTAMP('%Y-%m', CURRENT_TIMESTAMP())
      AND status = 'COMPLETED') / 100000.0 * 100) as target_achievement_percent,

  CURRENT_TIMESTAMP() as last_updated;

-- Optimized: 2025-10-07
-- Last updated: 2025-10-07
