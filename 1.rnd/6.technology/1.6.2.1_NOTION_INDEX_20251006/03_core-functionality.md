### Core Functionality ✅

- [x] Notion API integration using @notionhq/client
- [x] Search all pages and databases in workspace
- [x] Extract full page content (all blocks, recursively)
- [x] Support 30+ block types (paragraphs, headings, lists, code, tables, media, etc.)
- [x] Export to markdown files in `data/notion_export/`
- [x] Insert into BigQuery `knowledge.notion_pages` table
- [x] Auto-create BigQuery schema (dataset + table)
- [x] Handle pagination (Notion API 100 items/request limit)
- [x] Comprehensive error handling
- [x] Retry logic with exponential backoff (3 retries)
- [x] Structured JSON logging
- [x] Idempotent operation (safe to re-run)
