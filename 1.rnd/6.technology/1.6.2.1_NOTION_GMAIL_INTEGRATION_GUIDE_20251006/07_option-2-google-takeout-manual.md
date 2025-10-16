### Option 2: Google Takeout (Manual)

**Steps:**

1. **Export from Google:**

   ```
   1. Go to https://takeout.google.com/
   2. Deselect all → Select only Gmail
   3. Export format: MBOX
   4. Download and unzip
   ```

2. **Import to BigQuery:**

   ```bash
   # Extract MBOX files
   python automation/data-pipelines/mbox_parser.py ~/Downloads/Takeout/Mail/*.mbox

   # Upload to BigQuery
   node automation/data-pipelines/gmail_import_local.js
   ```

---
