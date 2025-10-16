### communications.gmail_messages

```sql
CREATE TABLE communications.gmail_messages (
  id STRING NOT NULL,
  thread_id STRING,
  account STRING,
  subject STRING,
  from_address STRING,
  to_address STRING,
  date STRING,
  body STRING,
  labels STRING,
  metadata STRING,
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

---
