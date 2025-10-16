### 4.4 Local Pickup Optimization

**Opportunity:** Stone Oak + Alice locations for same-day pickup (competitive advantage).

**Implementation:**

```javascript
// backend/integration-service/src/local-pickup-optimizer.js

const PICKUP_LOCATIONS = {
  stone_oak: {
    name: 'Stone Oak - San Antonio',
    address: '123 Stone Oak Pkwy, San Antonio, TX',
    hours: 'Mon-Sat 10am-8pm, Sun 12pm-6pm',
    inventory_buffer: 0.9  // Hold 10% inventory for walk-ins
  },
  alice: {
    name: 'Alice Location',
    address: '456 Main St, Alice, TX',
    hours: 'Mon-Sat 11am-7pm',
    inventory_buffer: 0.85  // Hold 15% for walk-ins
  }
};

async function getLocalPickupInventory(product_id, location) {
  const query = `
    SELECT quantity
    FROM \`${PROJECT_ID}.analytics.lightspeed_products\`
    WHERE id = @product_id
  `;

  const [rows] = await bigquery.query({
    query,
    params: { product_id },
    location: LOCATION
  });

  const totalQty = rows[0]?.quantity || 0;
  const availableForPickup = Math.floor(totalQty * PICKUP_LOCATIONS[location].inventory_buffer);

  return {
    available: availableForPickup > 0,
    quantity: availableForPickup,
    location: PICKUP_LOCATIONS[location]
  };
}

// Frontend API endpoint
router.get('/api/pickup/availability/:productId/:location', async (req, res) => {
  const { productId, location } = req.params;
  const inventory = await getLocalPickupInventory(productId, location);

  res.json({
    success: true,
    pickup_available: inventory.available,
    quantity_available: inventory.quantity,
    location_details: inventory.location,
    message: inventory.available
      ? `Pick up today at ${inventory.location.name}!`
      : 'Online shipping available (2-3 days)'
  });
});
```

**ROI Projection:**

- **Conversion Lift:** +15-20% for local customers (same-day pickup urgency)
- **Revenue Impact:** +$10K/month from local pickup conversions
- **Cost Savings:** No shipping costs on pickup orders (~$5/order × 200 orders = $1K/month saved)

---
