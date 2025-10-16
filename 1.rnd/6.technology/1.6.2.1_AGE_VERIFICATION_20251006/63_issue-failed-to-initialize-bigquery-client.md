### Issue: "Failed to initialize BigQuery client"

**Solution:** Check service account credentials:

```bash
# Verify file exists
ls -la $GOOGLE_APPLICATION_CREDENTIALS

# Test BigQuery connection
gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
bq ls
```
