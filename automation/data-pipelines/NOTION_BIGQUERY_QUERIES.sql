-- ============================================
-- Notion BigQuery Schema & Useful Queries
-- ============================================
-- Table: knowledge.notion_pages
-- Created by: notion_ingest.js
-- ============================================

-- ============================================
-- Schema Definition
-- ============================================

CREATE TABLE IF NOT EXISTS `knowledge.notion_pages` (
  page_id STRING NOT NULL,                -- Notion page UUID
  title STRING NOT NULL,                   -- Page title
  url STRING,                              -- Notion page URL
  object_type STRING,                      -- "page" or "database"
  parent_type STRING,                      -- Type of parent (page/database/workspace)
  parent_id STRING,                        -- Parent UUID
  created_time TIMESTAMP,                  -- Page creation timestamp
  last_edited_time TIMESTAMP,              -- Last edit timestamp
  created_by STRING,                       -- Creator user ID
  last_edited_by STRING,                   -- Last editor user ID
  archived BOOLEAN,                        -- Archive status
  icon_type STRING,                        -- Icon type (emoji/file)
  icon_emoji STRING,                       -- Emoji icon
  cover_url STRING,                        -- Cover image URL
  properties JSON,                         -- All page properties
  content_markdown STRING,                 -- Full markdown content
  content_length INTEGER,                  -- Content length in characters
  exported_at TIMESTAMP NOT NULL,          -- Export timestamp
  raw_json JSON                            -- Complete Notion API response
);

-- ============================================
-- Basic Queries
-- ============================================

-- Get all pages ordered by last edit
SELECT
  page_id,
  title,
  url,
  last_edited_time,
  content_length,
  exported_at
FROM `knowledge.notion_pages`
WHERE archived = FALSE
ORDER BY last_edited_time DESC
LIMIT 100;

-- Count pages by object type
SELECT
  object_type,
  COUNT(*) as count,
  AVG(content_length) as avg_content_length
FROM `knowledge.notion_pages`
GROUP BY object_type;

-- Recently updated pages (last 7 days)
SELECT
  page_id,
  title,
  url,
  last_edited_time,
  content_length
FROM `knowledge.notion_pages`
WHERE last_edited_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND archived = FALSE
ORDER BY last_edited_time DESC;

-- ============================================
-- Content Search Queries
-- ============================================

-- Full-text search in content
SELECT
  title,
  url,
  last_edited_time,
  content_length,
  -- Show snippet of matching content
  SUBSTR(content_markdown,
    GREATEST(0, STRPOS(LOWER(content_markdown), 'search term') - 50),
    200) as context
FROM `knowledge.notion_pages`
WHERE LOWER(content_markdown) LIKE '%search term%'
  AND archived = FALSE
ORDER BY last_edited_time DESC
LIMIT 20;

-- Search in titles
SELECT
  page_id,
  title,
  url,
  last_edited_time
FROM `knowledge.notion_pages`
WHERE LOWER(title) LIKE '%meeting%'
  AND archived = FALSE
ORDER BY last_edited_time DESC;

-- Find pages with specific properties
SELECT
  page_id,
  title,
  JSON_EXTRACT_SCALAR(properties, '$.Status') as status,
  JSON_EXTRACT_SCALAR(properties, '$.Priority') as priority,
  url
FROM `knowledge.notion_pages`
WHERE JSON_EXTRACT_SCALAR(properties, '$.Status') = 'In Progress'
ORDER BY last_edited_time DESC;

-- ============================================
-- Page Hierarchy Queries
-- ============================================

-- Top-level pages (workspace root)
SELECT
  page_id,
  title,
  object_type,
  created_time,
  last_edited_time
FROM `knowledge.notion_pages`
WHERE parent_type = 'workspace'
  AND archived = FALSE
ORDER BY title;

-- Pages by parent
SELECT
  page_id,
  title,
  url,
  parent_id,
  last_edited_time
FROM `knowledge.notion_pages`
WHERE parent_id = 'PARENT_PAGE_ID_HERE'
ORDER BY title;

-- Recursive page tree (up to 10 levels)
WITH RECURSIVE page_tree AS (
  -- Root level (workspace pages)
  SELECT
    page_id,
    title,
    parent_id,
    parent_type,
    url,
    1 as level,
    CAST(title AS STRING) as path
  FROM `knowledge.notion_pages`
  WHERE parent_type = 'workspace'
    AND archived = FALSE

  UNION ALL

  -- Child pages
  SELECT
    p.page_id,
    p.title,
    p.parent_id,
    p.parent_type,
    p.url,
    pt.level + 1,
    CONCAT(pt.path, ' > ', p.title)
  FROM `knowledge.notion_pages` p
  JOIN page_tree pt ON p.parent_id = pt.page_id
  WHERE pt.level < 10
    AND p.archived = FALSE
)
SELECT
  level,
  page_id,
  title,
  path,
  url
FROM page_tree
ORDER BY path;

-- ============================================
-- Analytics Queries
-- ============================================

-- Most edited pages (by edit frequency estimate)
SELECT
  page_id,
  title,
  url,
  created_time,
  last_edited_time,
  TIMESTAMP_DIFF(last_edited_time, created_time, HOUR) as hours_active,
  content_length
FROM `knowledge.notion_pages`
WHERE archived = FALSE
  AND created_time IS NOT NULL
  AND last_edited_time IS NOT NULL
ORDER BY
  TIMESTAMP_DIFF(last_edited_time, created_time, HOUR) DESC,
  last_edited_time DESC
LIMIT 50;

-- Content size distribution
SELECT
  CASE
    WHEN content_length < 100 THEN '0-100'
    WHEN content_length < 500 THEN '100-500'
    WHEN content_length < 1000 THEN '500-1K'
    WHEN content_length < 5000 THEN '1K-5K'
    WHEN content_length < 10000 THEN '5K-10K'
    ELSE '10K+'
  END as size_range,
  COUNT(*) as page_count,
  AVG(content_length) as avg_length
FROM `knowledge.notion_pages`
WHERE archived = FALSE
GROUP BY size_range
ORDER BY avg_length;

-- Pages by creator
SELECT
  created_by,
  COUNT(*) as pages_created,
  AVG(content_length) as avg_content_length,
  MAX(created_time) as last_created
FROM `knowledge.notion_pages`
WHERE archived = FALSE
  AND created_by IS NOT NULL
GROUP BY created_by
ORDER BY pages_created DESC;

-- Activity by month
SELECT
  FORMAT_TIMESTAMP('%Y-%m', created_time) as month,
  COUNT(*) as pages_created,
  SUM(content_length) as total_content
FROM `knowledge.notion_pages`
WHERE created_time IS NOT NULL
GROUP BY month
ORDER BY month DESC;

-- ============================================
-- Maintenance Queries
-- ============================================

-- Find duplicate exports (multiple exports of same page)
SELECT
  page_id,
  title,
  COUNT(*) as export_count,
  ARRAY_AGG(exported_at ORDER BY exported_at DESC LIMIT 3) as export_times
FROM `knowledge.notion_pages`
GROUP BY page_id, title
HAVING COUNT(*) > 1
ORDER BY export_count DESC;

-- Latest export per page (for deduplication)
SELECT * FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY page_id ORDER BY exported_at DESC) as rn
  FROM `knowledge.notion_pages`
)
WHERE rn = 1;

-- Find archived pages
SELECT
  page_id,
  title,
  url,
  last_edited_time,
  archived
FROM `knowledge.notion_pages`
WHERE archived = TRUE
ORDER BY last_edited_time DESC;

-- Find pages with no content
SELECT
  page_id,
  title,
  url,
  content_length,
  last_edited_time
FROM `knowledge.notion_pages`
WHERE (content_markdown IS NULL OR content_length < 10)
  AND archived = FALSE
ORDER BY last_edited_time DESC;

-- Export statistics
SELECT
  FORMAT_TIMESTAMP('%Y-%m-%d', exported_at) as export_date,
  COUNT(*) as pages_exported,
  SUM(content_length) as total_content,
  AVG(content_length) as avg_content_length,
  MAX(exported_at) as latest_export
FROM `knowledge.notion_pages`
GROUP BY export_date
ORDER BY export_date DESC
LIMIT 30;

-- ============================================
-- Advanced Queries
-- ============================================

-- Pages with specific keywords in title or content
SELECT
  page_id,
  title,
  url,
  last_edited_time,
  content_length,
  CASE
    WHEN LOWER(title) LIKE '%product%' THEN 'title_match'
    WHEN LOWER(content_markdown) LIKE '%product%' THEN 'content_match'
  END as match_type
FROM `knowledge.notion_pages`
WHERE (LOWER(title) LIKE '%product%' OR LOWER(content_markdown) LIKE '%product%')
  AND archived = FALSE
ORDER BY
  match_type,
  last_edited_time DESC
LIMIT 50;

-- Extract specific properties from JSON
SELECT
  page_id,
  title,
  JSON_EXTRACT_SCALAR(properties, '$.Status') as status,
  JSON_EXTRACT_SCALAR(properties, '$.Priority') as priority,
  JSON_EXTRACT_SCALAR(properties, '$.DueDate') as due_date,
  JSON_EXTRACT_SCALAR(properties, '$.Owner') as owner,
  url
FROM `knowledge.notion_pages`
WHERE JSON_EXTRACT_SCALAR(properties, '$.Status') IS NOT NULL
  AND archived = FALSE
ORDER BY due_date, priority DESC;

-- Pages last edited by specific user
SELECT
  page_id,
  title,
  url,
  last_edited_time,
  last_edited_by,
  content_length
FROM `knowledge.notion_pages`
WHERE last_edited_by = 'USER_ID_HERE'
  AND archived = FALSE
ORDER BY last_edited_time DESC
LIMIT 50;

-- Find stale pages (not edited in 90+ days)
SELECT
  page_id,
  title,
  url,
  last_edited_time,
  TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), last_edited_time, DAY) as days_since_edit,
  content_length
FROM `knowledge.notion_pages`
WHERE last_edited_time < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
  AND archived = FALSE
ORDER BY days_since_edit DESC
LIMIT 100;

-- Database summary (for database objects)
SELECT
  page_id,
  title,
  url,
  created_time,
  last_edited_time,
  JSON_EXTRACT_SCALAR(properties, '$.title') as db_title
FROM `knowledge.notion_pages`
WHERE object_type = 'database'
  AND archived = FALSE
ORDER BY title;

-- ============================================
-- Data Quality Queries
-- ============================================

-- Check for missing critical fields
SELECT
  COUNT(*) as total_rows,
  COUNTIF(page_id IS NULL) as missing_page_id,
  COUNTIF(title IS NULL OR title = '') as missing_title,
  COUNTIF(content_markdown IS NULL) as missing_content,
  COUNTIF(exported_at IS NULL) as missing_export_time
FROM `knowledge.notion_pages`;

-- Find unusual content sizes
SELECT
  page_id,
  title,
  content_length,
  url
FROM `knowledge.notion_pages`
WHERE content_length > 100000 OR content_length < 0
ORDER BY content_length DESC;

-- ============================================
-- Cleanup / Maintenance Operations
-- ============================================

-- Delete old exports (keep only latest per page)
-- WARNING: This will permanently delete data!
-- Uncomment to use:
/*
DELETE FROM `knowledge.notion_pages`
WHERE (page_id, exported_at) NOT IN (
  SELECT page_id, MAX(exported_at)
  FROM `knowledge.notion_pages`
  GROUP BY page_id
);
*/

-- Delete archived pages
-- WARNING: This will permanently delete data!
-- Uncomment to use:
/*
DELETE FROM `knowledge.notion_pages`
WHERE archived = TRUE;
*/

-- ============================================
-- Performance Optimization
-- ============================================

-- Recommended partitioning (for large tables)
/*
CREATE TABLE `knowledge.notion_pages_partitioned` (
  page_id STRING NOT NULL,
  title STRING NOT NULL,
  -- ... other columns ...
  exported_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(exported_at)
CLUSTER BY page_id, last_edited_time
OPTIONS(
  description="Notion workspace pages and databases with partitioning",
  require_partition_filter=FALSE
);
*/

-- ============================================
-- Export Queries
-- ============================================

-- Export to CSV format (for external tools)
SELECT
  page_id,
  title,
  url,
  FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S', created_time) as created,
  FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S', last_edited_time) as last_edited,
  content_length,
  archived
FROM `knowledge.notion_pages`
ORDER BY last_edited_time DESC;

-- Generate page index for documentation
SELECT
  CONCAT('- [', title, '](', url, ')') as markdown_link,
  FORMAT_TIMESTAMP('%Y-%m-%d', last_edited_time) as last_updated
FROM `knowledge.notion_pages`
WHERE archived = FALSE
  AND url IS NOT NULL
ORDER BY title;
