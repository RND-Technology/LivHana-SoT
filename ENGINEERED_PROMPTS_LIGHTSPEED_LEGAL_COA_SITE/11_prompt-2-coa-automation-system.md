#### **Prompt 2: COA Automation System**
```
Build an automated COA (Certificate of Analysis) ingestion and validation system for reggieanddro.com.

WORKFLOW:
1. Lab Email Integration:
   - Monitor email inbox for lab reports
   - Parse PDF attachments
   - Extract batch number from filename/content
   - Match to product SKU

2. PDF Data Extraction:
   - Extract cannabinoid profile (THC, CBD, CBG, etc.)
   - Extract terpene profile
   - Extract contaminant test results (pesticides, heavy metals, microbials)
   - Extract lab info (name, date, certification number)

3. Automatic Validation:
   - Verify Delta-9 THC <0.3% (Texas HB 1325)
   - Check all contaminant tests passed
   - Verify lab is certified/accredited
   - Flag any non-compliant results

4. Database Storage:
   - Store PDF in cloud storage (S3 or GCS)
   - Store extracted data in structured database
   - Link to product SKU
   - Set expiration date (1 year from test date)

5. Notifications:
   - Alert admin if non-compliant batch detected
   - Notify when COA expires (30 days before)
   - Alert if product missing COA

TECHNICAL STACK:
- Email monitoring: IMAP/Gmail API
- PDF parsing: pdf-parse or Tesseract OCR
- Cloud storage: Google Cloud Storage
- Database: PostgreSQL
- Notifications: SendGrid or Twilio

AI ENHANCEMENT (Optional):
- Use GPT-4 Vision to parse complex COA formats
- Automatic batch number recognition
- Intelligent product matching

OUTPUT:
- Complete automation pipeline
- Admin dashboard for manual review
- Error handling and retry logic
- Monitoring and alerting
```
