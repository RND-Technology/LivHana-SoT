### Backend: Order Processing Middleware

```javascript
// backend/order-service/middleware/age-verification.js
const axios = require('axios');

const INTEGRATION_SERVICE_URL = process.env.INTEGRATION_SERVICE_URL || 'http://localhost:3005';

async function requireAgeVerification(req, res, next) {
  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({
      error: 'Customer ID required'
    });
  }

  try {
    // Check age verification status
    const response = await axios.get(
      `${INTEGRATION_SERVICE_URL}/api/age-verification/status/${customerId}`,
      {
        headers: {
          'Authorization': req.headers.authorization
        }
      }
    );

    const verification = response.data;

    if (!verification.verified || verification.expired) {
      return res.status(403).json({
        error: 'Age verification required',
        message: 'Please complete age verification before placing an order',
        requiresVerification: true,
        verificationUrl: '/age-verification'
      });
    }

    // Verification passed - add to request for logging
    req.ageVerification = {
      verificationId: verification.verificationId,
      verifiedAt: verification.verifiedAt,
      age: verification.age
    };

    next();
  } catch (error) {
    if (error.response?.status === 404) {
      // Customer not verified
      return res.status(403).json({
        error: 'Age verification required',
        message: 'Please complete age verification before placing an order',
        requiresVerification: true
      });
    }

    console.error('Age verification check failed:', error);
    return res.status(500).json({
      error: 'Unable to verify age',
      message: 'Please try again later'
    });
  }
}

module.exports = { requireAgeVerification };
```
