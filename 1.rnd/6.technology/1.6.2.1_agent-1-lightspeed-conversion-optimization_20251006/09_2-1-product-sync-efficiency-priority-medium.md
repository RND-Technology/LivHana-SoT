### 2.1 Product Sync Efficiency (Priority: MEDIUM)

**Current Implementation** (`sync-lightspeed-to-bigquery.js:239-305`):

```javascript
// Fetches ALL products every sync
while (hasMore) {
  const params = {
    load_relations: '["ItemShops","Category"]',
    limit: 100,
    offset: offset
  };
  const response = await client.get('/Item.json', { params });
  // Processes entire catalog every 15 minutes
}
```

**BOTTLENECK:** Full catalog sync every 15 minutes wastes API calls and processing time.

**IMPACT ON CONVERSION:**

- Slow product updates (15min lag on price changes)
- API rate limits could block critical syncs during high-traffic periods
- No real-time inventory for "low stock" urgency messaging

**OPTIMIZATION OPPORTUNITY:**

```javascript
// Incremental sync with change detection
const lastSync = await getLastSyncTimestamp();
const params = {
  load_relations: '["ItemShops","Category"]',
  timeStamp: `>,${lastSync}`,  // Only fetch updated products
  limit: 100
};
```

**ROI PROJECTION:**

- **Dev Time:** 4 hours
- **Revenue Impact:** +$5K/month from real-time inventory urgency
- **Cost Savings:** 80% reduction in API calls (avoid rate limits)
