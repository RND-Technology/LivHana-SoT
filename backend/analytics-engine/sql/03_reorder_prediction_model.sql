-- ============================================
-- RE-ORDER PREDICTION MODEL
-- ML-Based Customer Purchase Forecasting
-- ============================================
-- Created: 2025-10-07
-- Purpose: Predict next purchase date + recommend products
-- Methodology: Time-series analysis + product affinity
-- ============================================

-- ============================================
-- 1. PURCHASE FREQUENCY PATTERNS
-- ============================================

CREATE OR REPLACE VIEW `commerce.customer_purchase_patterns` AS
WITH customer_orders AS (
  SELECT
    customer_id,
    DATE(created_at) as purchase_date,
    id as order_id,
    amount_money_amount / 100.0 as order_value,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at) as order_sequence
  FROM `commerce.square_payments`
  WHERE status = 'COMPLETED'
    AND customer_id IS NOT NULL
),
order_intervals AS (
  SELECT
    customer_id,
    purchase_date,
    order_id,
    order_value,
    order_sequence,

    -- Days since previous order
    DATE_DIFF(
      purchase_date,
      LAG(purchase_date) OVER (PARTITION BY customer_id ORDER BY purchase_date),
      DAY
    ) as days_since_last_order,

    -- Next order date (for validation)
    LEAD(purchase_date) OVER (PARTITION BY customer_id ORDER BY purchase_date) as next_order_date,

    DATE_DIFF(
      LEAD(purchase_date) OVER (PARTITION BY customer_id ORDER BY purchase_date),
      purchase_date,
      DAY
    ) as days_until_next_order

  FROM customer_orders
)
SELECT
  customer_id,

  -- Purchase History
  COUNT(DISTINCT order_id) as total_orders,
  MIN(purchase_date) as first_order_date,
  MAX(purchase_date) as last_order_date,

  -- Frequency Metrics
  AVG(days_since_last_order) as avg_days_between_orders,
  STDDEV(days_since_last_order) as stddev_days_between_orders,
  MIN(days_since_last_order) as min_days_between_orders,
  MAX(days_since_last_order) as max_days_between_orders,

  -- Purchase Regularity Score (0-100, higher = more regular)
  CASE
    WHEN STDDEV(days_since_last_order) IS NULL THEN 0
    WHEN STDDEV(days_since_last_order) = 0 THEN 100  -- Perfectly regular
    ELSE GREATEST(0, 100 - (STDDEV(days_since_last_order) / NULLIF(AVG(days_since_last_order), 0) * 100))
  END as regularity_score,

  -- Value Metrics
  AVG(order_value) as avg_order_value,
  SUM(order_value) as total_lifetime_value,

  CURRENT_TIMESTAMP() as last_updated

FROM order_intervals
WHERE days_since_last_order IS NOT NULL  -- Exclude first order (no interval)
GROUP BY customer_id
HAVING COUNT(DISTINCT order_id) >= 2;  -- At least 2 orders to establish pattern

-- ============================================
-- 2. NEXT PURCHASE PREDICTION
-- ============================================

CREATE OR REPLACE VIEW `commerce.next_purchase_predictions` AS
WITH customer_patterns AS (
  SELECT
    customer_id,
    total_orders,
    last_order_date,
    avg_days_between_orders,
    stddev_days_between_orders,
    regularity_score,
    avg_order_value,
    total_lifetime_value
  FROM `commerce.customer_purchase_patterns`
),
predictions AS (
  SELECT
    customer_id,
    total_orders,
    last_order_date,
    avg_days_between_orders,
    regularity_score,
    avg_order_value,

    -- Predicted Next Purchase Date
    DATE_ADD(
      last_order_date,
      INTERVAL CAST(avg_days_between_orders AS INT64) DAY
    ) as predicted_next_purchase_date,

    -- Confidence Level
    CASE
      WHEN regularity_score >= 80 THEN 'HIGH_CONFIDENCE'
      WHEN regularity_score >= 60 THEN 'MEDIUM_CONFIDENCE'
      WHEN regularity_score >= 40 THEN 'LOW_CONFIDENCE'
      ELSE 'UNPREDICTABLE'
    END as prediction_confidence,

    -- Days until predicted purchase
    DATE_DIFF(
      DATE_ADD(last_order_date, INTERVAL CAST(avg_days_between_orders AS INT64) DAY),
      CURRENT_DATE(),
      DAY
    ) as days_until_predicted_purchase,

    -- Purchase Window (±1 standard deviation)
    DATE_ADD(
      last_order_date,
      INTERVAL CAST(avg_days_between_orders - COALESCE(stddev_days_between_orders, 0) AS INT64) DAY
    ) as purchase_window_start,
    DATE_ADD(
      last_order_date,
      INTERVAL CAST(avg_days_between_orders + COALESCE(stddev_days_between_orders, 0) AS INT64) DAY
    ) as purchase_window_end,

    -- Predicted Order Value
    avg_order_value as predicted_order_value,

    CURRENT_TIMESTAMP() as last_updated

  FROM customer_patterns
)
SELECT
  *,

  -- Action Recommendations
  CASE
    WHEN days_until_predicted_purchase BETWEEN -7 AND 7 THEN 'SEND_REMINDER_NOW'
    WHEN days_until_predicted_purchase BETWEEN 8 AND 14 THEN 'SCHEDULE_REMINDER'
    WHEN days_until_predicted_purchase < -7 THEN 'CUSTOMER_OVERDUE'
    ELSE 'MONITOR'
  END as recommended_action,

  -- Urgency Score (0-100)
  CASE
    WHEN days_until_predicted_purchase <= 0 THEN 100  -- Overdue
    WHEN days_until_predicted_purchase BETWEEN 1 AND 3 THEN 90
    WHEN days_until_predicted_purchase BETWEEN 4 AND 7 THEN 70
    WHEN days_until_predicted_purchase BETWEEN 8 AND 14 THEN 50
    ELSE 20
  END as urgency_score

FROM predictions
ORDER BY urgency_score DESC, predicted_order_value DESC;

-- ============================================
-- 3. PRODUCT AFFINITY ANALYSIS
-- ============================================

-- Products Frequently Bought Together
CREATE OR REPLACE VIEW `commerce.product_affinity_pairs` AS
WITH order_products AS (
  SELECT
    p.id as order_id,
    p.customer_id,
    i.id as product_id,
    i.name as product_name,
    i.category as product_category
  FROM `commerce.square_payments` p
  JOIN `commerce.square_items` i
    ON CAST(p.id AS STRING) = CAST(i.id AS STRING)
  WHERE p.status = 'COMPLETED'
),
product_pairs AS (
  SELECT
    op1.product_id as product_a_id,
    op1.product_name as product_a_name,
    op2.product_id as product_b_id,
    op2.product_name as product_b_name,
    COUNT(DISTINCT op1.order_id) as co_purchase_count
  FROM order_products op1
  JOIN order_products op2
    ON op1.order_id = op2.order_id
    AND op1.product_id < op2.product_id  -- Avoid duplicates
  GROUP BY op1.product_id, op1.product_name, op2.product_id, op2.product_name
  HAVING co_purchase_count >= 5  -- Minimum 5 co-purchases
)
SELECT
  product_a_id,
  product_a_name,
  product_b_id,
  product_b_name,
  co_purchase_count,

  -- Affinity Score (0-100)
  (co_purchase_count * 100.0) /
    (SELECT MAX(co_purchase_count) FROM product_pairs) as affinity_score,

  CURRENT_TIMESTAMP() as last_updated

FROM product_pairs
ORDER BY co_purchase_count DESC
LIMIT 500;

-- ============================================
-- 4. PERSONALIZED PRODUCT RECOMMENDATIONS
-- ============================================

CREATE OR REPLACE VIEW `commerce.customer_product_recommendations` AS
WITH customer_last_products AS (
  SELECT
    p.customer_id,
    i.id as last_product_id,
    i.name as last_product_name,
    i.category as last_product_category,
    ROW_NUMBER() OVER (PARTITION BY p.customer_id ORDER BY p.created_at DESC) as recency_rank
  FROM `commerce.square_payments` p
  JOIN `commerce.square_items` i
    ON CAST(p.id AS STRING) = CAST(i.id AS STRING)
  WHERE p.status = 'COMPLETED'
    AND p.customer_id IS NOT NULL
),
customer_purchase_history AS (
  SELECT
    customer_id,
    last_product_id,
    last_product_name,
    last_product_category
  FROM customer_last_products
  WHERE recency_rank = 1  -- Most recent purchase
),
recommendations AS (
  SELECT
    cph.customer_id,
    cph.last_product_name as last_purchased_product,

    -- Recommended products (based on affinity)
    pa.product_b_id as recommended_product_id,
    pa.product_b_name as recommended_product_name,
    pa.affinity_score as recommendation_score,

    RANK() OVER (PARTITION BY cph.customer_id ORDER BY pa.affinity_score DESC) as recommendation_rank

  FROM customer_purchase_history cph
  JOIN `commerce.product_affinity_pairs` pa
    ON CAST(cph.last_product_id AS STRING) = CAST(pa.product_a_id AS STRING)
)
SELECT
  customer_id,
  last_purchased_product,
  recommended_product_id,
  recommended_product_name,
  recommendation_score,
  recommendation_rank,

  CURRENT_TIMESTAMP() as last_updated

FROM recommendations
WHERE recommendation_rank <= 5  -- Top 5 recommendations per customer
ORDER BY customer_id, recommendation_rank;

-- ============================================
-- 5. RE-ORDER TRIGGER DETECTION
-- ============================================

-- Customers Due for Re-order (Next 7 Days)
CREATE OR REPLACE VIEW `commerce.reorder_triggers_upcoming` AS
SELECT
  npp.customer_id,
  npp.last_order_date,
  npp.predicted_next_purchase_date,
  npp.days_until_predicted_purchase,
  npp.prediction_confidence,
  npp.predicted_order_value,
  npp.recommended_action,
  npp.urgency_score,

  -- Customer Contact Info (join with customer table if available)
  -- TODO: Join with customer_details table for email/phone

  -- Recommended Products
  ARRAY_AGG(
    STRUCT(
      cpr.recommended_product_name,
      cpr.recommendation_score
    )
    ORDER BY cpr.recommendation_rank
    LIMIT 3
  ) as recommended_products,

  CURRENT_TIMESTAMP() as last_updated

FROM `commerce.next_purchase_predictions` npp
LEFT JOIN `commerce.customer_product_recommendations` cpr
  ON npp.customer_id = cpr.customer_id
WHERE npp.days_until_predicted_purchase BETWEEN -7 AND 7  -- Purchase window
  AND npp.prediction_confidence != 'UNPREDICTABLE'
GROUP BY
  npp.customer_id,
  npp.last_order_date,
  npp.predicted_next_purchase_date,
  npp.days_until_predicted_purchase,
  npp.prediction_confidence,
  npp.predicted_order_value,
  npp.recommended_action,
  npp.urgency_score
ORDER BY npp.urgency_score DESC, npp.predicted_order_value DESC;

-- ============================================
-- 6. RE-ORDER CAMPAIGN PERFORMANCE
-- ============================================

-- Track Re-order Campaign Effectiveness
CREATE OR REPLACE VIEW `commerce.reorder_campaign_analysis` AS
WITH predicted_purchases AS (
  SELECT
    customer_id,
    predicted_next_purchase_date,
    days_until_predicted_purchase,
    predicted_order_value
  FROM `commerce.next_purchase_predictions`
  WHERE predicted_next_purchase_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
),
actual_purchases AS (
  SELECT
    customer_id,
    DATE(created_at) as actual_purchase_date,
    amount_money_amount / 100.0 as actual_order_value
  FROM `commerce.square_payments`
  WHERE status = 'COMPLETED'
    AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
)
SELECT
  pp.customer_id,
  pp.predicted_next_purchase_date,
  ap.actual_purchase_date,

  -- Prediction Accuracy
  DATE_DIFF(ap.actual_purchase_date, pp.predicted_next_purchase_date, DAY) as prediction_error_days,
  ABS(DATE_DIFF(ap.actual_purchase_date, pp.predicted_next_purchase_date, DAY)) as prediction_accuracy_days,

  -- Accuracy Category
  CASE
    WHEN ABS(DATE_DIFF(ap.actual_purchase_date, pp.predicted_next_purchase_date, DAY)) <= 3 THEN 'ACCURATE'
    WHEN ABS(DATE_DIFF(ap.actual_purchase_date, pp.predicted_next_purchase_date, DAY)) <= 7 THEN 'CLOSE'
    WHEN ABS(DATE_DIFF(ap.actual_purchase_date, pp.predicted_next_purchase_date, DAY)) <= 14 THEN 'MODERATE'
    ELSE 'INACCURATE'
  END as prediction_accuracy_category,

  -- Value Prediction
  pp.predicted_order_value,
  ap.actual_order_value,
  ap.actual_order_value - pp.predicted_order_value as value_prediction_error,

  CURRENT_TIMESTAMP() as last_updated

FROM predicted_purchases pp
LEFT JOIN actual_purchases ap
  ON pp.customer_id = ap.customer_id
  AND ap.actual_purchase_date BETWEEN
    DATE_SUB(pp.predicted_next_purchase_date, INTERVAL 14 DAY) AND
    DATE_ADD(pp.predicted_next_purchase_date, INTERVAL 14 DAY)
WHERE ap.actual_purchase_date IS NOT NULL  -- Only customers who actually purchased
ORDER BY pp.predicted_next_purchase_date DESC;

-- Model Performance Summary
CREATE OR REPLACE VIEW `commerce.reorder_model_performance` AS
SELECT
  prediction_accuracy_category,

  -- Volume
  COUNT(*) as prediction_count,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM `commerce.reorder_campaign_analysis`) as percentage,

  -- Accuracy Metrics
  AVG(prediction_accuracy_days) as avg_error_days,
  AVG(ABS(value_prediction_error)) as avg_value_error_usd,

  -- Revenue Impact
  SUM(actual_order_value) as total_revenue_captured,
  AVG(actual_order_value) as avg_order_value,

  CURRENT_TIMESTAMP() as last_updated

FROM `commerce.reorder_campaign_analysis`
GROUP BY prediction_accuracy_category
ORDER BY
  CASE prediction_accuracy_category
    WHEN 'ACCURATE' THEN 1
    WHEN 'CLOSE' THEN 2
    WHEN 'MODERATE' THEN 3
    ELSE 4
  END;

-- ============================================
-- 7. INVENTORY DEMAND FORECASTING
-- ============================================

-- Predict Product Demand (Next 30 Days)
CREATE OR REPLACE VIEW `commerce.product_demand_forecast` AS
WITH product_sales_history AS (
  SELECT
    i.id as product_id,
    i.name as product_name,
    i.category as product_category,
    DATE(p.created_at) as sale_date,
    COUNT(DISTINCT p.id) as daily_units_sold
  FROM `commerce.square_items` i
  JOIN `commerce.square_payments` p
    ON CAST(i.id AS STRING) = CAST(p.id AS STRING)
  WHERE p.status = 'COMPLETED'
    AND p.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
  GROUP BY i.id, i.name, i.category, sale_date
),
product_velocity AS (
  SELECT
    product_id,
    product_name,
    product_category,

    -- Historical Velocity
    AVG(daily_units_sold) as avg_daily_sales,
    STDDEV(daily_units_sold) as stddev_daily_sales,
    MAX(daily_units_sold) as peak_daily_sales,

    -- Trend (last 30 days vs previous 60 days)
    (SELECT AVG(daily_units_sold)
     FROM product_sales_history psh2
     WHERE psh2.product_id = psh.product_id
       AND psh2.sale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) as recent_avg_daily_sales,

    (SELECT AVG(daily_units_sold)
     FROM product_sales_history psh2
     WHERE psh2.product_id = psh.product_id
       AND psh2.sale_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
       AND DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) as historical_avg_daily_sales

  FROM product_sales_history psh
  GROUP BY product_id, product_name, product_category
)
SELECT
  product_id,
  product_name,
  product_category,
  avg_daily_sales,
  peak_daily_sales,

  -- 30-Day Forecast
  avg_daily_sales * 30 as forecasted_30day_demand,
  (avg_daily_sales + stddev_daily_sales) * 30 as forecasted_30day_demand_high,
  GREATEST(0, (avg_daily_sales - stddev_daily_sales) * 30) as forecasted_30day_demand_low,

  -- Growth Trend
  (recent_avg_daily_sales - historical_avg_daily_sales) /
    NULLIF(historical_avg_daily_sales, 0) * 100 as growth_trend_percent,

  -- Restock Recommendation
  CASE
    WHEN (recent_avg_daily_sales - historical_avg_daily_sales) / NULLIF(historical_avg_daily_sales, 0) > 0.2
      THEN 'INCREASE_STOCK_20_PERCENT'
    WHEN (recent_avg_daily_sales - historical_avg_daily_sales) / NULLIF(historical_avg_daily_sales, 0) < -0.2
      THEN 'DECREASE_STOCK_20_PERCENT'
    ELSE 'MAINTAIN_CURRENT_LEVELS'
  END as restock_recommendation,

  CURRENT_TIMESTAMP() as last_updated

FROM product_velocity
WHERE avg_daily_sales > 0  -- Only actively selling products
ORDER BY avg_daily_sales DESC;

-- Optimized: 2025-10-07
-- Last updated: 2025-10-07
