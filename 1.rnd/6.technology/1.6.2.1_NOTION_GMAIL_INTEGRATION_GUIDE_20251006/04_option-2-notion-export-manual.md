### Option 2: Notion Export (Manual)

**Steps:**

1. **Export from Notion:**

   ```
   1. Go to Settings & members → Settings → Export all workspace content
   2. Format: Markdown & CSV
   3. Include files: Yes
   4. Download and unzip
   ```

2. **Import to Repo:**

   ```bash
   # Copy export to repo
   cp -r ~/Downloads/Notion_Export data/notion_export/

   # Run import script
   node automation/data-pipelines/notion_import_local.js
   ```

---
