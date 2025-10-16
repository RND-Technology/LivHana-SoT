#### POST /api/memory/vector/search

Semantic search for products or conversations.

**Request:**

```json
{
  "query": "something relaxing for anxiety",
  "searchType": "products",  // or "conversations"
  "options": {
    "limit": 10,
    "minScore": 0.7,
    "filters": {
      "category": "flower"
    }
  }
}
```

**Response:**

```json
{
  "query": "something relaxing for anxiety",
  "searchType": "products",
  "results": [
    {
      "productId": "prod-123",
      "name": "Granddaddy Purple",
      "strain": "Indica",
      "effects": ["relaxing", "sleep"],
      "score": 0.92
    }
  ],
  "count": 5
}
```
