#### Migration Command

```bash
# Dry run (preview changes)
node backend/common/secrets/migrate-to-gcp.js \
  --env-file=backend/integration-service/.env \
  --project-id=livhana-sot \
  --service=integration-service \
  --dry-run

# Actual migration
node backend/common/secrets/migrate-to-gcp.js \
  --env-file=backend/integration-service/.env \
  --project-id=livhana-sot \
  --service=integration-service
```
