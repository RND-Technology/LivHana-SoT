### 2.2 Product Inventory Sync

**Inventory Data Flow:**

```
Square Catalog      →  BigQuery (square_items)  →  Frontend API
Lightspeed Items    →  BigQuery (lightspeed_products)  →  Frontend API

Sync Frequency: Every 15 minutes (configurable via SQUARE_SYNC_SCHEDULE)
Cache TTL: 30 seconds (CACHE_TTL_MS)
Fallback: Mock product data on sync failure
```

**Product Schema Consistency:**

```javascript
// Unified product model (transformed from both sources)
{
  id: STRING (source-specific ID),
  name: STRING (product name),
  description: STRING (marketing description),
  category: STRING (Hemp Product, THCA Flower, etc.),
  price: FLOAT (in dollars, not cents),
  currency: STRING (USD),
  sku: STRING (stock keeping unit),
  available: BOOLEAN (in stock),
  inventory: INTEGER (quantity on hand),
  attributes: ARRAY<Object> (custom attributes),
  updated_at: TIMESTAMP (last sync time)
}
```

**Inventory Sync Logic:**

```javascript
// integration-service/src/bigquery_live.js:166-197
async function fetchProductData() {
  const catalogQuery = `
    SELECT
      id, name, category, sku, price, available,
      created_at, updated_at
    FROM \`${PROJECT_ID}.${DATASET}.${ITEMS_TABLE}\`
    WHERE name IS NOT NULL
    ORDER BY updated_at DESC
    LIMIT 200
  `;

  const [items] = await client.query({ query: catalogQuery, location: LOCATION });

  return {
    products: items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price ? Number(item.price) / 100 : 0, // Convert cents to dollars
      sku: item.sku || '',
      category: item.category || 'Hemp Product',
      updated_at: item.updated_at
    })),
    topSellers: [] // Requires sales data aggregation
  };
}
```

**Critical Business Rules:**

1. **Price Conversion:** Always convert cents (Square) → dollars (frontend)
2. **Null Safety:** Default to 'Hemp Product' if category missing
3. **Availability Flag:** `available` field determines if product can be purchased
4. **Inventory Deduction:** Handled by POS system (Square/Lightspeed), synced to BigQuery
5. **SKU Uniqueness:** SKU should be unique per product variant

**Data Consistency Risks:**

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Sync lag (up to 15min) | Overselling low stock items | Real-time inventory checks at checkout |
| Price drift | Revenue loss or customer complaints | Price lock at cart add, not at checkout |
| Catalog changes | Broken product links | Graceful 404 handling, "Product unavailable" |
| BigQuery insert failures | Missing products | Retry with exponential backoff, alert on failure |

---
