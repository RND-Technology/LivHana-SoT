### LAYER 1: R&D (REGGIE & DRO) - REVENUE ENGINE

**Project Structure:**

```
reggie-dro-main/
├── frontend/
│   ├── index.html
│   ├── styles/
│   │   ├── main.css
│   │   └── mobile.css
│   └── js/
│       ├── age-verification.js
│       └── square-integration.js
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── verification.js
│   │   ├── payments.js
│   │   └── compliance.js
│   └── middleware/
│       ├── age-gate.js
│       └── compliance.js
├── config/
│   ├── square.config.js
│   └── database.config.js
├── package.json
└── replit.nix
```

**Core Implementation Files:**

**1. Age Verification Microservice ([PURGED_FALLACY] Replacement)**

```javascript
// backend/routes/verification.js
const express = require('express');
const router = express.Router();

// Square native age verification endpoint
router.post('/verify-age', async (req, res) => {
  const { birthDate, customerInfo, documentPhoto } = req.body;
  
  try {
    // Calculate age with timezone handling
    const today = new Date();
    const birth = new Date(birthDate);
    const age = calculatePreciseAge(today, birth);
    
    // Texas hemp law: 21+ required
    const isVerified = age >= 21;
    
    // Compliance logging for audit trail
    const verificationLog = {
      timestamp: new Date().toISOString(),
      customerEmail: customerInfo.email,
      ageCalculated: age,
      verificationResult: isVerified,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    // Store in compliance database
    await logVerification(verificationLog);
    
    if (isVerified) {
      // Generate secure session token
      const sessionToken = generateSecureToken(customerInfo);
      
      res.json({
        verified: true,
        age: age,
        sessionToken: sessionToken,
        message: "Age verification successful",
        redirectUrl: "/checkout",
        complianceId: verificationLog.timestamp
      });
    } else {
      res.json({
        verified: false,
        age: age,
        message: "You must be 21+ to purchase hemp products in Texas",
        redirectUrl: "/age-restriction",
        complianceId: verificationLog.timestamp
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Verification service unavailable',
      message: 'Please try again later'
    });
  }
});

function calculatePreciseAge(today, birthDate) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

function generateSecureToken(customerInfo) {
  // Implementation with crypto for session management
  const crypto = require('crypto');
  const payload = JSON.stringify({
    email: customerInfo.email,
    timestamp: Date.now(),
    verified: true
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

async function logVerification(log) {
  // Store in Replit Database or external compliance system
  // This creates audit trail for regulatory compliance
  console.log('COMPLIANCE LOG:', JSON.stringify(log));
}

module.exports = router;
```

**2. Square Integration Service**

```javascript
// backend/routes/payments.js
const express = require('express');
const { Client, Environment } = require('square');
const router = express.Router();

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production // or Sandbox for testing
});

const paymentsApi = client.paymentsApi;
const ordersApi = client.ordersApi;
const customersApi = client.customersApi;

// Process hemp product purchase
router.post('/process-payment', async (req, res) => {
  const { token, amount, customerInfo, items } = req.body;
  
  try {
    // Verify age verification session
    const ageVerified = await verifyAgeSession(req.headers.authorization);
    if (!ageVerified) {
      return res.status(403).json({ error: 'Age verification required' });
    }
    
    // Create Square order
    const order = await ordersApi.createOrder({
      locationId: process.env.SQUARE_LOCATION_ID,
      order: {
        referenceId: `hemp-${Date.now()}`,
        lineItems: items.map(item => ({
          name: item.name,
          quantity: item.quantity.toString(),
          basePriceMoney: {
            amount: item.price,
            currency: 'USD'
          },
          metadata: {
            productType: 'hemp',
            thcContent: item.thcContent,
            complianceCheck: 'verified'
          }
        }))
      }
    });
    
    // Process payment
    const payment = await paymentsApi.createPayment({
      sourceId: token,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: amount,
        currency: 'USD'
      },
      orderId: order.result.order.id
    });
    
    // Log for compliance and analytics
    await logHempSale({
      orderId: order.result.order.id,
      paymentId: payment.result.payment.id,
      customerAge: customerInfo.age,
      items: items,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      paymentId: payment.result.payment.id,
      orderId: order.result.order.id,
      receiptUrl: payment.result.payment.receiptUrl
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

module.exports = router;
```

**3. Compliance Middleware**

```javascript
// backend/middleware/compliance.js
const rateLimit = require('express-rate-limit');

// Age gate enforcement
const enforceAgeGate = (req, res, next) => {
  const ageVerified = req.session?.ageVerified || false;
  const exemptPaths = ['/age-verification', '/verify-age', '/health'];
  
  if (exemptPaths.includes(req.path) || ageVerified) {
    next();
  } else {
    res.redirect('/age-verification');
  }
};

// Rate limiting for verification attempts
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: {
    error: 'Too many verification attempts',
    retryAfter: 15 * 60 * 1000
  }
});

// THC content compliance checker
const validateTHCContent = (req, res, next) => {
  if (req.body.items) {
    const invalidItems = req.body.items.filter(item => {
      return parseFloat(item.thcContent) > 0.3; // Federal hemp limit
    });
    
    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: 'Product THC content exceeds legal limits',
        invalidItems: invalidItems
      });
    }
  }
  next();
};

module.exports = {
  enforceAgeGate,
  verificationLimiter,
  validateTHCContent
};
```

**4. Frontend Age Verification**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Age Verification - Reggie & Dro</title>
    <link rel="stylesheet" href="styles/main.css">
    <style>
        .verification-container {
            max-width: 500px;
            margin: 50px auto;
            padding: 40px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            color: white;
            text-align: center;
        }
        
        .logo {
            width: 120px;
            margin-bottom: 30px;
        }
        
        .verification-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .form-group {
            text-align: left;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            background: rgba(255,255,255,0.9);
        }
        
        .verify-btn {
            background: #28a745;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .verify-btn:hover {
            background: #218838;
            transform: translateY(-2px);
        }
        
        .verify-btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        
        .legal-notice {
            margin-top: 30px;
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.4;
        }
        
        .error-message {
            background: #dc3545;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
        }
        
        .success-message {
            background: #28a745;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="verification-container">
        <img src="/images/logo.png" alt="Reggie & Dro" class="logo">
        <h1>Age Verification Required</h1>
        <p>You must be 21 or older to access this website and purchase hemp products in Texas.</p>
        
        <form class="verification-form" id="verificationForm">
            <div class="form-group">
                <label for="birthDate">Date of Birth:</label>
                <input type="date" id="birthDate" name="birthDate" required max="2003-01-01">
            </div>
            
            <div class="form-group">
                <label for="email">Email Address:</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="zipCode">ZIP Code:</label>
                <input type="text" id="zipCode" name="zipCode" required pattern="[0-9]{5}">
            </div>
            
            <button type="submit" class="verify-btn" id="verifyBtn">
                Verify My Age
            </button>
        </form>
        
        <div class="error-message" id="errorMessage"></div>
        <div class="success-message" id="successMessage"></div>
        
        <div class="legal-notice">
            <p><strong>Legal Notice:</strong> By entering this website, you certify that you are 21 years of age or older and agree to our Terms of Service and Privacy Policy. Hemp products have not been evaluated by the FDA and are not intended to diagnose, treat, cure, or prevent any disease.</p>
            <p><strong>Texas Compliance:</strong> All products comply with the Texas Department of State Health Services hemp regulations and contain less than 0.3% Delta-9 THC by dry weight.</p>
        </div>
    </div>

    <script>
        document.getElementById('verificationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const birthDate = formData.get('birthDate');
            const email = formData.get('email');
            const zipCode = formData.get('zipCode');
            
            const verifyBtn = document.getElementById('verifyBtn');
            const errorMsg = document.getElementById('errorMessage');
            const successMsg = document.getElementById('successMessage');
            
            // Reset messages
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';
            
            // Disable button during verification
            verifyBtn.disabled = true;
            verifyBtn.textContent = 'Verifying...';
            
            try {
                const response = await fetch('/api/verify-age', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        birthDate: birthDate,
                        customerInfo: {
                            email: email,
                            zipCode: zipCode
                        }
                    })
                });
                
                const result = await response.json();
                
                if (result.verified) {
                    successMsg.textContent = result.message;
                    successMsg.style.display = 'block';
                    
                    // Store verification in session
                    sessionStorage.setItem('ageVerified', 'true');
                    sessionStorage.setItem('customerInfo', JSON.stringify({
                        email: email,
                        age: result.age,
                        verifiedAt: new Date().toISOString()
                    }));
                    
                    // Redirect to main site after brief delay
                    setTimeout(() => {
                        window.location.href = result.redirectUrl || '/';
                    }, 2000);
                } else {
                    errorMsg.textContent = result.message;
                    errorMsg.style.display = 'block';
                }
            } catch (error) {
                console.error('Verification error:', error);
                errorMsg.textContent = 'Verification service is temporarily unavailable. Please try again later.';
                errorMsg.style.display = 'block';
            } finally {
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Verify My Age';
            }
        });
        
        // Check if already verified
        if (sessionStorage.getItem('ageVerified') === 'true') {
            const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
            const verifiedAt = new Date(customerInfo.verifiedAt);
            const now = new Date();
            const hoursSinceVerification = (now - verifiedAt) / (1000 * 60 * 60);
            
            // Verification valid for 24 hours
            if (hoursSinceVerification < 24) {
                window.location.href = '/';
            } else {
                sessionStorage.removeItem('ageVerified');
                sessionStorage.removeItem('customerInfo');
            }
        }
    </script>
</body>
</html>
```
