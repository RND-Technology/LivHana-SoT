# Delivery Service - Lightspeed Integration

**Mission:** Beat Nash/Square Online with direct Lightspeed → DoorDash/Uber integration

## Why This Beats Nash

### Nash/Square Limitations:
- ❌ Requires Square intermediary (extra costs)
- ❌ Limited to Square's delivery partners
- ❌ No multi-provider failover
- ❌ Square takes cut of every transaction
- ❌ Limited customization

### Our Advantages:
- ✅ Direct Lightspeed integration (no intermediary)
- ✅ Multi-provider (DoorDash + Uber) with automatic failover
- ✅ White-label delivery (your branding, not DoorDash/Uber)
- ✅ Lower costs (no Square markup)
- ✅ Full control over delivery experience

## Features

- **Lightspeed Webhook Handler** - Automatic delivery creation when orders are placed
- **Multi-Provider Routing** - Try DoorDash first, fallback to Uber automatically
- **Real-Time Quotes** - Get delivery cost at checkout
- **Order Tracking** - Real-time delivery status for customers
- **Zone Validation** - 35-mile radius from store
- **Cancellation Support** - Cancel deliveries with refunds

## API Endpoints

### POST `/api/delivery/lightspeed/webhook`
Receives order webhooks from Lightspeed
- **Auth:** None (validate via Lightspeed signature)
- **Body:** Lightspeed order payload
- **Response:** Delivery details

### POST `/api/delivery/quote`
Get delivery quote for checkout
- **Body:** `{ cartTotal, deliveryAddress }`
- **Response:** `{ provider, fee, estimatedMinutes }`

### POST `/api/delivery/create`
Create delivery from checkout
- **Body:** Delivery request object
- **Response:** Delivery ID + tracking URL

### GET `/api/delivery/status/:deliveryId`
Get delivery status
- **Response:** `{ status, driverName, driverPhone, trackingUrl }`

### POST `/api/delivery/cancel`
Cancel delivery
- **Body:** `{ deliveryId, reason }`
- **Response:** `{ cancelled, refundAmount }`

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in:
- `DOORDASH_API_KEY` - Get from https://merchant.delivery.com/
- `UBER_API_KEY` - Get from https://business.uber.com/
- `LIGHTSPEED_API_TOKEN` - Get from Lightspeed dashboard

### 3. Run Service
```bash
npm start
```

Service runs on port 4003 by default.

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

## Provider Setup

### DoorDash Drive (White-Label)
1. Apply at https://merchant.delivery.com/
2. Select "White Label" or "Enterprise"
3. Complete business verification
4. Get API credentials
5. Configure custom branding

### Uber Direct (White-Label)
1. Apply at https://business.uber.com/
2. Select "White Label" delivery
3. Complete business verification
4. Get API credentials
5. Configure custom branding

## Integration with Lightspeed Website

Add to checkout page (`reggieanddro.com/checkout`):

```javascript
// Get delivery quote
const response = await fetch('https://your-delivery-service.com/api/delivery/quote', {
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

const { provider, fee, estimatedMinutes } = await response.json();

// Show delivery fee: $5.00 (arrives in 30-45 minutes)
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

## Cost Comparison

### Nash/Square Online:
- Square transaction fee: 2.9% + $0.30
- Square delivery markup: ~15-20%
- Limited to Square's partners
- **Total for $75 order:** ~$2.18 Square fee + delivery fee + markup = **$10-15**

### Our Solution:
- No intermediary fees: $0
- Direct provider pricing: $5-8
- Volume discounts available
- **Total for $75 order:** **$5-8** (save $5-7 per order)

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
