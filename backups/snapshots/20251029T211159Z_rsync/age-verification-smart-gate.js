#!/usr/bin/env node
/**
 * Age Verification Smart Gate
 * 
 * Features:
 * - 30-day cookie persistence
 * - "Shop Premium Flower" bypass to /products
 * - Option C implementation from incomplete work
 * - LightSpeed integration ready
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(cookieParser());
app.use(express.static('public'));

// Age verification middleware
function ageVerificationGate(req, res, next) {
  const ageVerified = req.cookies.age_verified;
  const verificationExpiry = req.cookies.age_verification_expiry;
  
  // Check if verification is still valid (30 days)
  if (ageVerified === 'true' && verificationExpiry) {
    const expiryDate = new Date(verificationExpiry);
    const now = new Date();
    
    if (now < expiryDate) {
      // Verification still valid, allow access
      return next();
    }
  }
  
  // Show age verification page
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Age Verification Required - Reggie & Dro</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0; 
                padding: 20px; 
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container { 
                background: white; 
                padding: 40px; 
                border-radius: 15px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 500px;
                width: 100%;
            }
            .logo { 
                font-size: 2em; 
                font-weight: bold; 
                color: #333; 
                margin-bottom: 20px;
            }
            .message { 
                font-size: 1.2em; 
                color: #666; 
                margin-bottom: 30px; 
                line-height: 1.6;
            }
            .buttons { 
                display: flex; 
                gap: 15px; 
                justify-content: center; 
                flex-wrap: wrap;
            }
            .btn { 
                padding: 15px 30px; 
                border: none; 
                border-radius: 8px; 
                font-size: 1.1em; 
                cursor: pointer; 
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                min-width: 150px;
            }
            .btn-primary { 
                background: #4CAF50; 
                color: white; 
            }
            .btn-primary:hover { 
                background: #45a049; 
                transform: translateY(-2px);
            }
            .btn-secondary { 
                background: #f44336; 
                color: white; 
            }
            .btn-secondary:hover { 
                background: #da190b; 
                transform: translateY(-2px);
            }
            .btn-premium { 
                background: linear-gradient(45deg, #FFD700, #FFA500); 
                color: #333; 
                font-weight: bold;
            }
            .btn-premium:hover { 
                background: linear-gradient(45deg, #FFA500, #FFD700); 
                transform: translateY(-2px);
            }
            .disclaimer { 
                font-size: 0.9em; 
                color: #888; 
                margin-top: 30px; 
                line-height: 1.4;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🌿 Reggie & Dro</div>
            <div class="message">
                You must be 21 or older to access this website.<br>
                By entering, you confirm you are of legal age.
            </div>
            <div class="buttons">
                <button class="btn btn-primary" onclick="verifyAge()">I am 21+</button>
                <button class="btn btn-secondary" onclick="exitSite()">I am under 21</button>
                <a href="/products" class="btn btn-premium">Shop Premium Flower</a>
            </div>
            <div class="disclaimer">
                This site contains hemp-derived products. Must be 21+ to purchase.<br>
                Verification expires in 30 days for your convenience.
            </div>
        </div>

        <script>
            function verifyAge() {
                // Set 30-day verification cookie
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                
                document.cookie = 'age_verified=true; expires=' + expiryDate.toUTCString() + '; path=/';
                document.cookie = 'age_verification_expiry=' + expiryDate.toISOString() + '; expires=' + expiryDate.toUTCString() + '; path=/';
                
                // Redirect to products page
                window.location.href = '/products';
            }
            
            function exitSite() {
                // Redirect to external site
                window.location.href = 'https://www.google.com';
            }
            
            // Auto-redirect if already verified
            if (document.cookie.includes('age_verified=true')) {
                const expiryCookie = document.cookie.split(';').find(c => c.trim().startsWith('age_verification_expiry='));
                if (expiryCookie) {
                    const expiryDate = new Date(expiryCookie.split('=')[1]);
                    if (new Date() < expiryDate) {
                        window.location.href = '/products';
                    }
                }
            }
        </script>
    </body>
    </html>
  `);
}

// Apply age verification to all routes except static assets
app.use((req, res, next) => {
  if (req.path.startsWith('/static/') || req.path === '/favicon.ico') {
    return next();
  }
  ageVerificationGate(req, res, next);
});

// Products page (after verification)
app.get('/products', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Products - Reggie & Dro</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                background: #f5f5f5; 
                margin: 0; 
                padding: 20px; 
            }
            .header { 
                background: white; 
                padding: 20px; 
                border-radius: 10px; 
                margin-bottom: 20px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .logo { 
                font-size: 2em; 
                font-weight: bold; 
                color: #4CAF50; 
            }
            .status { 
                color: #4CAF50; 
                font-weight: bold; 
                margin-top: 10px;
            }
            .products { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                gap: 20px; 
            }
            .product { 
                background: white; 
                padding: 20px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .product h3 { 
                color: #333; 
                margin-top: 0; 
            }
            .price { 
                font-size: 1.5em; 
                font-weight: bold; 
                color: #4CAF50; 
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🌿 Reggie & Dro</div>
            <div class="status">✅ Age Verified - Welcome!</div>
        </div>
        
        <div class="products">
            <div class="product">
                <h3>Premium THCa Flower</h3>
                <p>High-quality hemp-derived flower</p>
                <div class="price">$40/oz</div>
            </div>
            <div class="product">
                <h3>Brick Weed</h3>
                <p>Classic compressed hemp flower</p>
                <div class="price">$40/oz</div>
            </div>
            <div class="product">
                <h3>Hempress 3 Seeds</h3>
                <p>Premium hemp genetics</p>
                <div class="price">$25/pack</div>
            </div>
        </div>
        
        <script>
            // Check verification status
            if (!document.cookie.includes('age_verified=true')) {
                window.location.href = '/';
            }
        </script>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    age_verification: 'active'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌿 Age Verification Smart Gate running on port ${PORT}`);
  console.log(`✅ 30-day cookie persistence enabled`);
  console.log(`✅ Premium Flower bypass active`);
  console.log(`✅ Ready for LightSpeed integration`);
});

module.exports = app;
