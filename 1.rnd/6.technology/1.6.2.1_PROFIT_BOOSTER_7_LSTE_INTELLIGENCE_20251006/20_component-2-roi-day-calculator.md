### **Component 2: ROI/$/Day Calculator**

**File:** `backend/review-intelligence/src/roi-calculator.js`
**Purpose:** Calculate ROI/$/Day for each batch/SKU

**Algorithm:**

```javascript
function calculateROI(batch) {
  // 1. Get transaction data from Square
  const transactions = await getSquareTransactions(batch.sku);
  const revenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const unitsSold = transactions.length;

  // 2. Get cost data (wholesale price)
  const cost = batch.wholesale_price * batch.units;

  // 3. Calculate days to sell out
  const firstSale = transactions[0].date;
  const lastSale = transactions[transactions.length - 1].date;
  const daysToSellOut = (lastSale - firstSale) / (1000 * 60 * 60 * 24);

  // 4. Get LSTE score (engagement multiplier)
  const reviews = await getReviews(batch.sku);
  const avgLSTE = reviews.reduce((sum, r) => sum + r.metrics.effect, 0) / reviews.length;
  const engagementMultiplier = avgLSTE / 3; // 3 is baseline (1x multiplier)

  // 5. Calculate ROI/$/Day
  const profit = revenue - cost;
  const baseROI = profit / (daysToSellOut * cost);
  const adjustedROI = baseROI * engagementMultiplier;

  return {
    batch: batch.sku,
    revenue,
    cost,
    profit,
    daysToSellOut,
    baseROI: `${(baseROI * 100).toFixed(2)}%`,
    avgLSTE,
    engagementMultiplier: `${engagementMultiplier.toFixed(2)}x`,
    adjustedROI: `${(adjustedROI * 100).toFixed(2)}%`,
    recommendation: adjustedROI > 0.30 ? 'BUY MORE' : 'SKIP'
  };
}
```

**API Endpoints:**

```javascript
GET /api/roi/batch/:sku     // Get ROI for specific batch
GET /api/roi/top-performers // Get top 10 batches by ROI
GET /api/roi/recommendations // Get buy/skip recommendations
POST /api/roi/forecast      // Forecast ROI for new batch
```

---
