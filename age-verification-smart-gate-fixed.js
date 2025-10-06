const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(express.json());

// Age verification middleware
app.use((req, res, next) => {
  const { path } = req;
  
  // Bypass for /products
  if (path === '/products' || path.startsWith('/products/')) {
    return next();
  }
  
  // Check for age verification cookie
  const ageVerified = req.cookies.ageVerified;
  
  if (ageVerified === 'true') {
    return next();
  }
  
  // Show age verification page
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Age Verification Required</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 400px; margin: 0 auto; }
        button { background: #4CAF50; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin: 10px; }
        button:hover { background: #45a049; }
        .products-link { background: #2196F3; }
        .products-link:hover { background: #1976D2; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Age Verification Required</h1>
        <p>You must be 21+ to access this site.</p>
        <button onclick="verifyAge()">I am 21 or older</button>
        <button class="products-link" onclick="window.location.href='https://reggieanddro.com/products'">Shop Premium Flower</button>
      </div>
      <script>
        function verifyAge() {
          document.cookie = "ageVerified=true; max-age=2592000; path=/";
          window.location.href = "/";
        }
      </script>
    </body>
    </html>
  `);
});

// Products page
app.get('/products', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Premium Flower - Reggie & Dro</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .product-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; background: #f9f9f9; }
        .product-name { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
        .product-price { color: #4CAF50; font-size: 16px; font-weight: bold; }
        .back-link { background: #666; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        .back-link:hover { background: #555; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Premium Flower Collection</h1>
        <p>Legal hemp-derived products for adults 21+</p>
        
        <div class="product-grid">
          <div class="product-card">
            <div class="product-name">Cheetah Piss</div>
            <div class="product-price">$45.00</div>
            <p>Premium THCa flower</p>
          </div>
          <div class="product-card">
            <div class="product-name">Texas Brick</div>
            <div class="product-price">$35.00</div>
            <p>Classic hemp flower</p>
          </div>
          <div class="product-card">
            <div class="product-name">Livin' Hana</div>
            <div class="product-price">$50.00</div>
            <p>Premium strain</p>
          </div>
        </div>
        
        <a href="/" class="back-link">Back to Home</a>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'age-verification-gate',
    message: 'Real age verification with working links',
    timestamp: new Date().toISOString(),
    features: ['age_verification', 'products_page', 'cookie_persistence']
  });
});

// Main route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Age Verification Gate Active',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: ['/products', '/health']
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Age verification gate running on port ${PORT}`);
});
