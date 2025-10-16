### Build Delivery Middleware (if needed)

**File:** `backend/integration-service/lightspeed-delivery-middleware.js`

**Function:**
```javascript
// Sync Lightspeed orders → DoorDash Drive API

const express = require('express');
const axios = require('axios');

const deliveryRouter = express.Router();

// Lightspeed webhook: new order created
deliveryRouter.post('/webhook/lightspeed/new-order', async (req, res) => {
    const order = req.body;

    // Check if delivery order
    if (order.deliveryType === 'delivery') {
        // Create DoorDash Drive delivery
        const doordashOrder = {
            external_delivery_id: order.orderId,
            pickup_address: 'YOUR_STORE_ADDRESS',
            pickup_phone: 'YOUR_STORE_PHONE',
            dropoff_address: order.customerAddress,
            dropoff_phone: order.customerPhone,
            order_value: order.total,
            tip: order.tip || 0,
            items: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        const response = await axios.post(
            'https://openapi.doordash.com/drive/v2/deliveries',
            doordashOrder,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.DOORDASH_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ success: true, deliveryId: response.data.id });
    } else {
        res.json({ success: true, message: 'Not a delivery order' });
    }
});

module.exports = deliveryRouter;
```

**Deployment:**
```bash
cd backend/integration-service
npm install axios express
# Add to main server: app.use('/api/delivery', deliveryRouter);
```

---
