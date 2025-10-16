## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Notion Workspace                      │
│  (Pages, Databases, Blocks, Content, Metadata)          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Notion API
                     │ @notionhq/client
                     │
┌────────────────────▼─────────────────────────────────────┐
│              notion_ingest.js (652 lines)                │
│                                                           │
│  1. Search (paginated)                                   │
│     - All pages                                          │
│     - All databases                                      │
│                                                           │
│  2. Extract (recursive)                                  │
│     - All blocks                                         │
│     - Nested children                                    │
│     - Full properties                                    │
│                                                           │
│  3. Transform                                            │
│     - Blocks → Markdown                                  │
│     - Rich text → Plain text                            │
│     - Properties → JSON                                  │
│                                                           │
│  4. Export                                               │
│     - Markdown files                                     │
│     - BigQuery rows                                      │
│                                                           │
│  Features:                                               │
│  - Retry logic (exponential backoff)                    │
│  - Error handling (continue on failure)                 │
│  - Progress logging (structured JSON)                   │
│  - Batch inserts (500 rows)                             │
│  - Schema auto-creation                                 │
└────────────┬────────────────────────┬────────────────────┘
             │                        │
             │                        │
    ┌────────▼────────┐      ┌───────▼──────────┐
    │  Markdown Files │      │     BigQuery     │
    │                 │      │                  │
    │ data/           │      │ knowledge.       │
    │ notion_export/  │      │ notion_pages     │
    │                 │      │                  │
    │ - {title}_{id}  │      │ 19 columns:      │
    │   .md           │      │ - page_id        │
    │                 │      │ - title          │
    │ Full content    │      │ - content_md     │
    │ Human-readable  │      │ - properties     │
    │                 │      │ - metadata       │
    │                 │      │ - timestamps     │
    └─────────────────┘      │ - raw_json       │
                             │                  │
                             │ Queryable        │
                             │ Searchable       │
                             │ Analyzable       │
                             └──────────────────┘
```

---
