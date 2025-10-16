### Cleanup Queries

```sql
-- Remove old duplicates (keep latest per page)
DELETE FROM `knowledge.notion_pages`
WHERE (page_id, exported_at) NOT IN (
  SELECT page_id, MAX(exported_at)
  FROM `knowledge.notion_pages`
  GROUP BY page_id
);

-- Remove archived pages
DELETE FROM `knowledge.notion_pages`
WHERE archived = TRUE;
```

---
