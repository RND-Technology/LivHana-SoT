# Customer Profile Service

Unified customer profile enriched from all data sources with AI-powered predictions.

## Features

- ✅ Parallel data fetching (BigQuery + Lightspeed + Analytics)
- ✅ Unified customer profile
- ✅ Simple prediction heuristics (next purchase, likely products)
- ✅ Preference extraction from purchase history
- ✅ TypeScript strict mode
- ✅ Health check endpoint
- ✅ Docker support for Cloud Run

## API Endpoints

### `GET /health`
Health check endpoint.

### `GET /api/customers/:id/profile`
Get enriched customer profile.

**Response:**
```json
{
  "id": "12345",
  "basic": { /* Lightspeed customer data */ },
  "purchase_history": [
    {
      "product_id": "CBD-OIL-1000",
      "purchase_count": 5,
      "last_purchase": "2025-10-01T12:00:00Z"
    }
  ],
  "preferences": {
    "CBD": 10,
    "Sleep": 5
  },
  "content_engagement": [
    {
      "content_type": "video",
      "views": 15,
      "avg_time": 245.5
    }
  ],
  "predictions": {
    "next_purchase_date": "2025-11-01T12:00:00Z",
    "likely_products": [
      {
        "product_id": "CBD-OIL-1000",
        "confidence": 0.85
      }
    ]
  }
}
```

## Setup

See main README for setup instructions.

## Deploy

```bash
gcloud run deploy customer-profile \
  --source . \
  --region us-central1 \
  --port 8081
```
