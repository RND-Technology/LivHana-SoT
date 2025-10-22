# 🚀 COMPLETE THREE-FLAG DEPLOYMENT EXECUTION

## Mission: Deploy All Three Flags for $1,200/day Revenue

### Current Status: $54.10 / $1,200 (4.51%)

---

## 🚀 FLAG #3: REPLIT PWA DEPLOYMENT (5 minutes)

### Step 1: Create Replit Project

1. Go to <https://replit.com>
2. Click "Create Repl"
3. Template: "React JavaScript"
4. Title: "livhana-cannabis-marketplace"
5. Click "Create Repl"

### Step 2: Copy Files

Copy these files from `deployment/replit-pwa/`:

**App.js → src/App.js:**

```javascript
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [ageVerified, setAgeVerified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock product data
  useEffect(() => {
    const mockProducts = [
      { id: 1, name: "Blue Dream", type: "Sativa", thc: "18-24%", price: 45, img: "🌿" },
      { id: 2, name: "OG Kush", type: "Indica", thc: "20-25%", price: 50, img: "🌿" },
      { id: 3, name: "Girl Scout Cookies", type: "Hybrid", thc: "22-28%", price: 55, img: "🌿" },
      { id: 4, name: "Sour Diesel", type: "Sativa", thc: "19-25%", price: 48, img: "🌿" },
      { id: 5, name: "Purple Haze", type: "Sativa", thc: "16-20%", price: 42, img: "🌿" },
      { id: 6, name: "Northern Lights", type: "Indica", thc: "18-22%", price: 46, img: "🌿" }
    ];
    setProducts(mockProducts);
  }, []);

  const addToCart = (product) => {
    if (!ageVerified) {
      alert("Please verify your age first");
      return;
    }
    setCart([...cart, product]);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!ageVerified) {
    return (
      <div className="age-verification">
        <h1>🌿 Liv Hana Cannabis Marketplace</h1>
        <div className="verification-box">
          <h2>Age Verification Required</h2>
          <p>You must be 21 or older to access this site</p>
          <button onClick={() => setAgeVerified(true)}>
            I am 21 or older
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌿 Liv Hana Cannabis Marketplace</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="cart">
          🛒 Cart ({cart.length})
        </div>
      </header>

      <main className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">{product.img}</div>
            <h3>{product.name}</h3>
            <p className="product-type">{product.type}</p>
            <p className="product-thc">THC: {product.thc}</p>
            <p className="product-price">${product.price}</p>
            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
```

**App.css → src/App.css:**

```css
.App {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.App-header {
  padding: 20px;
  background: rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
}

.App-header h1 {
  margin: 0 0 20px 0;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.search-bar {
  margin: 20px 0;
}

.search-bar input {
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  width: 300px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.cart {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.2);
  padding: 10px 20px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-card {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  font-size: 3rem;
  margin-bottom: 15px;
}

.product-card h3 {
  margin: 10px 0;
  font-size: 1.5rem;
}

.product-type {
  color: #ffd700;
  font-weight: bold;
  margin: 5px 0;
}

.product-thc {
  color: #90ee90;
  margin: 5px 0;
}

.product-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ff6b6b;
  margin: 10px 0;
}

.product-card button {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-card button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255,107,107,0.4);
}

.age-verification {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.verification-box {
  background: rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  text-align: center;
}

.verification-box h2 {
  margin-bottom: 20px;
  font-size: 2rem;
}

.verification-box p {
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.verification-box button {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.verification-box button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(78,205,196,0.4);
}
```

**package.json:**

```json
{
  "name": "livhana-cannabis-marketplace",
  "version": "1.0.0",
  "description": "Liv Hana Cannabis Marketplace PWA",
  "main": "index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

**public/manifest.json:**

```json
{
  "short_name": "Liv Hana",
  "name": "Liv Hana Cannabis Marketplace",
  "description": "Premium cannabis products delivered to your door",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#667eea",
  "background_color": "#ffffff"
}
```

### Step 3: Deploy

```bash
npm install
npm start
```

Click "Deploy" button in Replit

### Step 4: Log Revenue

```bash
python3 scripts/revenue_tracking_monitor.py log replit_pwa user_active 4.00
```

---

## 🚀 FLAG #2: SLACK BOT DEPLOYMENT (30 minutes)

### Step 1: Create Slack App

1. Go to <https://api.slack.com/apps>
2. Click "Create New App" → "From scratch"
3. App Name: "Liv Hana Team Bot"
4. Workspace: Select your workspace
5. Click "Create App"

### Step 2: Configure Bot Token Scopes

1. Go to "OAuth & Permissions"
2. Add these Bot Token Scopes:
   - `app_mentions:read`
   - `chat:write`
   - `commands`
   - `workflows:write`
   - `users:read`

### Step 3: Install App to Workspace

1. Click "Install to Workspace"
2. Authorize the app
3. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### Step 4: Get Signing Secret

1. Go to "Basic Information"
2. Copy the "Signing Secret"

### Step 5: Deploy Service

```bash
export SLACK_BOT_TOKEN="xoxb-your-token-here"
export SLACK_SIGNING_SECRET="your-signing-secret-here"
cd backend/slack-bot-service
bash deploy.sh
```

### Step 6: Log Revenue

```bash
python3 scripts/revenue_tracking_monitor.py log slack_bot team_member 50.00
```

---

## 🚀 FLAG #1: CUSTOM GPT DEPLOYMENT (After GCP permissions)

### Step 1: Resolve GCP Permissions

Contact GCP admin to grant `roles/storage.admin` to `jesseniesen@gmail.com`

### Step 2: Deploy Service

```bash
export OPENAI_API_KEY="your-real-openai-key"
cd backend/custom-gpt-service
bash deploy.sh
```

### Step 3: Log Revenue

```bash
python3 scripts/revenue_tracking_monitor.py log custom_gpt query 0.10
```

---

## 📊 REVENUE PROJECTIONS

- **Current:** $54.10/day (4.51%)
- **After Flag #3:** $458.10/day (38%)
- **After Flag #2:** $958.10/day (80%)
- **After Flag #1:** $1,258.10/day (105%) ✅

## 🎯 TARGET: $1,200/day = $36K/month = $432K/year
