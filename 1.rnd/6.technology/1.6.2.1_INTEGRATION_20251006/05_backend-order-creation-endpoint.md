### Backend: Order Creation Endpoint

```javascript
// backend/order-service/routes/orders.js
const express = require('express');
const { requireAgeVerification } = require('../middleware/age-verification');
const { authMiddleware } = require('../../common/auth/middleware');

const router = express.Router();

router.post('/api/orders',
  authMiddleware({ logger }),
  requireAgeVerification,
  async (req, res) => {
    const { customerId, items, shippingAddress } = req.body;

    try {
      // Create order
      const order = await createOrder({
        customerId,
        items,
        shippingAddress,
        ageVerificationId: req.ageVerification.verificationId,
        verifiedAge: req.ageVerification.age
      });

      // Log successful order with verification
      logger.info({
        orderId: order.id,
        customerId,
        verificationId: req.ageVerification.verificationId,
        age: req.ageVerification.age
      }, 'Order created with age verification');

      res.json({
        success: true,
        order
      });
    } catch (error) {
      logger.error({ error: error.message }, 'Order creation failed');
      res.status(500).json({
        error: 'Failed to create order'
      });
    }
  }
);

module.exports = router;
```

---
