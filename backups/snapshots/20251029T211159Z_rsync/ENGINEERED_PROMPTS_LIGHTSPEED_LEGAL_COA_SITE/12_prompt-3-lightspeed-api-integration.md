#### **Prompt 3: Lightspeed API Integration**

```
Integrate COA (Certificate of Analysis) data with Lightspeed POS API to display lab results on reggieanddro.com product pages.

INTEGRATION STEPS:
1. Lightspeed API Authentication:
   - OAuth 2.0 flow
   - Store refresh tokens securely
   - Handle token expiration

2. Product Sync:
   - Fetch all products from Lightspeed
   - Match products to COA database by SKU
   - Update product metadata with COA data

3. Custom Fields in Lightspeed:
   - Add "coa_batch_number" custom field
   - Add "texas_compliant" boolean field
   - Add "coa_url" field (link to full report)
   - Add "last_test_date" field

4. Real-Time Updates:
   - Webhook from COA system → update Lightspeed when new COA uploaded
   - Webhook from Lightspeed → update COA system when new product added
   - Bi-directional sync

5. Website Display:
   - Inject COA data into Lightspeed product template
   - Display compliance badges on product pages
   - Add "View Lab Report" button

TECHNICAL:
- Lightspeed API: https://developers.lightspeedhq.com/retail/
- OAuth 2.0 implementation
- Webhook handling
- Error handling and retry logic

LIGHTSPEED CUSTOM THEME:
```javascript
// Inject COA data into product page
const coaData = fetch(`/api/coa/product/${productSKU}`);
if (coaData.texas_compliant) {
  displayComplianceBadge('Texas Legal ✓');
  addViewReportButton(coaData.coa_url);
}
```

OUTPUT:

- Lightspeed API integration module
- Webhook handlers
- Custom theme modifications
- Sync scheduling (cron jobs)

```

---
