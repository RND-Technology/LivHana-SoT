### Common Issues

| Error | Solution |
|-------|----------|
| "NOTION_API_KEY not set" | `export NOTION_API_KEY=secret_xxx` |
| "Page not found" | Share pages with integration in Notion |
| Rate limit (429) | Script auto-retries, normal for large workspaces |
| BigQuery permission error | `gcloud auth application-default login` |
| "Dataset does not exist" | Script auto-creates on first run |

See full troubleshooting guide in `NOTION_INGEST_README.md`

---
