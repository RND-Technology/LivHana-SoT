### 3.4 Data Quality: Schema Validation

**File:** `/backend/integration-service/scripts/sync-lightspeed-to-bigquery.js`
**Lines:** 194-205, 284-294

**Current Issue:** No validation before BigQuery insert = data quality issues.

**Improvement:**

```javascript
const Joi = require('joi');

// Transaction schema validation
const transactionSchema = Joi.object({
  id: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  tax: Joi.number().min(0).required(),
  total: Joi.number().min(0).required(),
  customer_id: Joi.string().allow(null),
  status: Joi.string().valid('COMPLETED', 'PENDING').required(),
  created_at: Joi.date().iso().required(),
  updated_at: Joi.date().iso().allow(null)
});

// Validate before insert
function validateTransaction(txn) {
  const { error, value } = transactionSchema.validate(txn);
  if (error) {
    logger.warn('Invalid transaction data', {
      transaction_id: txn.id,
      validation_error: error.message
    });
    return null; // Skip invalid row
  }
  return value;
}

// Apply validation
const validTransactions = transactions
  .map(validateTransaction)
  .filter(txn => txn !== null);

await table.insert(validTransactions, {
  skipInvalidRows: true,
  ignoreUnknownValues: true
});
```

**Quality ROI:**

- Prevents bad data from polluting analytics
- Easier debugging of data issues
- Compliance with data quality SLAs

---
