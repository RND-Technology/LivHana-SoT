### Data Flow

```
Gmail API
    ↓
OAuth 2.0 Authentication
    ↓
Message Fetching (paginated)
    ↓
Content Extraction
    ├─→ HTML → Plain Text
    ├─→ Parse Headers
    ├─→ Extract Attachments
    └─→ Detect Categories
    ↓
Deduplication Check
    ↓
PII Masking
    ↓
Upload Attachments → Cloud Storage
    ↓
Insert into BigQuery
    ├─→ gmail_messages
    ├─→ gmail_attachments
    └─→ gmail_threads
    ↓
Build Thread Summaries
    ↓
Update Sync State
```
