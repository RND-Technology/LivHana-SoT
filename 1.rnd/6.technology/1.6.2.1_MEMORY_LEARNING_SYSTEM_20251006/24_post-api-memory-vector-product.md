#### POST /api/memory/vector/product

Store product embedding for semantic search.

**Request:**

```json
{
  "product": {
    "productId": "prod-123",
    "name": "Blue Dream",
    "description": "A balanced hybrid strain...",
    "strain": "Hybrid",
    "effects": ["uplifting", "creative", "relaxing"],
    "category": "flower"
  }
}
```
