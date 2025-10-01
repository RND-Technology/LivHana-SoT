# Notion Ingestion Pipeline

A production-ready script for ingesting Notion workspace content into BigQuery and exporting to markdown files.

## Features

- **Complete Notion Workspace Search**: Discovers all pages and databases in your workspace
- **Full Content Extraction**: Retrieves all blocks recursively with support for nested content
- **Rich Block Type Support**: Handles 30+ block types including:
  - Text blocks (paragraph, headings, quotes, callouts)
  - Lists (bulleted, numbered, to-do)
  - Code blocks with syntax highlighting
  - Media (images, videos, files, bookmarks)
  - Advanced blocks (tables, equations, embeds, toggles)
- **Markdown Export**: Converts all content to clean markdown files in `data/notion_export/`
- **BigQuery Integration**: Inserts structured data into `knowledge.notion_pages` table
- **Schema Management**: Automatically creates dataset and table with proper schema
- **Pagination Handling**: Manages Notion API's 100-item limit with automatic pagination
- **Retry Logic**: Exponential backoff for rate limits and transient failures (3 retries)
- **Structured Logging**: JSON-formatted logs with timestamps and context
- **Idempotent**: Safe to run multiple times (uses BigQuery streaming inserts)
- **Error Resilience**: Continues processing even if individual pages fail

## Prerequisites

1. **Notion Integration**:
   - Create an integration at https://www.notion.so/my-integrations
   - Copy the "Internal Integration Token"
   - Share your workspace pages with the integration

2. **Google Cloud Setup**:
   - Enable BigQuery API
   - Set up authentication (service account or application default credentials)
   - Ensure you have permissions to create datasets and tables

3. **Node.js**: Version 16+ (ESM modules)

## Installation

```bash
cd automation/data-pipelines
npm install
```

## Configuration

Create a `.env` file or export environment variables:

```bash
# Required
NOTION_API_KEY=secret_yourNotionIntegrationKey

# Optional (with defaults)
GCP_PROJECT_ID=your-gcp-project-id  # Uses default credentials if not set
BQ_DATASET=knowledge                 # Default: knowledge
```

## Usage

### Run the ingestion:

```bash
npm run notion:ingest
```

### Or directly:

```bash
node notion_ingest.js
```

### With environment variables:

```bash
NOTION_API_KEY=secret_xxx BQ_DATASET=my_dataset node notion_ingest.js
```

## Output

### 1. Markdown Files

Exported to `data/notion_export/` with naming pattern:
```
{sanitized_title}_{page_id}.md
```

Example:
```
data/notion_export/
  ├── product_roadmap_a1b2c3d4.md
  ├── meeting_notes_e5f6g7h8.md
  └── technical_docs_i9j0k1l2.md
```

### 2. BigQuery Table

Schema: `knowledge.notion_pages`

| Column | Type | Description |
|--------|------|-------------|
| page_id | STRING | Notion page UUID (required) |
| title | STRING | Page title (required) |
| url | STRING | Notion page URL |
| object_type | STRING | "page" or "database" |
| parent_type | STRING | Type of parent (page/database/workspace) |
| parent_id | STRING | Parent UUID |
| created_time | TIMESTAMP | Page creation timestamp |
| last_edited_time | TIMESTAMP | Last edit timestamp |
| created_by | STRING | Creator user ID |
| last_edited_by | STRING | Last editor user ID |
| archived | BOOLEAN | Archive status |
| icon_type | STRING | Icon type (emoji/file) |
| icon_emoji | STRING | Emoji icon |
| cover_url | STRING | Cover image URL |
| properties | JSON | All page properties |
| content_markdown | STRING | Full markdown content |
| content_length | INTEGER | Content length in characters |
| exported_at | TIMESTAMP | Export timestamp (required) |
| raw_json | JSON | Complete Notion API response |

### 3. Structured Logs

JSON-formatted logs with context:

```json
{
  "level": "INFO",
  "timestamp": "2025-10-01T12:34:56.789Z",
  "message": "Processing page: Product Roadmap",
  "pageId": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
}
```

## Block Type Support

### Text Content
- Paragraph
- Heading 1, 2, 3
- Quote
- Callout (with emoji)

### Lists
- Bulleted list
- Numbered list
- To-do list (with checkbox state)
- Toggle

### Code & Formatting
- Code blocks (with language syntax)
- Inline code
- Divider

### Media
- Images (with captions)
- Videos
- Files
- Bookmarks
- Embeds
- Link previews

### Advanced
- Tables & table rows
- Equations (LaTeX)
- Column layouts
- Synced blocks
- Templates
- Links to pages
- Table of contents
- Breadcrumbs

## Error Handling

### Retry Logic
- **Max Retries**: 3 attempts per operation
- **Backoff**: Exponential (1s, 2s, 4s)
- **Retryable Errors**:
  - Rate limits (429)
  - Server errors (500, 503)
  - Network timeouts

### Error Recovery
- Failed pages are logged but don't stop the pipeline
- Batch insert failures fall back to row-by-row insertion
- Nested block failures are logged but parent content is preserved

### Logging
All errors include:
- Error message and stack trace
- Page/block context
- Operation being performed
- Retry attempt number

## Performance

- **Pagination**: Handles workspaces of any size
- **Batching**: BigQuery inserts in batches of 500 rows
- **Concurrent Processing**: Sequential by default (to respect rate limits)
- **Rate Limits**: Notion API allows ~3 requests/second

### Expected Duration
- Small workspace (50 pages): ~2-3 minutes
- Medium workspace (500 pages): ~20-30 minutes
- Large workspace (5000 pages): ~3-4 hours

## Idempotency

The script is safe to run multiple times:
- BigQuery uses streaming inserts (no deduplication)
- For idempotent upserts, modify the script to use MERGE queries
- Markdown files are overwritten with latest content

## Troubleshooting

### "Notion API key is not set"
```bash
export NOTION_API_KEY=secret_yourkey
```

### "Page not found" errors
- Ensure the integration has access to the page
- Share the page with your integration in Notion

### Rate limit errors (429)
- The script automatically retries with backoff
- For large workspaces, consider adding delays between pages

### BigQuery permission errors
```bash
# Set up application default credentials
gcloud auth application-default login

# Or use a service account
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Missing block types
- Check logs for "Unknown block type" warnings
- Open an issue with the block type details

## Production Deployment

### Cron Job Example

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/automation/data-pipelines && /usr/bin/node notion_ingest.js >> /var/log/notion_ingest.log 2>&1
```

### Cloud Function / Cloud Run

```javascript
// Wrap main() in an HTTP handler
export async function handler(req, res) {
  try {
    await main();
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}
```

### Monitoring

Key metrics to track:
- Total pages processed
- Failed pages count
- Execution duration
- BigQuery rows inserted
- Export file count

## Advanced Usage

### Filter Specific Pages

Modify the `searchAllPages()` function to add filters:

```javascript
const response = await notion.search({
  filter: {
    property: 'object',
    value: 'page'
  },
  query: 'meeting notes',  // Search term
  sort: {
    direction: 'descending',
    timestamp: 'last_edited_time'
  }
});
```

### Custom Property Extraction

Add custom property handling in `extractPageProperties()`:

```javascript
case 'relation':
  properties[key] = value.relation.map(r => r.id).join(',');
  break;
```

### Query BigQuery

```sql
-- Find recently updated pages
SELECT page_id, title, last_edited_time, content_length
FROM knowledge.notion_pages
WHERE last_edited_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY last_edited_time DESC;

-- Search content
SELECT title, url, content_markdown
FROM knowledge.notion_pages
WHERE LOWER(content_markdown) LIKE '%product launch%'
LIMIT 10;

-- Get page hierarchy
WITH page_tree AS (
  SELECT page_id, title, parent_id, 1 as level
  FROM knowledge.notion_pages
  WHERE parent_type = 'workspace'

  UNION ALL

  SELECT p.page_id, p.title, p.parent_id, pt.level + 1
  FROM knowledge.notion_pages p
  JOIN page_tree pt ON p.parent_id = pt.page_id
  WHERE pt.level < 10
)
SELECT * FROM page_tree
ORDER BY level, title;
```

## Contributing

When adding support for new block types:
1. Add case to `blockToMarkdown()` switch statement
2. Test with actual Notion content
3. Update this README with the new type

## References

- [Notion API Documentation](https://developers.notion.com/)
- [BigQuery Node.js Client](https://cloud.google.com/nodejs/docs/reference/bigquery/latest)
- [@notionhq/client](https://github.com/makenotion/notion-sdk-js)

## License

Proprietary - LivHana Trinity System
