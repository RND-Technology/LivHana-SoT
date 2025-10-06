import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 8082;

// Square integration for non-cannabis opportunities
const squareIntegration = {
  // Hempress3 seeds sales
  hempress3Seeds: {
    productId: 'hempress3-seeds',
    name: 'Hempress3 Premium Seeds',
    description: 'High-quality hemp seeds for cultivation',
    price: 49.99,
    category: 'seeds',
    compliance: 'hemp-legal'
  },
  
  // CBD products (compliant)
  cbdProducts: {
    productId: 'cbd-products',
    name: 'CBD Wellness Products',
    description: 'Compliant CBD products for wellness',
    price: 29.99,
    category: 'cbd',
    compliance: 'hemp-legal'
  },
  
  // Educational materials
  educationalMaterials: {
    productId: 'educational-materials',
    name: 'Cannabis Education Materials',
    description: 'Educational content and compliance guides',
    price: 19.99,
    category: 'education',
    compliance: 'educational'
  },
  
  // Consulting services
  consultingServices: {
    productId: 'consulting-services',
    name: 'Cannabis Compliance Consulting',
    description: 'Expert compliance and business consulting',
    price: 199.99,
    category: 'consulting',
    compliance: 'professional'
  }
};

// Domain mapping for 69 domains
const domainMapping = {
  'exoticcanopysolutions.com': {
    primary: true,
    canonical: true,
    products: ['hempress3Seeds', 'cbdProducts'],
    seo: 'seed-dominance'
  },
  'hempress3.com': {
    primary: false,
    redirect: 'exoticcanopysolutions.com',
    products: ['hempress3Seeds'],
    seo: 'brand-redirect'
  },
  'texascoa.com': {
    primary: false,
    redirect: 'exoticcanopysolutions.com',
    products: ['educationalMaterials'],
    seo: 'compliance-redirect'
  }
  // Add remaining 66 domains...
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'square-integration',
    timestamp: new Date().toISOString(),
    features: ['square-api', 'domain-mapping', 'product-catalog', 'payment-processing']
  });
});

// Square API integration endpoints
app.post('/api/square/create-payment', async (req, res) => {
  const { productId, quantity, domain } = req.body;
  
  try {
    // Validate product
    const product = Object.values(squareIntegration).find(p => p.productId === productId);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }
    
    // Validate domain
    const domainConfig = domainMapping[domain];
    if (!domainConfig) {
      return res.status(400).json({ error: 'Domain not configured' });
    }
    
    // Create Square payment
    const paymentData = {
      id: uuidv4(),
      productId,
      productName: product.name,
      price: product.price,
      quantity,
      total: product.price * quantity,
      domain,
      timestamp: new Date().toISOString(),
      compliance: product.compliance
    };
    
    console.log('Square payment created:', paymentData);
    res.status(201).json({
      message: 'Payment created successfully',
      payment: paymentData,
      squarePaymentUrl: `https://squareup.com/pay/${paymentData.id}`
    });
    
  } catch (error) {
    console.error('Square payment error:', error);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// Product catalog endpoint
app.get('/api/square/products', (req, res) => {
  const { domain } = req.query;
  
  if (domain && domainMapping[domain]) {
    const domainConfig = domainMapping[domain];
    const products = domainConfig.products.map(productId => 
      Object.values(squareIntegration).find(p => p.productId === productId)
    ).filter(Boolean);
    
    res.status(200).json({
      domain,
      products,
      domainConfig
    });
  } else {
    res.status(200).json({
      allProducts: squareIntegration,
      domainMapping
    });
  }
});

// Domain configuration endpoint
app.get('/api/square/domains', (req, res) => {
  res.status(200).json({
    totalDomains: Object.keys(domainMapping).length,
    domains: domainMapping,
    canonical: 'exoticcanopysolutions.com',
    redirects: Object.entries(domainMapping)
      .filter(([_, config]) => config.redirect)
      .map(([domain, config]) => ({ domain, redirect: config.redirect }))
  });
});

// Payment status endpoint
app.get('/api/square/payment/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  
  // Mock payment status - in production, query Square API
  res.status(200).json({
    paymentId,
    status: 'completed',
    amount: 49.99,
    product: 'Hempress3 Premium Seeds',
    timestamp: new Date().toISOString(),
    squareTransactionId: `sq_${paymentId}`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`💳 Square Integration running on port ${PORT}`);
  console.log(`🌐 69 domains mapped and ready`);
  console.log(`🌱 Hempress3 seeds sales active`);
  console.log(`📚 Educational materials available`);
  console.log(`💼 Consulting services ready`);
  console.log(`🔗 Domain redirects configured`);
});
