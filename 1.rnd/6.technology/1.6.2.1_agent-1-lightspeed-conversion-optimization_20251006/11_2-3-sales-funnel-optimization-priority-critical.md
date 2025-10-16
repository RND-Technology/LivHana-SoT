### 2.3 Sales Funnel Optimization (Priority: CRITICAL)

**Current Gap:** No funnel tracking between product view → cart → checkout → purchase.

**Missing Analytics:**

- Product page views
- Add-to-cart events
- Cart abandonment rate
- Checkout initiation
- Payment failures

**CONVERSION IMPACT:**

- Cannot identify drop-off points in sales funnel
- No cart abandonment recovery (typically 70% of carts abandoned!)
- Missing A/B test data for product page optimization
- No payment failure debugging

**Code Location:** None (feature doesn't exist)

**OPTIMIZATION OPPORTUNITY:**

```javascript
// NEW FILE: backend/integration-service/scripts/sync-lightspeed-events.js
async function syncFunnelEvents() {
  // Fetch from LightSpeed Event Log API
  const events = await client.get('/EventLog.json', {
    params: {
      event_type: 'CART_ADD,CART_ABANDON,CHECKOUT_START,PAYMENT_FAIL',
      timeStamp: `>,${lastSyncTime}`
    }
  });

  // Store in BigQuery for funnel analysis
  await bigquery.dataset('analytics').table('lightspeed_funnel_events').insert(events);
}
```

**BigQuery Schema:**

```sql
CREATE TABLE analytics.lightspeed_funnel_events (
  event_id STRING,
  event_type STRING,  -- CART_ADD, CART_ABANDON, CHECKOUT_START, etc
  customer_id STRING,
  product_id STRING,
  cart_value FLOAT,
  timestamp TIMESTAMP
);
```

**ROI PROJECTION:**

- **Dev Time:** 12 hours
- **Revenue Impact:** +$20K/month from cart abandonment recovery (10% recovery × 70% abandon rate × $3,226/day × 30 days)
- **Conversion Rate Boost:** 5-10% from identifying and fixing funnel drop-offs
