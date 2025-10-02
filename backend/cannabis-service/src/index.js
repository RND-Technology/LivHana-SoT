const express = require('express');
const { createLogger } = require('../../common/logging');
const app = express();
const PORT = process.env.PORT || 3003;
const logger = createLogger('cannabis-service');

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
  
  if (!dateOfBirth) {
    return res.status(400).json({ error: 'Date of birth required' });
  }
  
  const age = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const minAge = Number(process.env.MIN_AGE || 21);
  
  res.json({ 
    verified: age >= minAge,
    age,
    minAge,
    message: age >= minAge ? 'Age verified' : `Must be ${minAge} or older`
  });
});

// Compliance check endpoint
app.post('/api/compliance/check', (req, res) => {
  const { state, productType, quantity } = req.body;
  
  if (!state || !productType || !quantity) {
    return res.status(400).json({ error: 'State, product type, and quantity required' });
  }
  
  // State-specific compliance rules
  const stateRules = {
    'CA': { maxQuantity: 28.5, allowedTypes: ['flower', 'edible', 'concentrate'] },
    'CO': { maxQuantity: 28, allowedTypes: ['flower', 'edible', 'concentrate', 'topical'] },
    'OR': { maxQuantity: 56, allowedTypes: ['flower', 'edible', 'concentrate', 'topical'] },
    // Add more states as needed
  };
  
  const rules = stateRules[state] || { maxQuantity: 28, allowedTypes: ['flower'] };
  const compliant = quantity <= rules.maxQuantity && rules.allowedTypes.includes(productType);
  
  res.json({ 
    compliant,
    maxQuantity: rules.maxQuantity,
    allowedTypes: rules.allowedTypes,
    restrictions: compliant ? [] : [`Quantity exceeds ${rules.maxQuantity}g limit or product type not allowed`]
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🌿 Cannabis Service running on port ${PORT}`);
});

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
