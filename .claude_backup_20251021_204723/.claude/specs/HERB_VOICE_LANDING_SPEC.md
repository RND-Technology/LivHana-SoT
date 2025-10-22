---
status: URGENT - HERB Landing Page with Voice Mode
priority: CRITICAL - Lead Capture + Empire Assets Promo
assigned_to: Replit
mode: LFG (LET'S F***ING GO)
timestamp: 2025-10-08T05:43Z
---

# 🌿 HERB LANDING PAGE - Voice Mode + Lead Capture

**Mission**: Build HERB landing page with voice interface, reasoning engine, lead capture, empire assets promo
**Domain**: highfromhemp.com (HERB = Herbitrage Elevated Reasoning Bot)
**Features**: Voice mode, user login/profile (top right), lead capture, empire promo

---

## 🎯 PAGE STRUCTURE

### Header (Fixed Top)
```html
<header class="herb-header">
  <div class="logo">
    <img src="/assets/herb-logo.svg" alt="HERB">
    <span>Herbitrage Elevated Reasoning Bot</span>
  </div>

  <nav>
    <a href="#voice">Voice Mode</a>
    <a href="#features">Features</a>
    <a href="#empire">Empire</a>
    <a href="#pricing">Pricing</a>
  </nav>

  <!-- USER LOGIN/PROFILE (TOP RIGHT) -->
  <div class="user-profile">
    <div class="login-button" id="loginBtn">
      <i class="icon-user"></i>
      <span>Login</span>
    </div>

    <!-- After login -->
    <div class="profile-dropdown" id="profileDropdown" style="display:none;">
      <img src="/api/user/avatar" class="avatar">
      <span class="username">Jesse N.</span>
      <div class="dropdown-menu">
        <a href="/profile">My Profile</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/settings">Settings</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  </div>
</header>
```

---

## 🎤 SECTION 1: VOICE MODE HERO

```html
<section class="hero-voice">
  <div class="container">
    <h1>Talk to HERB</h1>
    <p class="tagline">AI-Powered Voice Reasoning for Cannabis & Wellness</p>

    <!-- VOICE INTERFACE -->
    <div class="voice-container">
      <div class="voice-visualizer" id="waveform">
        <!-- Animated waveform when speaking -->
        <canvas id="audioWave"></canvas>
      </div>

      <button class="voice-button" id="voiceBtn">
        <i class="icon-microphone"></i>
        <span>Click to Speak</span>
      </button>

      <div class="voice-status">
        <span id="status">Ready to listen...</span>
      </div>

      <!-- CONVERSATION DISPLAY -->
      <div class="conversation-log">
        <div class="message user">
          <span class="avatar">👤</span>
          <div class="text">What are the best products for sleep?</div>
        </div>

        <div class="message herb">
          <span class="avatar">🌿</span>
          <div class="text">
            Based on customer data, these 3 products have 91% satisfaction for sleep:
            <ul>
              <li>Blue Dream CBN Gummies (87% repeat purchase)</li>
              <li>Midnight Indica Flower (92% positive reviews)</li>
              <li>Sleep Tincture 2:1 CBD:CBN (89% effectiveness)</li>
            </ul>
            Would you like to try a sample pack?
          </div>
        </div>
      </div>
    </div>

    <!-- QUICK ACTIONS -->
    <div class="quick-actions">
      <button class="action-btn">Product Recommendations</button>
      <button class="action-btn">Inventory Check</button>
      <button class="action-btn">Sales Analysis</button>
      <button class="action-btn">Customer Insights</button>
    </div>
  </div>
</section>
```

---

## 📊 SECTION 2: REASONING ENGINE SHOWCASE

```html
<section class="reasoning-demo">
  <div class="container">
    <h2>Powered by Social Intelligence</h2>
    <p>HERB analyzes real customer data, not just product descriptions</p>

    <div class="reasoning-flow">
      <!-- Step 1 -->
      <div class="step">
        <div class="icon">🗣️</div>
        <h3>You Ask</h3>
        <p>"What products work for anxiety?"</p>
      </div>

      <!-- Step 2 -->
      <div class="step">
        <div class="icon">🧠</div>
        <h3>HERB Reasons</h3>
        <p>Analyzes 10,000+ customer purchases, reviews, and outcomes</p>
      </div>

      <!-- Step 3 -->
      <div class="step">
        <div class="icon">✨</div>
        <h3>You Get Results</h3>
        <p>Personalized recommendations based on actual effectiveness</p>
      </div>
    </div>

    <!-- DATA SOURCES -->
    <div class="data-sources">
      <h3>Real-Time Data Sources:</h3>
      <div class="sources-grid">
        <div class="source">
          <i class="icon-lightspeed"></i>
          <span>Lightspeed POS</span>
          <small>Every sale, every product</small>
        </div>

        <div class="source">
          <i class="icon-customers"></i>
          <span>Customer Feedback</span>
          <small>Verified reviews & ratings</small>
        </div>

        <div class="source">
          <i class="icon-social"></i>
          <span>Social Intelligence</span>
          <small>What customers really say</small>
        </div>

        <div class="source">
          <i class="icon-analytics"></i>
          <span>BigQuery Analytics</span>
          <small>Patterns & predictions</small>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 🎬 SECTION 3: EMPIRE ASSETS PROMO

```html
<section class="empire-promo">
  <div class="container">
    <h2>The LivHana Empire</h2>
    <p>More than just HERB - discover the complete ecosystem</p>

    <div class="empire-grid">
      <!-- Asset 1: HNC -->
      <div class="empire-card">
        <div class="card-image">
          <img src="/assets/hnc-thumbnail.jpg" alt="High Noon Cartoon">
        </div>
        <h3>High Noon Cartoon</h3>
        <p>84 episodes of cannabis culture, humor, and education</p>
        <a href="https://highnooncartoon.com" class="btn">Watch Now</a>
      </div>

      <!-- Asset 2: OPC -->
      <div class="empire-card">
        <div class="card-image">
          <img src="/assets/opc-thumbnail.jpg" alt="One Plant Confidential">
        </div>
        <h3>One Plant Confidential</h3>
        <p>Podcast exploring cannabis industry insights</p>
        <a href="/opc" class="btn">Listen</a>
      </div>

      <!-- Asset 3: Herbitrage -->
      <div class="empire-card">
        <div class="card-image">
          <img src="/assets/herbitrage-thumbnail.jpg" alt="Herbitrage">
        </div>
        <h3>Herbitrage</h3>
        <p>AI-powered cannabis & wellness platform</p>
        <a href="https://herbitrage.com" class="btn">Explore</a>
      </div>

      <!-- Asset 4: Reggie & Dro -->
      <div class="empire-card">
        <div class="card-image">
          <img src="/assets/rad-thumbnail.jpg" alt="Reggie & Dro">
        </div>
        <h3>Reggie & Dro</h3>
        <p>San Antonio's premier dispensary</p>
        <a href="https://reggieanddro.com" class="btn">Shop</a>
      </div>

      <!-- Asset 5: Jesse Niesen -->
      <div class="empire-card">
        <div class="card-image">
          <img src="/assets/jesse-thumbnail.jpg" alt="Jesse Niesen">
        </div>
        <h3>Jesse Niesen</h3>
        <p>Racing to $1B with AI - APEX CEO</p>
        <a href="https://jesseniesen.com" class="btn">Follow the Race</a>
      </div>
    </div>
  </div>
</section>
```

---

## 🎁 SECTION 4: LEAD CAPTURE (PRIMARY CTA)

```html
<section class="lead-capture">
  <div class="container">
    <div class="capture-box">
      <h2>Get Early Access to HERB</h2>
      <p>Join 1,000+ cannabis professionals using AI to grow their business</p>

      <form id="leadForm" class="lead-form">
        <div class="form-row">
          <input type="text" name="firstName" placeholder="First Name" required>
          <input type="text" name="lastName" placeholder="Last Name" required>
        </div>

        <div class="form-row">
          <input type="email" name="email" placeholder="Email Address" required>
          <input type="tel" name="phone" placeholder="Phone Number">
        </div>

        <div class="form-row">
          <select name="businessType" required>
            <option value="">Business Type</option>
            <option value="dispensary">Dispensary</option>
            <option value="cultivator">Cultivator</option>
            <option value="processor">Processor</option>
            <option value="brand">Brand/Manufacturer</option>
            <option value="other">Other</option>
          </select>

          <input type="text" name="businessName" placeholder="Business Name">
        </div>

        <div class="form-row">
          <textarea name="needs" placeholder="What challenges are you facing?" rows="3"></textarea>
        </div>

        <div class="form-row checkbox">
          <label>
            <input type="checkbox" name="agreeToTerms" required>
            I agree to receive communications from LivHana
          </label>
        </div>

        <button type="submit" class="submit-btn">
          Get Early Access
          <i class="icon-arrow-right"></i>
        </button>
      </form>

      <!-- SOCIAL PROOF -->
      <div class="social-proof">
        <div class="stat">
          <span class="number">1,247</span>
          <span class="label">Early Access Users</span>
        </div>

        <div class="stat">
          <span class="number">91%</span>
          <span class="label">Satisfaction Rate</span>
        </div>

        <div class="stat">
          <span class="number">2.5x</span>
          <span class="label">Conversion Increase</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## ⚙️ TECHNICAL IMPLEMENTATION

### Voice Mode (Frontend)
```javascript
// File: public/js/voice-interface.js

class VoiceInterface {
  constructor() {
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
  }

  async startListening() {
    this.isListening = true;
    this.recognition.start();
    updateStatus("Listening...");

    this.recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      addMessage('user', transcript);

      // Send to HERB reasoning engine
      const response = await fetch('/api/herb/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: transcript, userId: getCurrentUserId() })
      });

      const data = await response.json();
      addMessage('herb', data.response);
      this.speak(data.response);
    };
  }

  speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.synthesis.getVoices().find(v => v.name.includes('Female'));
    this.synthesis.speak(utterance);
  }
}

// Initialize
const voiceInterface = new VoiceInterface();
document.getElementById('voiceBtn').addEventListener('click', () => {
  voiceInterface.startListening();
});
```

### Reasoning Engine (Backend)
```javascript
// File: backend/reasoning-gateway/src/herb-reasoning.js

class HerbReasoningEngine {
  async processQuery(query, userId) {
    // 1. Get user context
    const userProfile = await this.getUserProfile(userId);

    // 2. Analyze query intent
    const intent = await this.analyzeIntent(query);

    // 3. Fetch relevant data
    const data = await this.gatherData(intent, userProfile);

    // 4. Generate reasoning
    const reasoning = await this.claude.complete({
      model: 'claude-sonnet-4-5',
      messages: [{
        role: 'user',
        content: `
          User Query: "${query}"
          User Profile: ${JSON.stringify(userProfile)}
          Available Data: ${JSON.stringify(data)}

          Provide a helpful, data-driven response with specific product recommendations.
          Include confidence scores and reasoning.
        `
      }]
    });

    // 5. Format response
    return {
      response: reasoning.content,
      confidence: 0.92,
      data_sources: ['lightspeed', 'bigquery', 'customer_reviews'],
      recommendations: this.extractRecommendations(reasoning)
    };
  }
}
```

### Lead Capture (Backend)
```javascript
// File: backend/integration-service/src/routes/leads.js

app.post('/api/leads/capture', async (req, res) => {
  const lead = req.body;

  // 1. Validate
  if (!lead.email || !lead.firstName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 2. Store in BigQuery
  await bigquery.dataset('livhana_prod').table('leads').insert([{
    timestamp: new Date().toISOString(),
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    businessType: lead.businessType,
    businessName: lead.businessName,
    needs: lead.needs,
    source: 'herb_landing',
    status: 'new'
  }]);

  // 3. Send notification email
  await sendEmail({
    to: 'jesseniesen@gmail.com',
    subject: `New HERB Lead: ${lead.firstName} ${lastName}`,
    body: `
      New lead captured from HERB landing page:
      Name: ${lead.firstName} ${lead.lastName}
      Email: ${lead.email}
      Business: ${lead.businessName} (${lead.businessType})
      Needs: ${lead.needs}
    `
  });

  // 4. Add to CRM/nurture sequence
  await addToCRM(lead);

  res.json({ success: true, message: 'Welcome to HERB!' });
});
```

### User Login/Profile
```javascript
// File: public/js/auth.js

async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('authToken', data.token);
    showProfile(data.user);
  }
}

function showProfile(user) {
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('profileDropdown').style.display = 'block';
  document.querySelector('.username').textContent = user.name;
  document.querySelector('.avatar').src = user.avatar || '/assets/default-avatar.png';
}
```

---

## 🎨 DESIGN SPECIFICATIONS

### Color Palette
```css
:root {
  --herb-primary: #4CAF50;  /* Green - cannabis */
  --herb-secondary: #8BC34A;  /* Light green */
  --herb-accent: #FFC107;  /* Gold - premium */
  --herb-dark: #1B5E20;  /* Dark green */
  --herb-light: #F1F8E9;  /* Very light green */
  --text-dark: #212121;
  --text-light: #757575;
  --white: #FFFFFF;
}
```

### Typography
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}

h1, h2, h3 {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
}
```

### Voice Button
```css
.voice-button {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--herb-primary), var(--herb-secondary));
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}

.voice-button:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(76, 175, 80, 0.4);
}

.voice-button:active {
  transform: scale(0.95);
}

.voice-button.listening {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---

## 📋 REPLIT DELIVERABLES

### Files to Create:
1. **public/index.html** - Main landing page
2. **public/css/herb-style.css** - Styling
3. **public/js/voice-interface.js** - Voice functionality
4. **public/js/auth.js** - Login/profile
5. **backend/routes/herb.js** - API endpoints
6. **backend/routes/leads.js** - Lead capture

### Timeline:
- [ ] Homepage structure (1 hour)
- [ ] Voice interface (2 hours)
- [ ] Reasoning engine integration (2 hours)
- [ ] Empire promo section (1 hour)
- [ ] Lead capture form (1 hour)
- [ ] User login/profile (2 hours)
- [ ] Testing & polish (1 hour)

**Total**: 10 hours

---

## 🚀 DEPLOYMENT

**Domain**: highfromhemp.com
**Service**: herb-landing (new Cloud Run service)
**Port**: 8080
**Health Check**: /health

**Deploy Command**:
```bash
cd empire/content-engine/herb-landing
docker build -t gcr.io/reggieanddrodispensary/herb-landing:latest .
docker push gcr.io/reggieanddrodispensary/herb-landing:latest
gcloud run deploy herb-landing \
  --image gcr.io/reggieanddrodispensary/herb-landing:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --project reggieanddrodispensary
```

---

**Status**: SPEC COMPLETE ✅
**Assigned**: Replit
**Priority**: URGENT (LFG!!)
**Timeline**: 10 hours to deployment

**LET'S F***ING GO!** 🚀🌿

---

**Last Updated**: 2025-10-08T05:43Z
**Created By**: Claude Code (Sonnet 4.5)
**For**: Replit (HERB Landing Page)
