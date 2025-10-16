### 2.6 Texas Market-Specific Optimization (Priority: MEDIUM)

**Current Gap:** Generic product catalog with no Texas-specific positioning.

**Missing Features:**

- Texas-themed product categorization ("Brick Weed," "Texas Gold," "Lone Star OG")
- Compliance labeling (THC%, COA badge, age gate)
- Local pickup optimization (Stone Oak + Alice locations)
- Veteran discount flag

**Code Location:** `sync-lightspeed-to-bigquery.js:284-294` (product mapping)

**OPTIMIZATION OPPORTUNITY:**

```javascript
// Enhanced product mapping with Texas positioning
products.push({
  id: String(item.itemID),
  name: item.description || 'Unknown Product',
  description: item.longDescription || null,
  category: item.Category?.name || null,

  // ADD TEXAS MARKET FIELDS
  price_tier: categorizePriceTier(parseFloat(defaultShop?.defaultCost || 0)),
  texas_tier_name: getTexasTierName(item.Category?.name),  // "Brick Weed", "Texas Gold", "Lone Star OG"
  is_veteran_discount_eligible: item.customAttributes?.veteran_friendly || false,
  thc_percentage: item.customAttributes?.thc_percent || null,
  coa_url: item.customAttributes?.coa_link || null,
  pickup_locations: ['Stone Oak', 'Alice'],

  price: parseFloat(defaultShop?.defaultCost || item.defaultCost || 0),
  cost: parseFloat(defaultShop?.cost || item.cost || 0),
  quantity: parseInt(defaultShop?.qoh || 0),
  created_at: item.createTime || new Date().toISOString(),
  updated_at: item.updateTime || null
});

function categorizePriceTier(price) {
  const pricePerOz = price; // Assuming price is per oz
  if (pricePerOz < 75) return 'BRICK_WEED';
  if (pricePerOz < 150) return 'VALUE_FLOWER';
  return 'TOP_SHELF';
}

function getTexasTierName(category) {
  const tierMap = {
    'BRICK_WEED': 'Brick Weed',
    'VALUE_FLOWER': 'Texas Gold',
    'TOP_SHELF': 'Lone Star Premium'
  };
  return tierMap[categorizePriceTier()] || category;
}
```

**ROI PROJECTION:**

- **Dev Time:** 6 hours
- **Revenue Impact:** +$15K/month from Texas-specific positioning (unique "Brick Weed" messaging per Texas Takeover plan)
- **Conversion Rate:** +5-8% from veteran discount visibility
