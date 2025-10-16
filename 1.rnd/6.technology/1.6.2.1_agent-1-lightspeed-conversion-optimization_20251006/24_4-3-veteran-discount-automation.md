### 4.3 Veteran Discount Automation

**Opportunity:** Texas has large veteran population. Automatic discount = goodwill + conversion.

**Implementation:**

```javascript
// backend/integration-service/src/veteran-discount.js

async function applyVeteranDiscount(transaction) {
  // Check if customer is verified veteran
  const customer = await getCustomerByID(transaction.customer_id);

  if (customer.is_veteran_verified) {
    const discount = transaction.amount * 0.10; // 10% veteran discount

    await applyDiscount(transaction.id, {
      type: 'VETERAN_DISCOUNT',
      amount: discount,
      message: 'Thank you for your service - 10% veteran discount applied'
    });

    logger.info('Veteran discount applied', {
      customer_id: transaction.customer_id,
      discount_amount: discount
    });
  }
}

// Integrate with sync pipeline
async function syncTransactions() {
  // ... existing sync code ...

  // Post-process transactions for discounts
  for (const txn of transactions) {
    await applyVeteranDiscount(txn);
  }
}
```

**ROI Projection:**

- **Cost:** 10% discount on ~5% of orders = 0.5% revenue reduction
- **Benefit:** Goodwill marketing + viral growth (veterans share discount)
- **Net Impact:** +2-3% conversion rate from veteran community word-of-mouth
- **Revenue:** +$5K/month from veteran customer acquisition
