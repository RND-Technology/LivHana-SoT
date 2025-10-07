# Delivery Service - Lightspeed Integration

**Mission:** Beat Nash/Square Online with direct Lightspeed integration + intelligent multi-provider routing

## 🚀 Why This Beats Nash

### Nash/Square Limitations:
- ❌ Requires Square intermediary (extra $4-5 per order)
- ❌ Limited to Square's delivery partners
- ❌ No multi-provider failover
- ❌ Square takes 2.9% + $0.30 of every transaction
- ❌ Limited customization
- ❌ No provider comparison (customer can't choose)
- ❌ Higher costs for both customer and merchant

### Our Competitive Advantages:
- ✅ **Direct Lightspeed integration** (no Square intermediary)
- ✅ **4 delivery providers** (DoorDash, Uber, Postmates, Grubhub) with intelligent routing
- ✅ **Automatic failover** (if DoorDash fails, try Uber, then Postmates, then Grubhub)
- ✅ **Lower costs** ($5-8 vs $9-12.48 per order)
- ✅ **Provider comparison UI** (customer sees all options + savings vs Nash)
- ✅ **Intelligent routing** (40% cost, 30% reliability, 20% speed, 10% rating)
- ✅ **White-label delivery** (your branding)
- ✅ **Full control** over delivery experience

## ⚡ Features

- **Lightspeed Webhook Handler** - Automatic delivery creation when orders are placed
- **Intelligent Multi-Provider Routing** - Weighted scoring algorithm (cost 40%, reliability 30%, speed 20%, rating 10%)
- **Automatic Failover** - If DoorDash fails → Uber → Postmates → Grubhub (no manual intervention)
- **Provider Comparison API** - Return ALL provider options with real-time quotes for superior UI
- **Real-Time Quotes** - Get delivery cost at checkout from all available providers
- **Smart Tags** - Auto-tag providers as "fastest", "cheapest", "recommended"
- **Order Tracking** - Real-time delivery status for customers
- **Zone Validation** - 35-mile radius from store (configurable)
- **Cancellation Support** - Cancel deliveries with automatic refunds
- **Cost Transparency** - Show savings vs Nash/Square on every order

## 📡 API Endpoints

### POST `/api/delivery/lightspeed/webhook`
Receives order webhooks from Lightspeed (automatic delivery creation)
- **Auth:** None (validate via Lightspeed signature)
- **Body:** Lightspeed order payload
- **Response:** `{ success, orderId, deliveryId, provider, trackingUrl, estimatedDelivery }`

### POST `/api/delivery/quote`
Get single BEST delivery quote for checkout (simple UI)
- **Body:** `{ cartTotal, deliveryAddress, preferences? }`
- **Response:** `{ success, provider, name, cost, estimatedMinutes, estimatedArrival, rating, score, tags, availableProviders }`

### POST `/api/delivery/providers/compare` 🆕
Get ALL provider quotes for comparison UI (superior UX - THIS BEATS NASH!)
- **Body:** `{ cartTotal, deliveryAddress }`
- **Response:**
```json
{
  "success": true,
  "providers": [
    {
      "provider": "doordash",
      "name": "DoorDash Drive",
      "cost": 5.50,
      "estimatedMinutes": 35,
      "estimatedArrival": "2025-10-07T14:35:00Z",
      "rating": 4.8,
      "score": 88,
      "tags": ["recommended"],
      "features": ["Real-time tracking", "SMS updates"]
    },
    {
      "provider": "uber",
      "name": "Uber Direct",
      "cost": 5.00,
      "estimatedMinutes": 40,
      "score": 85,
      "tags": ["cheapest"]
    }
  ],
  "totalAvailable": 2,
  "recommendation": { /* highest scored provider */ },
  "savings": {
    "vsNash": 4.50,
    "message": "Save $4.50 vs Nash/Square"
  }
}
```

### POST `/api/delivery/create`
Create delivery from checkout (uses intelligent routing)
- **Body:** Delivery request object
- **Response:** `{ success, deliveryId, provider, trackingUrl, estimatedDelivery }`

### GET `/api/delivery/status/:deliveryId`
Get real-time delivery status
- **Response:** `{ success, deliveryId, status, driverName, driverPhone, estimatedDelivery, trackingUrl }`

### POST `/api/delivery/cancel`
Cancel delivery with automatic refund
- **Body:** `{ deliveryId, reason }`
- **Response:** `{ success, deliveryId, cancelled, refundAmount }`

## 🛠️ Setup

### 1. Install Dependencies
```bash
cd backend/delivery-service
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in the required API keys:

**MINIMUM TO LAUNCH (30 minutes total):**
1. `LIGHTSPEED_API_TOKEN` (10 min) - Get from https://reggieanddro.retail.lightspeed.app
2. DoorDash credentials (15 min) - Get from https://developer.doordash.com/portal/
   - `DOORDASH_DEVELOPER_ID`
   - `DOORDASH_KEY_ID`
   - `DOORDASH_SIGNING_SECRET`
3. `UBER_API_KEY` (15 min) - Get from https://merchants.ubereats.com/

**OPTIONAL (expand later):**
4. `POSTMATES_API_KEY` - Get from https://postmates.com/partner/welcome
5. `GRUBHUB_API_KEY` - Get from https://get.grubhub.com/

See `.env.example` for detailed setup instructions.

### 3. Run Service
```bash
npm start
```

Service runs on port 8080 by default.

### 4. Configure Lightspeed Webhook
In Lightspeed dashboard:
1. Go to Settings → Integrations → Webhooks
2. Add webhook URL: `https://your-domain.com/api/delivery/lightspeed/webhook`
3. Subscribe to events: `order.completed`
4. Save

## Deployment

### Docker
```bash
docker build -t delivery-service .
docker run -p 4003:4003 --env-file .env delivery-service
```

### Cloud Run
```bash
gcloud run deploy delivery-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="$(cat .env | grep -v '^#' | xargs)"
```

## 🧠 Intelligent Routing Algorithm

Our scoring algorithm weighs multiple factors to select the best provider:

```javascript
Score = (Cost × 40%) + (Reliability × 30%) + (Speed × 20%) + (Rating × 10%)
```

**Example:**
- DoorDash: $5.50, 35 min, 95% reliability, 4.8 rating → **Score: 88** ✅ Recommended
- Uber: $5.00, 40 min, 93% reliability, 4.7 rating → **Score: 85** 💸 Cheapest
- Postmates: $5.25, 38 min, 94% reliability, 4.6 rating → **Score: 86**
- Grubhub: $6.00, 40 min, 91% reliability, 4.5 rating → **Score: 81**

**Automatic Failover:**
If DoorDash (score 88) fails → tries Postmates (score 86) → tries Uber (score 85) → tries Grubhub (score 81)

## 📦 Provider Setup

### DoorDash Drive (Priority 1 - 15 minutes)
1. Go to https://developer.doordash.com/portal/
2. Sign in or create a DoorDash Developer account
3. Navigate to "Credentials" section in the portal
4. Click the "+" icon to create a new access key
5. Name it (e.g., "reggieanddro-production")
6. Copy the generated credentials to `.env`:
   - `DOORDASH_DEVELOPER_ID`
   - `DOORDASH_KEY_ID`
   - `DOORDASH_SIGNING_SECRET`

**Note:** You'll start in Sandbox environment. For Production access:
- Contact DoorDash Sales: https://get.doordash.com/
- Request "Drive API Production access"

**Authentication:** Uses JWT (JSON Web Token) with Signing Secret

### Uber Direct (Priority 2 - 15 minutes)
1. Go to https://merchants.ubereats.com/
2. Log in to your Uber merchant account
3. Navigate to Account → API Access
4. Click "Generate API Key"
5. Copy `UBER_API_KEY` to `.env`

### Postmates Fleet (Optional)
1. Go to https://postmates.com/partner/welcome
2. Sign up for Postmates Fleet API
3. Get API credentials from developer portal
4. Copy `POSTMATES_API_KEY` to `.env`

### Grubhub Enterprise (Optional)
1. Go to https://get.grubhub.com/
2. Sign up for Grubhub Enterprise
3. Get API credentials from developer portal
4. Copy `GRUBHUB_API_KEY` to `.env`

## 🔌 Integration with Lightspeed Website

### Option 1: Simple Quote (Single Best Provider)
```javascript
// Get best delivery quote
const response = await fetch('https://delivery.reggieanddro.com/api/delivery/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cartTotal: 75.00,
    deliveryAddress: {
      street: '123 Main St',
      city: 'San Antonio',
      state: 'TX',
      zip: '78228'
    }
  })
});

const { provider, name, cost, estimatedMinutes, tags } = await response.json();

// Show: "Delivery: $5.00 via DoorDash (35 min) ✅ Recommended"
```

### Option 2: Provider Comparison (Superior UX - BEATS NASH!)
```javascript
// Get ALL provider quotes for comparison
const response = await fetch('https://delivery.reggieanddro.com/api/delivery/providers/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cartTotal: 75.00,
    deliveryAddress: {
      street: '123 Main St',
      city: 'San Antonio',
      state: 'TX',
      zip: '78228'
    }
  })
});

const { providers, recommendation, savings } = await response.json();

// Show comparison UI:
// ┌─────────────────────────────────────────┐
// │ Choose Your Delivery                    │
// ├─────────────────────────────────────────┤
// │ ✅ DoorDash Drive     $5.50  35 min     │ ← Recommended
// │ 💸 Uber Direct        $5.00  40 min     │ ← Cheapest
// │    Postmates Fleet    $5.25  38 min     │
// │    Grubhub Enterprise $6.00  40 min     │
// ├─────────────────────────────────────────┤
// │ 💰 Save $4.50 vs Nash/Square            │
// └─────────────────────────────────────────┘

providers.forEach(p => {
  console.log(`${p.tags.includes('recommended') ? '✅' : '  '} ${p.name}: $${p.cost} in ${p.estimatedMinutes} min`);
});

console.log(`💰 ${savings.message}`);
```

## Testing

```bash
# Health check
curl http://localhost:4003/health

# Get quote
curl -X POST http://localhost:4003/api/delivery/quote \
  -H "Content-Type: application/json" \
  -d '{"cartTotal": 75, "deliveryAddress": {"street":"123 Main","city":"San Antonio","state":"TX","zip":"78228"}}'

# Simulate Lightspeed webhook
curl -X POST http://localhost:4003/api/delivery/lightspeed/webhook \
  -H "Content-Type: application/json" \
  -d @test/lightspeed-order-sample.json
```

## 💰 Cost Comparison (Per $75 Order)

### Nash/Square Model:
- **Customer pays:** $84-88 total ($75 order + $9-13 delivery)
- **Merchant pays:** $9-12.48 in fees (Square 2.9% + $0.30 + delivery markup)
- **Square takes:** $2.18 transaction + markup on delivery
- **Provider gets:** ~$7-10
- **Total costs:** Customer overpays $9-13, Merchant loses $9-12.48

### Our Direct Model:
- **Customer pays:** $80-83 total ($75 order + $5-8 delivery)
- **Merchant pays:** $5-8 in provider fees (no intermediary)
- **Square takes:** $0 (direct integration)
- **Provider gets:** $5-8 (same drivers, better pricing)
- **Total costs:** Customer saves $4-5, Merchant saves $4-5

### Savings:
- **Customer saves:** $4-5 per order
- **Merchant saves:** $4-5 per order
- **Total savings:** $8-10 per order
- **Annual savings** (100 orders/month): $9,600-12,000/year

**Same drivers. Same reliability. Lower costs. Better UX.**

## IMPORTANT: We Use Nash's Model (Outsource Drivers)

**Nash uses:** DoorDash/Uber drivers (API integration)
**We use:** DoorDash/Uber drivers (API integration) - **SAME MODEL**

**Difference:** We skip Square intermediary = lower costs

**NO driver hiring needed**
**NO fleet management needed**
**Just get API keys and launch**

## Support

Contact: jesse@reggieanddro.com

## License

Proprietary - Reggie & Dro Cannabis Store
