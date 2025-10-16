### Option 1: Notion API (Recommended)

**Steps:**

1. **Create Notion Integration:**

   ```
   1. Go to https://www.notion.so/my-integrations
   2. Click "+ New integration"
   3. Name: "LivHana Data Ingestion"
   4. Select workspace: (your workspace)
   5. Copy the "Internal Integration Token"
   ```

2. **Share Pages with Integration:**

   ```
   1. Open each Notion page/database you want to ingest
   2. Click "•••" (three dots) → "Add connections"
   3. Select "LivHana Data Ingestion"
   4. Repeat for all pages
   ```

3. **Set Up Environment Variable:**

   ```bash
   # Add to .env
   NOTION_API_KEY="secret_xxxxxxxxxxxxx"
   ```

4. **Run Notion Ingestion Script:**

   ```bash
   cd automation/data-pipelines
   node notion_ingest.js
   ```

**What Gets Ingested:**

- All pages (title, content, properties)
- All databases (rows, columns, relations)
- File attachments (URLs)
- Comments and mentions
- Page hierarchy and structure

**Output:**

- BigQuery table: `knowledge.notion_pages`
- BigQuery table: `knowledge.notion_databases`
- Local markdown exports: `data/notion_export/`
