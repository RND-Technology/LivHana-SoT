### 2.7 Real-Time Inventory Urgency (Priority: HIGH)

**Current Gap:** 15-minute sync delay prevents "Only 3 left!" urgency messaging.

**Code Location:** `lightspeed-sync-scheduler.js:8` (sync interval hardcoded)

**CONVERSION IMPACT:**

- Cannot display real-time low-stock warnings
- Missing FOMO (fear of missing out) conversion driver
- Product sells out before customers see it's in stock

**OPTIMIZATION OPPORTUNITY:**

```javascript
// backend/integration-service/src/lightspeed-realtime-inventory.js
const EventEmitter = require('events');

class RealtimeInventoryTracker extends EventEmitter {
  constructor() {
    super();
    this.inventoryCache = new Map();
    this.lowStockThreshold = 5;
  }

  async watchInventory() {
    // Poll every 60 seconds for low-stock items
    setInterval(async () => {
      const lowStockItems = await this.fetchLowStockItems();
      lowStockItems.forEach(item => {
        if (item.quantity <= this.lowStockThreshold) {
          this.emit('low-stock', {
            product_id: item.id,
            quantity: item.quantity,
            urgency_level: item.quantity <= 2 ? 'CRITICAL' : 'LOW'
          });
        }
      });
    }, 60000); // 1-minute polling for hot items
  }

  async fetchLowStockItems() {
    const client = createLightspeedClient();
    const response = await client.get('/Item.json', {
      params: {
        load_relations: '["ItemShops"]',
        'ItemShops.qoh': '<,5'  // Quantity on hand < 5
      }
    });
    return response.data.Item || [];
  }
}

// Integration with frontend
io.on('connection', (socket) => {
  inventoryTracker.on('low-stock', (data) => {
    socket.emit('inventory-update', {
      product_id: data.product_id,
      message: `Only ${data.quantity} left!`,
      urgency: data.urgency_level
    });
  });
});
```

**ROI PROJECTION:**

- **Dev Time:** 10 hours
- **Revenue Impact:** +$12K/month from urgency-driven conversions (3-5% lift typical for FOMO messaging)
- **Conversion Rate:** +3-5% on low-stock items

---
