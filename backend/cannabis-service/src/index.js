const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'cannabis-service',
    timestamp: new Date().toISOString()
  });
});

// Age verification endpoint
app.post('/api/verify/age', (req, res) => {
  const { dateOfBirth } = req.body;
  // TODO: Implement age verification logic
  res.json({ verified: true, age: 21 });
});

// Compliance check endpoint
app.post('/api/compliance/check', (req, res) => {
  const { state, productType, quantity } = req.body;
  // TODO: Implement compliance logic
  res.json({ compliant: true, restrictions: [] });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌿 Cannabis Service running on port ${PORT}`);
});
