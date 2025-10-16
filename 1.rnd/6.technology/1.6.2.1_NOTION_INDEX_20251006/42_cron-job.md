### Cron Job

```bash
# Daily at 2 AM
0 2 * * * cd /path/to/automation/data-pipelines && \
  node notion_ingest.js >> /var/log/notion_ingest.log 2>&1
```
