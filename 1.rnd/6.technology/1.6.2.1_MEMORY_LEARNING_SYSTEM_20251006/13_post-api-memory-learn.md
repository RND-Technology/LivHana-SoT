#### POST /api/memory/learn

Record and learn from a customer interaction.

**Request:**

```json
{
  "customerId": "customer-123",
  "interaction": {
    "message": "I need something for sleep and anxiety",
    "response": "I recommend Indica strains like Granddaddy Purple",
    "sentiment": 0.8,
    "intent": "product_recommendation",
    "entities": {
      "strains": ["Indica"],
      "symptoms": ["sleep", "anxiety"]
    },
    "sessionId": "session-456",
    "timestamp": "2025-01-15T10:00:00Z"
  }
}
```

**Response:**

```json
{
  "success": true,
  "interactionId": "uuid",
  "profile": {
    "totalInteractions": 15,
    "engagement": 0.85,
    "churnRisk": 0.12
  }
}
```
