#### **Prompt 2: Set Up COA Data Pipeline**
```
Set up a data pipeline for automatic COA (Certificate of Analysis) ingestion and validation for reggieanddro.com.

PIPELINE STAGES:
1. Ingestion:
   - Cloud Function triggered by email (Gmail API)
   - Extract PDF attachments
   - Upload to Cloud Storage bucket
   - Trigger processing

2. Processing:
   - Cloud Function triggered by Storage upload
   - Parse PDF using Cloud Vision API or pdf-parse
   - Extract cannabinoid data
   - Validate against Texas compliance (<0.3% THC)

3. Storage:
   - Store structured data in Cloud SQL/Firestore
   - Store PDFs in Cloud Storage (versioned)
   - Index for fast search

4. Notification:
   - Pub/Sub topic for new COA events
   - Email notification to admin
   - Slack webhook (optional)
   - Update Lightspeed product via API

INFRASTRUCTURE:
- Cloud Functions (Node.js 20)
- Cloud Storage bucket (gs://reggieanddro-coa-pdfs)
- Cloud SQL PostgreSQL or Firestore
- Pub/Sub topics
- Cloud Scheduler (for periodic checks)

ERROR HANDLING:
- Retry failed PDF parsing (3 attempts)
- Dead letter queue for failures
- Alert admin on parsing errors
- Manual review queue for uncertain results

MONITORING:
- Cloud Monitoring dashboards
- Alert on pipeline failures
- Track processing time metrics
- Log all COA uploads

OUTPUT:
- Complete data pipeline deployed
- Monitoring dashboards
- Error handling and alerting
- Pipeline documentation
```

---
