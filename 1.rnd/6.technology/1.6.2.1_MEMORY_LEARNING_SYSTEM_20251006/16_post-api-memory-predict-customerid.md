#### POST /api/memory/predict/:customerId

Generate predictions for customer behavior.

**Request:**

```json
{
  "predictionType": "all"  // or "next-purchase", "churn-risk", "recommendations"
}
```

**Response:**

```json
{
  "customerId": "customer-123",
  "predictions": {
    "nextPurchase": {
      "nextPurchaseDate": "2025-02-15T00:00:00Z",
      "confidence": 0.85,
      "daysSinceLastPurchase": 25,
      "averageFrequency": 30
    },
    "churnRisk": {
      "churnRisk": 0.15,
      "daysSinceLastPurchase": 25,
      "daysSinceLastInteraction": 2,
      "engagement": 0.85,
      "sentiment": 0.7
    },
    "recommendations": [
      {
        "type": "strain",
        "values": ["Blue Dream", "OG Kush", "Sour Diesel"],
        "reason": "Based on your past preferences",
        "confidence": 0.8
      }
    ]
  }
}
```
