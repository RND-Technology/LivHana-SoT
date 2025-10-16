#### Table: `gmail_messages`

Primary table storing all email messages with full metadata and content.

**Key Fields:**

- `message_hash` - SHA-256 hash for deduplication
- `message_id` - Gmail message ID
- `thread_id` - Gmail thread ID
- `account_email` - Account email address
- `subject`, `from_email`, `to_email` - Email metadata
- `body_text`, `body_html` - Email content
- `categories[]` - Detected categories
- `sender_score` - Importance score (0-20)
- `labels[]` - Gmail labels (INBOX, SENT, etc)

**Partitioning:** By `timestamp` (daily)
**Clustering:** By `account_email`, `thread_id`
