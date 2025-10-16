### Environment Variables

```bash
# Required
[REDACTED - SECURITY BREACH]
JWT_SECRET=secret                    # JWT signing secret
JWT_AUDIENCE=livhana-api            # JWT audience
JWT_ISSUER=livhana-auth             # JWT issuer

# Optional Features
ENABLE_BIGQUERY_MEMORY=true         # Enable BigQuery learning storage
GOOGLE_APPLICATION_CREDENTIALS=...  # BigQuery credentials
ENABLE_SELF_IMPROVEMENT=true        # Enable self-improvement loop

# Limits
MAX_CONCURRENT_TASKS=5              # Max parallel tasks
TASK_TIMEOUT_MS=600000              # 10 minutes
MAX_FILE_SIZE_MB=10                 # Max file size to read/write
```
