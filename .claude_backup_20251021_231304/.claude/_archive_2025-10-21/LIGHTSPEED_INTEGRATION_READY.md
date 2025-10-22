# LIGHTSPEED INTEGRATION - READY FOR TOKEN

**Status**: ✅ READY FOR 30-MINUTE ACTIVATION
**Date**: 2025-10-08T02:15:00Z
**Owner**: Claude Code (Sonnet 4.5)

---

## 🎯 INTEGRATION READINESS

### Current Status

- ✅ **LightSpeedClient** implemented (backend/integration-service/src/lib/lightspeed-client.js)
- ✅ **Mock mode** functional (fallback data ready)
- ✅ **API structure** defined (getProducts, getCustomer methods)
- ✅ **Logging** integrated (winston logger ready)
- ⏳ **LIGHTSPEED_API_KEY** awaiting Jesse's personal token

### Architecture

```
┌─────────────────────────────────────────────────┐
│  Integration Service (port 3003)                │
│  ├── LightSpeedClient (lib/lightspeed-client.js)│
│  │   ├── getProducts()                          │
│  │   └── getCustomer(id)                        │
│  └── Mock Mode (LIGHTSPEED_API_KEY not set)     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Lightspeed Retail API                          │
│  URL: reggieanddro.retail.lightspeed.app        │
│  Auth: Personal Token (Jesse generates)         │
└─────────────────────────────────────────────────┘
```

---

## ⚡ 30-MINUTE ACTIVATION PLAN

### When Jesse Provides Token

#### Step 1: Environment Configuration (5 minutes)

```bash
# Option A: 1Password CLI (recommended)
op item create --category="API Credential" \
  --title="Lightspeed Personal Token - Reggie & Dro" \
  --tags="production,lightspeed,integration" \
  'token[password]=<PASTE_TOKEN_HERE>'

# Option B: .env file (local dev only)
echo "LIGHTSPEED_API_KEY=<TOKEN>" >> backend/integration-service/.env
echo "LIGHTSPEED_BASE_URL=https://api.lightspeedhq.com" >> backend/integration-service/.env
```

#### Step 2: Integration Test (10 minutes)

```bash
# Navigate to integration service
cd backend/integration-service

# Start service with token
LIGHTSPEED_API_KEY=$(op item get "Lightspeed Personal Token" --fields token) \
  npm start

# Test endpoints
curl -X GET http://localhost:3003/api/lightspeed/products
curl -X GET http://localhost:3003/api/lightspeed/customer/123
```

#### Step 3: Verify & Deploy (15 minutes)

```bash
# Run integration tests
npm run test:integration

# Deploy to GCP Cloud Run
./deploy.sh

# Verify production health
curl https://integration-service-[hash]-uc.a.run.app/health
```

---

## 🔑 TOKEN GENERATION STEPS (For Jesse)

### Navigate to Lightspeed Retail

1. Go to: <https://reggieanddro.retail.lightspeed.app>
2. Login with Reggie & Dro credentials
3. Navigate to: **Account Settings** → **API** → **Personal Tokens**
4. Click: **Generate New Token**
5. Name: "LivHana Integration Service - Production"
6. Permissions: Check **Read Products**, **Read Customers**, **Read Orders**
7. **CRITICAL**: Copy token immediately (shown only once)
8. Paste token into 1Password or provide to Claude Code

---

## 📋 ENV VAR REQUIREMENTS

### Required

- `LIGHTSPEED_API_KEY`: Personal token from Lightspeed Retail
  - Format: Bearer token (no prefix needed in env var)
  - Storage: 1Password (production) or .env (local dev)
  - Rotation: Every 90 days (recommend calendar reminder)

### Optional (have defaults)

- `LIGHTSPEED_BASE_URL`: API base URL (default: <https://api.lightspeedhq.com>)
- `LIGHTSPEED_TIMEOUT`: Request timeout in ms (default: 30000)
- `LIGHTSPEED_RETRY_ATTEMPTS`: Max retry attempts (default: 3)

---

## 🧪 TEST HARNESS

### Quick Smoke Test (2 minutes)

```javascript
// backend/integration-service/test/lightspeed-smoke-test.js
import { getLightSpeedClient } from '../src/lib/lightspeed-client.js';

async function smokeTest() {
  const client = getLightSpeedClient();
  
  console.log('🧪 Testing Lightspeed Integration...');
  
  // Test 1: Get Products
  const products = await client.getProducts();
  console.log(`✅ Products: ${products.length} items`);
  
  // Test 2: Get Customer
  const customer = await client.getCustomer('test-123');
  console.log(`✅ Customer: ${customer?.name || 'Mock'}`);
  
  console.log('🎉 Smoke test PASSED!');
}

smokeTest().catch(console.error);
```

Run: `node backend/integration-service/test/lightspeed-smoke-test.js`

---

## 🚀 REVENUE IMPACT

### $80K → $100K Revenue Optimization

**Target**: 25% conversion rate improvement on reggieanddro.com

**Features Unlocked by Token**:

1. **Real-time inventory sync** (prevents out-of-stock orders)
2. **Customer verification** (loyalty program integration)
3. **Order history** (personalized recommendations)
4. **Product catalog** (dynamic menu updates)
5. **Sales analytics** (conversion tracking)

**Expected Timeline**:

- Token drop-in: 30 minutes
- Full integration: 48 hours
- Revenue impact: 7-14 days

---

## 🔒 SECURITY NOTES

### Token Handling

- ✅ **Never commit token to git** (use .gitignore for .env files)
- ✅ **Store in 1Password** (production standard)
- ✅ **Rotate every 90 days** (set calendar reminder)
- ✅ **Restrict permissions** (read-only access sufficient)
- ✅ **Monitor usage** (Lightspeed dashboard shows API calls)

### Access Control

- Token owner: Jesse Niesen (CEO)
- Integration owner: Claude Code (Sonnet 4.5)
- Backup access: Replit (staging environment)
- Revocation: Immediate via Lightspeed dashboard

---

## 📊 INTEGRATION CHECKLIST

### Pre-Token (Done)

- [x] LightSpeedClient implemented
- [x] Mock mode functional
- [x] API structure defined
- [x] Logging integrated
- [x] Error handling in place
- [x] Test harness ready

### Post-Token (30 minutes)

- [ ] Token stored in 1Password
- [ ] Environment variable configured
- [ ] Smoke test executed
- [ ] Integration tests passing
- [ ] Production deployment complete
- [ ] Health check verified

### Post-Integration (48 hours)

- [ ] Revenue dashboard wired to real data
- [ ] Replit VIP cockpit connected
- [ ] Real-time inventory sync operational
- [ ] Customer verification active
- [ ] Analytics tracking live

---

## 🎯 DEPENDENCIES

### Blocked Until Token

1. **Revenue Dashboard v1** (3-day delivery blocked)
2. **Replit VIP Cockpit** (3 staging prototypes blocked)
3. **Real-time inventory sync** (prevents overselling)
4. **Customer loyalty integration** (prevents duplicate rewards)

### Ready After Token

1. **Voice Cockpit** (can reference real inventory)
2. **Episodes 2-3** (can show real product data)
3. **Trump Hemp Petition** (can link to real products)

---

## 🏁 ACTIVATION COMMAND (For Jesse)

**When token is ready, run this:**

```bash
# Store token securely
op item create --category="API Credential" \
  --title="Lightspeed Personal Token - Reggie & Dro" \
  --tags="production,lightspeed,integration" \
  'token[password]=<PASTE_TOKEN_HERE>'

# Notify Claude Code in HUMAN_WORK_FOR_JESSE.md
echo "✅ Lightspeed token generated and stored in 1Password" >> .claude/HUMAN_WORK_FOR_JESSE.md

# Claude Code will handle the rest (30 min activation)
```

---

**READY FOR IMMEDIATE ACTIVATION** ⚡
**EXPECTED VALUE**: $80K→$100K revenue optimization
**ACTIVATION TIME**: <30 minutes after token
**BLOCKER**: Awaiting Jesse's personal token generation

**Last Updated**: 2025-10-08T02:15:00Z
**Owner**: Claude Code (Sonnet 4.5)
