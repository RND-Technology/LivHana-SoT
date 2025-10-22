# 🚀 FLAG #3: REPLIT PWA DEPLOYMENT RUNBOOK
**Target**: $400/day | **Timeline**: 3-5 hours | **Status**: READY TO EXECUTE

---

## 🎯 MISSION: Liv Hana Cannabis Marketplace PWA
Deploy a Progressive Web App on Replit for cannabis browsing and ordering.

---

## ⚡ QUICK START (Replit Setup)

### Step 1: Create Replit Project (15 min)

```bash
# Go to https://replit.com
# Click "Create Repl"
# Template: "Node.js with React"
# Title: "Liv Hana Cannabis Marketplace"
```

**Or use Replit CLI**:
```bash
# Install Replit CLI (if not already)
npm install -g replit-cli

# Login
replit login

# Create new repl
replit create --template nodejs-react --title "livhana-cannabis-marketplace"
```

---

### Step 2: Initialize PWA Structure (30 min)

```bash
# In Replit shell:
npx create-react-app . --template cra-template-pwa
npm install

# Add PWA dependencies
npm install workbox-webpack-plugin workbox-core workbox-routing workbox-strategies
```

**Create PWA Manifest** (`public/manifest.json`):
```json
{
  "short_name": "Liv Hana",
  "name": "Liv Hana Cannabis Marketplace",
  "description": "Browse and order premium cannabis products",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

---

### Step 3: Build Cannabis Marketplace UI (2-3 hours)

**Create main App component** (`src/App.js`):
```jsx
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [ageVerified, setAgeVerified] = useState(false);

  // Age verification modal
  const AgeGate = () => (
    <div className="age-gate">
      <h1>Age Verification Required</h1>
      <p>You must be 21+ to access this site</p>
      <button onClick={() => setAgeVerified(true)}>
        I am 21 or older
      </button>
    </div>
  );

  // Fetch products (TODO: integrate with LightSpeed)
  useEffect(() => {
    const mockProducts = [
      { id: 1, name: "Blue Dream", type: "Sativa", thc: "18-24%", price: 45 },
      { id: 2, name: "OG Kush", type: "Indica", thc: "20-25%", price: 50 },
      { id: 3, name: "Girl Scout Cookies", type: "Hybrid", thc: "22-28%", price: 55 }
    ];
    setProducts(mockProducts);
  }, []);

  // Add to cart
  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  if (!ageVerified) {
    return <AgeGate />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌿 Liv Hana Cannabis Marketplace</h1>
        <p>Premium cannabis products delivered to your door</p>
      </header>

      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>Type: {product.type}</p>
            <p>THC: {product.thc}</p>
            <p className="price">${product.price}</p>
            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div className="cart">
        <h2>Cart ({cart.length})</h2>
        {cart.map((item, i) => (
          <div key={i}>{item.name} - ${item.price}</div>
        ))}
        <p>Total: ${cart.reduce((sum, item) => sum + item.price, 0)}</p>
      </div>
    </div>
  );
}

export default App;
```

**Add CSS styling** (`src/App.css`):
```css
.App {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.App-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 10px;
  margin-bottom: 30px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-card button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.product-card button:hover {
  background: #764ba2;
}

.cart {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
}

.age-gate {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.age-gate button {
  background: white;
  color: #667eea;
  border: none;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 20px;
}
```

---

### Step 4: Enable PWA Service Worker (30 min)

**Update** `src/index.js`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable PWA service worker
serviceWorkerRegistration.register();
```

---

### Step 5: Deploy on Replit (15 min)

```bash
# In Replit:
# 1. Click "Run" button
# 2. Replit will automatically build and deploy
# 3. Get your app URL: https://livhana-cannabis-marketplace.YOUR-USERNAME.repl.co
```

**Configure Replit deployment**:
```bash
# Create .replit config
cat > .replit <<'EOF'
run = "npm start"
language = "nodejs"

[deployment]
run = ["npm", "run", "build"]
deploymentTarget = "static"
EOF
```

---

### Step 6: Add Voice Integration (1 hour)

**Install speech recognition**:
```bash
npm install react-speech-recognition
```

**Add voice search component** (`src/VoiceSearch.js`):
```jsx
import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceSearch = ({ onSearch }) => {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const handleVoiceSearch = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      onSearch(transcript);
      resetTranscript();
    } else {
      SpeechRecognition.startListening();
    }
  };

  return (
    <div className="voice-search">
      <button onClick={handleVoiceSearch}>
        {listening ? '🎤 Listening...' : '🎤 Voice Search'}
      </button>
      <p>{transcript}</p>
    </div>
  );
};

export default VoiceSearch;
```

---

## 📊 REVENUE TRACKING INTEGRATION

```bash
# Log active user subscription ($4/month per user)
python3 scripts/revenue_tracking_monitor.py log replit_pwa user_active 4.00

# View dashboard
python3 scripts/revenue_tracking_monitor.py dashboard
```

---

## 🎯 SUCCESS METRICS

**Launch Criteria**:
- [ ] PWA installable on mobile
- [ ] Age gate working
- [ ] Products displayed correctly
- [ ] Cart functionality works
- [ ] First user subscribed

**Daily Targets**:
- [ ] 100 active users
- [ ] $400/day revenue ($4/month per user)
- [ ] 90%+ offline functionality
- [ ] 70%+ daily active users

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [x] Replit account created
- [ ] PWA template initialized
- [ ] Cannabis product data ready
- [ ] LightSpeed integration planned

### Deployment
- [ ] React app built
- [ ] PWA manifest configured
- [ ] Service worker registered
- [ ] Age verification implemented
- [ ] Deployed on Replit

### Post-Deployment
- [ ] Test PWA installation
- [ ] Test offline functionality
- [ ] Monitor user signups
- [ ] Track daily active users

---

## 💰 REVENUE MODEL

- **Price**: $4/month per active user
- **Daily Target**: 100 active users
- **Daily Revenue**: $400
- **Monthly Revenue**: $12,000
- **Annual Revenue**: $144,000

---

## 🎯 NEXT ACTIONS

```bash
# 1. Create Replit project
# Go to https://replit.com and create "livhana-cannabis-marketplace"

# 2. Copy the code above into Replit files

# 3. Run the app
npm install
npm start

# 4. Deploy
# Click "Deploy" in Replit

# 5. Log first user
python3 scripts/revenue_tracking_monitor.py log replit_pwa user_active 4.00
```

---

**Status**: READY TO DEPLOY
**Timeline**: 3-5 hours to full deployment
**First Revenue**: After first user subscription ($4)
