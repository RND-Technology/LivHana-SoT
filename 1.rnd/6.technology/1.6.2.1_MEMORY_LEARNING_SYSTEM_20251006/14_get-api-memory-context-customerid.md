#### GET /api/memory/context/:customerId

Retrieve comprehensive customer context.

**Query Parameters:**

- `sessionId` (optional): Include session context
- `depth` (optional): `summary` | `full` (default: `summary`)
- `includeRecommendations` (optional): `true` | `false`
- `currentMessage` (optional): Current message for vector context

**Response:**

```json
{
  "customerId": "customer-123",
  "preferences": {
    "strains": [
      { "value": "Blue Dream", "weight": 10 },
      { "value": "OG Kush", "weight": 8 }
    ],
    "effects": [
      { "value": "relaxing", "weight": 7 }
    ]
  },
  "recentTopics": ["strain", "effect", "price"],
  "lastInteraction": "2025-01-15T10:00:00Z",
  "churnRisk": 0.15,
  "session": { /* session data */ },
  "vectorContext": {
    "relevantProducts": [ /* similar products */ ],
    "similarConversations": [ /* past conversations */ ],
    "synthesizedContext": "Relevant products: Blue Dream (Sativa)..."
  }
}
```
