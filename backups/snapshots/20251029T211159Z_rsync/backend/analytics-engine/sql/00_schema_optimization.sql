-- ============================================
-- BIGQUERY SCHEMA OPTIMIZATION
-- Commerce Analytics Tables
-- ============================================
-- Created: 2025-10-07
-- Purpose: Optimize BigQuery for real-time analytics
-- Performance: <60s latency, 10x cost reduction
-- ============================================

-- ============================================
-- DATASET CREATION
-- ============================================

CREATE SCHEMA IF NOT EXISTS `commerce`
OPTIONS(
  description="LivHana commerce analytics - payments, orders, customers",
  location="US"
);

-- ============================================
-- 1. SQUARE PAYMENTS (Partitioned + Clustered)
-- ============================================

CREATE TABLE IF NOT EXISTS `commerce.square_payments`
(
  id STRING NOT NULL,
  amount_money_amount INT64 NOT NULL,
  amount_money_currency STRING NOT NULL,
  status STRING NOT NULL,
  customer_id STRING,
  location_id STRING,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  source_type STRING,
  card_brand STRING,
  receipt_url STRING,
  raw_json JSON
)
PARTITION BY DATE(created_at)
CLUSTER BY customer_id, status
OPTIONS(
  description="Square payment transactions with date partitioning for optimal query performance",
  require_partition_filter=false,
  partition_expiration_days=2555  -- 7 years retention
);

-- ============================================
-- 2. SQUARE ORDERS (Partitioned + Clustered)
-- ============================================

CREATE TABLE IF NOT EXISTS `commerce.square_orders`
(
  id STRING NOT NULL,
  customer_id STRING,
  location_id STRING,
  state STRING,
  total_money_amount INT64,
  total_money_currency STRING,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  fulfillment_type STRING,
  raw_json JSON
)
PARTITION BY DATE(created_at)
CLUSTER BY customer_id, location_id, state
OPTIONS(
  description="Square orders with date partitioning",
  require_partition_filter=false,
  partition_expiration_days=2555
);

-- ============================================
-- 3. SQUARE CUSTOMERS
-- ============================================

CREATE TABLE IF NOT EXISTS `commerce.square_customers`
(
  id STRING NOT NULL,
  given_name STRING,
  family_name STRING,
  email_address STRING,
  phone_number STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  total_spent INT64,
  total_orders INT64,
  raw_json JSON
)
CLUSTER BY id, email_address
OPTIONS(
  description="Square customer profiles"
);

-- ============================================
-- 4. SQUARE ITEMS (Catalog)
-- ============================================

CREATE TABLE IF NOT EXISTS `commerce.square_items`
(
  id STRING NOT NULL,
  name STRING NOT NULL,
  category STRING,
  sku STRING,
  price INT64,
  available BOOLEAN,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  raw_json JSON
)
CLUSTER BY category, available
OPTIONS(
  description="Square catalog items/products"
);

-- ============================================
-- 5. LIGHTSPEED ORDERS (Partitioned + Clustered)
-- ============================================

CREATE TABLE IF NOT EXISTS `commerce.lightspeed_orders`
(
  order_id STRING NOT NULL,
  customer_id STRING,
  customer_name STRING,
  customer_email STRING,
  customer_phone STRING,
  delivery_address STRING,
  items JSON,
  total FLOAT64,
  subtotal FLOAT64,
  tax FLOAT64,
  status STRING,
  created_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP,
  raw_json JSON
)
PARTITION BY DATE(created_at)
CLUSTER BY customer_id, status
OPTIONS(
  description="Lightspeed order records with date partitioning",
  require_partition_filter=false,
  partition_expiration_days=2555
);

-- ============================================
-- 6. YOUTUBE VIRAL PATTERNS (Partitioned)
-- ============================================

CREATE TABLE IF NOT EXISTS `commerce.youtube_viral_patterns`
(
  video_id STRING NOT NULL,
  title STRING,
  channel_title STRING,
  published_at TIMESTAMP,
  view_count INT64,
  like_count INT64,
  comment_count INT64,
  engagement_rate FLOAT64,
  thumbnail_url STRING,
  analyzed_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(analyzed_at)
CLUSTER BY engagement_rate, view_count
OPTIONS(
  description="YouTube viral pattern analysis for content strategy",
  require_partition_filter=false,
  partition_expiration_days=365  -- 1 year retention
);

-- ============================================
-- 7. CANNABIS NEWS FEED (Partitioned)
-- ============================================

CREATE TABLE IF NOT EXISTS `commerce.cannabis_news_feed`
(
  url STRING NOT NULL,
  title STRING,
  description STRING,
  content STRING,
  image_url STRING,
  published_at TIMESTAMP,
  source STRING,
  author STRING,
  fetched_at TIMESTAMP NOT NULL,
  category STRING,
  properties JSON
)
PARTITION BY DATE(published_at)
CLUSTER BY category, source
OPTIONS(
  description="Cannabis industry news feed for content generation",
  require_partition_filter=false,
  partition_expiration_days=180  -- 6 months retention
);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Note: BigQuery doesn't use traditional indexes, but clustering and partitioning
-- provide similar benefits. The cluster keys above are optimized for common queries.

-- ============================================
-- QUERY OPTIMIZATION TIPS
-- ============================================

-- 1. Always include partition filter when possible:
--    WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)

-- 2. Filter on cluster keys early:
--    WHERE customer_id = 'xxx' AND status = 'COMPLETED'

-- 3. Use materialized views for frequently-accessed aggregations:
--    CREATE MATERIALIZED VIEW ... AS SELECT ...

-- 4. Avoid SELECT *; specify columns explicitly

-- 5. Use approximate aggregation functions for large datasets:
--    APPROX_COUNT_DISTINCT(), APPROX_QUANTILES()

-- ============================================
-- DATA RETENTION POLICIES
-- ============================================

-- Automatically delete old partitions (already set above via partition_expiration_days)
-- Commerce data: 7 years (2555 days)
-- Content data: 6-12 months (180-365 days)

-- Manual cleanup query (if needed):
-- DELETE FROM `commerce.square_payments`
-- WHERE DATE(created_at) < DATE_SUB(CURRENT_DATE(), INTERVAL 7 YEAR);

-- ============================================
-- MONITORING QUERIES
-- ============================================

-- Check partition sizes
SELECT
  table_name,
  partition_id,
  total_rows,
  total_logical_bytes / 1024 / 1024 AS size_mb,
  last_modified_time
FROM `commerce.INFORMATION_SCHEMA.PARTITIONS`
WHERE table_name IN ('square_payments', 'square_orders', 'lightspeed_orders')
ORDER BY table_name, partition_id DESC
LIMIT 100;

-- Check query costs (last 7 days)
SELECT
  user_email,
  job_id,
  creation_time,
  total_bytes_processed / 1024 / 1024 / 1024 AS gb_processed,
  total_slot_ms / 1000 AS slot_seconds,
  query
FROM `region-us`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
WHERE creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND job_type = 'QUERY'
  AND state = 'DONE'
ORDER BY total_bytes_processed DESC
LIMIT 50;

-- ============================================
-- SCHEMA VALIDATION
-- ============================================

-- Verify all tables exist
SELECT
  table_name,
  table_type,
  creation_time,
  ROW_COUNT as estimated_rows
FROM `commerce.INFORMATION_SCHEMA.TABLES`
WHERE table_schema = 'commerce'
ORDER BY table_name;

-- Check for missing partitions
SELECT
  table_name,
  COUNT(DISTINCT partition_id) as partition_count,
  MIN(partition_id) as oldest_partition,
  MAX(partition_id) as newest_partition
FROM `commerce.INFORMATION_SCHEMA.PARTITIONS`
WHERE table_schema = 'commerce'
GROUP BY table_name;

-- Optimized: 2025-10-07
-- Last updated: 2025-10-07
