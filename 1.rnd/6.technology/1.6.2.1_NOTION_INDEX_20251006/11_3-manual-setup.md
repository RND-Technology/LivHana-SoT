### 3. Manual Setup

```bash
# Set environment variables
export NOTION_API_KEY=secret_yourkey
export BQ_DATASET=knowledge  # optional

# Run ingestion
node notion_ingest.js

# Run test
node notion_test.js

# Query examples
node notion_query_example.js "search term"
```

---
