### 2.2 Customer Data Enrichment (Priority: CRITICAL)

**Current Gap:** Customer ID captured but no enrichment for segmentation.

**Missing Fields:**

- Email (for remarketing)
- Phone (for SMS campaigns)
- First/last purchase date (for win-back campaigns)
- Total lifetime value (for VIP identification)
- Purchase frequency (for subscription targeting)
- Preferred product categories (for personalization)

**CONVERSION IMPACT:**

- Cannot identify high-value customers for VIP treatment
- No data for "win back lapsed customers" campaign (11,348 past customers!)
- Missing segmentation for targeted email campaigns
- No loyalty program eligibility tracking

**Code Location:** `sync-lightspeed-to-bigquery.js:194-205`

**OPTIMIZATION OPPORTUNITY:**

```javascript
// Current transaction sync (Line 194-205)
transactions.push({
  id: String(sale.saleID),
  amount: parseFloat(sale.calcSubtotal || 0),
  tax: parseFloat(sale.calcTax || 0),
  total: parseFloat(sale.calcTotal || 0),
  customer_id: sale.customerID ? String(sale.customerID) : null,
  status: sale.completed === 'true' ? 'COMPLETED' : 'PENDING',
  created_at: sale.createTime || new Date().toISOString(),
  updated_at: sale.updateTime || null
});

// ENHANCED VERSION with customer enrichment
transactions.push({
  id: String(sale.saleID),
  amount: parseFloat(sale.calcSubtotal || 0),
  tax: parseFloat(sale.calcTax || 0),
  total: parseFloat(sale.calcTotal || 0),
  customer_id: sale.customerID ? String(sale.customerID) : null,
  customer_email: sale.Customer?.emailAddress || null,  // ADD
  customer_phone: sale.Customer?.phone || null,         // ADD
  customer_first_name: sale.Customer?.firstName || null, // ADD
  customer_last_name: sale.Customer?.lastName || null,  // ADD
  payment_type: sale.SalePayments?.[0]?.paymentType || null, // ADD
  line_items: sale.SaleLines?.SaleLine?.length || 0,    // ADD
  status: sale.completed === 'true' ? 'COMPLETED' : 'PENDING',
  created_at: sale.createTime || new Date().toISOString(),
  updated_at: sale.updateTime || null
});
```

**BigQuery Schema Enhancement:**

```sql
-- Add to lightspeed_transactions table
ALTER TABLE analytics.lightspeed_transactions
ADD COLUMN customer_email STRING,
ADD COLUMN customer_phone STRING,
ADD COLUMN customer_first_name STRING,
ADD COLUMN customer_last_name STRING,
ADD COLUMN payment_type STRING,
ADD COLUMN line_items INTEGER;
```

**ROI PROJECTION:**

- **Dev Time:** 8 hours
- **Revenue Impact:** +$30K/month from targeted remarketing to 11,348 customers
- **Conversion Rate:** 4.4% email conversion (per Texas Takeover plan) = 500 customers × $150 AOV = $75K/month potential
