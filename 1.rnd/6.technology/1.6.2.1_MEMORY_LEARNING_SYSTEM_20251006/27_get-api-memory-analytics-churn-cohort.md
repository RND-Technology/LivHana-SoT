#### GET /api/memory/analytics/churn-cohort

Identify customers at risk of churning.

**Query Parameters:**

- `riskThreshold`: 0-1 (default: 0.7)

**Response:**

```json
{
  "riskThreshold": 0.7,
  "cohort": [
    {
      "customer_id": "customer-123",
      "churn_risk": 0.85,
      "last_interaction_date": "2024-11-01T00:00:00Z",
      "last_purchase_date": "2024-10-15T00:00:00Z",
      "lifetime_value": 2500.00
    }
  ],
  "totalAtRisk": 23
}
```
