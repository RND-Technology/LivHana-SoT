### Medium Term (Month 1)

8. **Integrate Email Pipeline**
   - Move `gmail_ingest.js` to integration service
   - Add cron schedule or webhook trigger
   - Create BigQuery tables for email data

9. **Activate Notion Webhooks**
   - Configure Notion integration
   - Test webhook endpoint: `POST /api/notion/webhook`
   - Verify data sync to BigQuery

10. **KAJA Payment Gateway**
    - Build payment processing module
    - Integrate with existing payment flows
    - Add to sync pipeline
