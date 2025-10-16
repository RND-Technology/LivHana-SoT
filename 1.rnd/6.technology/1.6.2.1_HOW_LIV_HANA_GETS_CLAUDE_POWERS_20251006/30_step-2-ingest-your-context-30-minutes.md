### Step 2: Ingest Your Context (30 minutes)

```bash
cd automation/data-pipelines

# Notion (all your business knowledge)
npm run notion:ingest

# Gmail (all your communications)
npm run gmail:auth:jessen
npm run gmail:auth:high
npm run gmail:ingest:full
```
