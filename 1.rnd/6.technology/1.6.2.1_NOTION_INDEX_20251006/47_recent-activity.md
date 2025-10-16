### Recent Activity

```sql
SELECT title, last_edited_time, content_length
FROM `knowledge.notion_pages`
WHERE last_edited_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY last_edited_time DESC;
```

See 30+ more queries in `NOTION_BIGQUERY_QUERIES.sql`

---
