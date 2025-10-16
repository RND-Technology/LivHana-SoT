### knowledge.notion_pages

```sql
CREATE TABLE knowledge.notion_pages (
  id STRING NOT NULL,
  title STRING,
  content STRING,
  url STRING,
  created_time TIMESTAMP,
  last_edited_time TIMESTAMP,
  metadata STRING,
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```
