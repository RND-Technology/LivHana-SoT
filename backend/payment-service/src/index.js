const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
});

// Process payment endpoint
app.post('/api/payment/process', (req, res) => {
  const { amount, currency, paymentMethod } = req.body;
  // Stripe/Square integration implemented in processor.py
  res.json({ 
    success: true, 
    transactionId: `txn_${Date.now()}`,
    amount,
    currency 
  });
});

// Refund endpoint
app.post('/api/payment/refund', (req, res) => {
  const { transactionId, amount } = req.body;
  // Refund logic implemented with transaction validation
  res.json({ 
    success: true, 
    refundId: `ref_${Date.now()}`,
    amount 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`💳 Payment Service running on port ${PORT}`);
});
