#### **Prompt 1: Build COA Database & API**
```
Build a Certificate of Analysis (COA) management system with REST API for reggieanddro.com Lightspeed integration.

ARCHITECTURE:
1. Database Schema:
   - Products table (SKU, name, category)
   - COAs table (batch_number, product_id, lab_name, test_date, file_url)
   - Test Results table (coa_id, cannabinoid, percentage, pass_fail)
   - Compliance Status table (coa_id, texas_compliant, federal_compliant)

2. REST API Endpoints:
   - GET /api/coa/:batch_number - Get COA by batch
   - GET /api/coa/product/:sku - Get all COAs for product
   - POST /api/coa - Upload new COA (admin only)
   - GET /api/coa/verify/:batch_number - Verify compliance
   - GET /api/coa/search?q=query - Search COAs

3. Features:
   - Automatic PDF parsing (extract cannabinoid data)
   - Texas compliance validation (<0.3% Delta-9 THC)
   - Batch expiration tracking (COAs expire after 1 year)
   - Alert system for non-compliant batches

TECHNICAL REQUIREMENTS:
- Node.js + Express
- PostgreSQL or MongoDB
- PDF parsing library (pdf-parse or similar)
- JWT authentication for admin endpoints
- CORS enabled for Lightspeed site
- Rate limiting (100 requests/min)

TEXAS COMPLIANCE LOGIC:
```javascript
function isTexasCompliant(coa) {
  const delta9THC = coa.cannabinoids.find(c => c.name === 'Delta-9 THC');
  return delta9THC && delta9THC.percentage < 0.3;
}
```

VALIDATION:
- All products must have valid COA
- COAs must be <1 year old
- Lab must be 3rd-party certified
- All contaminant tests must pass

OUTPUT:
- Complete API implementation
- Database schema with migrations
- API documentation
- Admin dashboard for COA management
```
