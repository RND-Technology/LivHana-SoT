#### GET /api/memory/analytics/insights

Aggregate customer insights over time period.

**Query Parameters:**

- `startDate`: ISO 8601 date
- `endDate`: ISO 8601 date

**Response:**

```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "insights": [
    {
      "date": "2025-01-15",
      "active_customers": 450,
      "total_interactions": 1250,
      "avg_engagement": 0.75,
      "avg_sentiment": 0.65
    }
  ]
}
```
