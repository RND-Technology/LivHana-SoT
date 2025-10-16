### BigQuery Table: `knowledge.notion_pages`

| Column | Type | Mode | Description |
|--------|------|------|-------------|
| page_id | STRING | REQUIRED | Notion page UUID (unique identifier) |
| title | STRING | REQUIRED | Page title |
| url | STRING | NULLABLE | Notion page URL |
| object_type | STRING | NULLABLE | "page" or "database" |
| parent_type | STRING | NULLABLE | Type of parent (page/database/workspace) |
| parent_id | STRING | NULLABLE | Parent UUID |
| created_time | TIMESTAMP | NULLABLE | Page creation timestamp |
| last_edited_time | TIMESTAMP | NULLABLE | Last edit timestamp |
| created_by | STRING | NULLABLE | Creator user ID |
| last_edited_by | STRING | NULLABLE | Last editor user ID |
| archived | BOOLEAN | NULLABLE | Archive status |
| icon_type | STRING | NULLABLE | Icon type (emoji/file) |
| icon_emoji | STRING | NULLABLE | Emoji icon |
| cover_url | STRING | NULLABLE | Cover image URL |
| properties | JSON | NULLABLE | All page properties as JSON |
| content_markdown | STRING | NULLABLE | Full markdown content |
| content_length | INTEGER | NULLABLE | Content length in characters |
| exported_at | TIMESTAMP | REQUIRED | Export timestamp |
| raw_json | JSON | NULLABLE | Complete Notion API response |

---
