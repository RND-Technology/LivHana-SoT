-- Gmail BigQuery Schema Definitions
-- Dataset: communications
-- Tables: gmail_messages, gmail_threads, gmail_attachments

-- =====================================================
-- Table: gmail_messages
-- =====================================================
CREATE TABLE IF NOT EXISTS `communications.gmail_messages` (
  -- Primary identifiers
  message_hash STRING NOT NULL OPTIONS(description="SHA-256 hash of message_id + account_email for deduplication"),
  message_id STRING NOT NULL OPTIONS(description="Gmail message ID"),
  thread_id STRING NOT NULL OPTIONS(description="Gmail thread ID"),
  account_email STRING NOT NULL OPTIONS(description="Gmail account email address"),
  account_name STRING NOT NULL OPTIONS(description="Account identifier (jesseniesen, high_randd)"),

  -- Email metadata
  subject STRING OPTIONS(description="Email subject line"),
  from_email STRING OPTIONS(description="Sender email address"),
  from_name STRING OPTIONS(description="Sender display name"),
  to_email STRING OPTIONS(description="Primary recipient email address"),
  to_name STRING OPTIONS(description="Primary recipient display name"),
  cc_email STRING OPTIONS(description="CC recipient email addresses"),
  bcc_email STRING OPTIONS(description="BCC recipient email addresses"),
  reply_to STRING OPTIONS(description="Reply-to email address"),
  date STRING OPTIONS(description="Date header from email"),
  timestamp TIMESTAMP NOT NULL OPTIONS(description="Message timestamp"),

  -- Content
  labels ARRAY<STRING> OPTIONS(description="Gmail labels (INBOX, SENT, IMPORTANT, etc)"),
  snippet STRING OPTIONS(description="Email preview snippet (first 500 chars)"),
  body_text STRING OPTIONS(description="Plain text body (PII masked)"),
  body_html STRING OPTIONS(description="HTML body"),
  size_estimate INT64 OPTIONS(description="Estimated message size in bytes"),

  -- Attachments
  has_attachments BOOL OPTIONS(description="Whether message has attachments"),
  attachment_count INT64 OPTIONS(description="Number of attachments"),

  -- Intelligence
  categories ARRAY<STRING> OPTIONS(description="Detected categories (cannabis_business, compliance, legal, financial)"),
  sender_score FLOAT64 OPTIONS(description="Sender importance score (0-20)"),

  -- Flags
  is_spam BOOL OPTIONS(description="Message is marked as spam"),
  is_trash BOOL OPTIONS(description="Message is in trash"),
  is_important BOOL OPTIONS(description="Message is marked important"),
  is_starred BOOL OPTIONS(description="Message is starred"),

  -- System
  ingested_at TIMESTAMP NOT NULL OPTIONS(description="When message was ingested into BigQuery"),
  raw_headers JSON OPTIONS(description="Raw email headers"),
  raw_json JSON OPTIONS(description="Raw Gmail API response")
)
PARTITION BY DATE(timestamp)
CLUSTER BY account_email, thread_id
OPTIONS(
  description="Gmail messages from all accounts",
  labels=[("source", "gmail_api"), ("pipeline", "gmail_ingest")]
);

-- =====================================================
-- Table: gmail_threads
-- =====================================================
CREATE TABLE IF NOT EXISTS `communications.gmail_threads` (
  -- Primary identifiers
  thread_id STRING NOT NULL OPTIONS(description="Gmail thread ID"),
  account_email STRING NOT NULL OPTIONS(description="Gmail account email address"),
  account_name STRING NOT NULL OPTIONS(description="Account identifier"),

  -- Thread metadata
  subject STRING OPTIONS(description="Thread subject (from most recent message)"),
  message_count INT64 NOT NULL OPTIONS(description="Number of messages in thread"),
  participant_emails ARRAY<STRING> OPTIONS(description="All unique participant email addresses"),

  -- Timing
  first_message_date TIMESTAMP OPTIONS(description="Timestamp of first message in thread"),
  last_message_date TIMESTAMP OPTIONS(description="Timestamp of most recent message in thread"),

  -- Classification
  labels ARRAY<STRING> OPTIONS(description="Aggregated labels from all messages"),
  categories ARRAY<STRING> OPTIONS(description="Aggregated categories"),

  -- System
  ingested_at TIMESTAMP NOT NULL OPTIONS(description="When thread was processed")
)
PARTITION BY DATE(last_message_date)
CLUSTER BY account_email, thread_id
OPTIONS(
  description="Gmail thread summaries",
  labels=[("source", "gmail_api"), ("pipeline", "gmail_ingest")]
);

-- =====================================================
-- Table: gmail_attachments
-- =====================================================
CREATE TABLE IF NOT EXISTS `communications.gmail_attachments` (
  -- References
  message_hash STRING NOT NULL OPTIONS(description="SHA-256 hash linking to gmail_messages"),
  message_id STRING NOT NULL OPTIONS(description="Gmail message ID"),
  thread_id STRING NOT NULL OPTIONS(description="Gmail thread ID"),
  account_email STRING NOT NULL OPTIONS(description="Gmail account email address"),

  -- Attachment metadata
  attachment_id STRING NOT NULL OPTIONS(description="Gmail attachment ID"),
  filename STRING NOT NULL OPTIONS(description="Attachment filename"),
  mime_type STRING OPTIONS(description="MIME type (image/png, application/pdf, etc)"),
  size_bytes INT64 OPTIONS(description="File size in bytes"),

  -- Storage
  gcs_path STRING NOT NULL OPTIONS(description="Google Cloud Storage path (gs://bucket/path)"),

  -- System
  ingested_at TIMESTAMP NOT NULL OPTIONS(description="When attachment was downloaded and stored")
)
PARTITION BY DATE(ingested_at)
CLUSTER BY account_email, message_id
OPTIONS(
  description="Gmail attachments stored in Cloud Storage",
  labels=[("source", "gmail_api"), ("pipeline", "gmail_ingest")]
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Full-text search on messages
CREATE SEARCH INDEX IF NOT EXISTS gmail_messages_search_idx
ON `communications.gmail_messages`(ALL COLUMNS)
OPTIONS(
  analyzer='STANDARD'
);

-- Create views for common queries

-- =====================================================
-- View: Recent Important Emails
-- =====================================================
CREATE OR REPLACE VIEW `communications.gmail_recent_important` AS
SELECT
  message_id,
  account_email,
  subject,
  from_email,
  from_name,
  timestamp,
  snippet,
  categories,
  sender_score,
  labels
FROM `communications.gmail_messages`
WHERE
  is_spam = FALSE
  AND is_trash = FALSE
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  AND (
    is_important = TRUE
    OR is_starred = TRUE
    OR sender_score >= 10
    OR 'cannabis_business' IN UNNEST(categories)
    OR 'compliance' IN UNNEST(categories)
    OR 'legal' IN UNNEST(categories)
  )
ORDER BY timestamp DESC;

-- =====================================================
-- View: Cannabis Business Communications
-- =====================================================
CREATE OR REPLACE VIEW `communications.gmail_cannabis_business` AS
SELECT
  m.message_id,
  m.thread_id,
  m.account_email,
  m.subject,
  m.from_email,
  m.from_name,
  m.to_email,
  m.timestamp,
  m.snippet,
  m.categories,
  m.labels,
  t.message_count as thread_message_count,
  t.participant_emails as thread_participants
FROM `communications.gmail_messages` m
LEFT JOIN `communications.gmail_threads` t
  ON m.thread_id = t.thread_id
  AND m.account_email = t.account_email
WHERE
  'cannabis_business' IN UNNEST(m.categories)
  AND m.is_spam = FALSE
  AND m.is_trash = FALSE
ORDER BY m.timestamp DESC;

-- =====================================================
-- View: Compliance & Legal Communications
-- =====================================================
CREATE OR REPLACE VIEW `communications.gmail_compliance_legal` AS
SELECT
  m.message_id,
  m.thread_id,
  m.account_email,
  m.subject,
  m.from_email,
  m.from_name,
  m.timestamp,
  m.snippet,
  m.categories,
  m.sender_score,
  m.has_attachments,
  m.attachment_count
FROM `communications.gmail_messages` m
WHERE
  ('compliance' IN UNNEST(m.categories) OR 'legal' IN UNNEST(m.categories))
  AND m.is_spam = FALSE
  AND m.is_trash = FALSE
ORDER BY m.timestamp DESC;

-- =====================================================
-- View: Thread Summaries with Metrics
-- =====================================================
CREATE OR REPLACE VIEW `communications.gmail_thread_summaries` AS
SELECT
  t.thread_id,
  t.account_email,
  t.subject,
  t.message_count,
  t.participant_emails,
  t.first_message_date,
  t.last_message_date,
  TIMESTAMP_DIFF(t.last_message_date, t.first_message_date, DAY) as thread_duration_days,
  t.categories,
  t.labels,
  -- Count important messages in thread
  (SELECT COUNT(*)
   FROM `communications.gmail_messages` m
   WHERE m.thread_id = t.thread_id
     AND m.account_email = t.account_email
     AND m.is_important = TRUE) as important_message_count,
  -- Count attachments in thread
  (SELECT COUNT(*)
   FROM `communications.gmail_attachments` a
   WHERE a.thread_id = t.thread_id
     AND a.account_email = t.account_email) as total_attachments
FROM `communications.gmail_threads` t
ORDER BY t.last_message_date DESC;

-- =====================================================
-- View: Daily Email Volume by Account
-- =====================================================
CREATE OR REPLACE VIEW `communications.gmail_daily_volume` AS
SELECT
  DATE(timestamp) as date,
  account_email,
  COUNT(*) as total_emails,
  COUNT(DISTINCT thread_id) as unique_threads,
  COUNT(DISTINCT from_email) as unique_senders,
  COUNTIF(is_important) as important_emails,
  COUNTIF(has_attachments) as emails_with_attachments,
  SUM(attachment_count) as total_attachments,
  COUNTIF('cannabis_business' IN UNNEST(categories)) as cannabis_business_emails,
  COUNTIF('compliance' IN UNNEST(categories)) as compliance_emails,
  COUNTIF('legal' IN UNNEST(categories)) as legal_emails,
  COUNTIF('financial' IN UNNEST(categories)) as financial_emails
FROM `communications.gmail_messages`
WHERE is_spam = FALSE AND is_trash = FALSE
GROUP BY date, account_email
ORDER BY date DESC, account_email;

-- =====================================================
-- View: Top Senders by Account
-- =====================================================
CREATE OR REPLACE VIEW `communications.gmail_top_senders` AS
SELECT
  account_email,
  from_email,
  from_name,
  COUNT(*) as email_count,
  COUNT(DISTINCT thread_id) as thread_count,
  AVG(sender_score) as avg_sender_score,
  MAX(timestamp) as last_email_date,
  COUNTIF(is_important) as important_count,
  ARRAY_AGG(DISTINCT category IGNORE NULLS) as categories
FROM `communications.gmail_messages`,
UNNEST(categories) as category
WHERE
  is_spam = FALSE
  AND is_trash = FALSE
  AND from_email IS NOT NULL
GROUP BY account_email, from_email, from_name
HAVING email_count >= 3
ORDER BY email_count DESC;
