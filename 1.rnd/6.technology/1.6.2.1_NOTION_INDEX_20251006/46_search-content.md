### Search Content

```sql
SELECT title, url, content_length
FROM `knowledge.notion_pages`
WHERE LOWER(content_markdown) LIKE '%product launch%'
ORDER BY last_edited_time DESC;
```
