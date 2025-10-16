#### POST /api/memory/purchase/:customerId

Record a customer purchase.

**Request:**

```json
{
  "purchase": {
    "orderId": "order-789",
    "amount": 150.00,
    "products": [
      {
        "productId": "prod-123",
        "name": "Blue Dream",
        "strain": "Sativa",
        "quantity": 2
      }
    ],
    "paymentMethod": "credit_card",
    "timestamp": "2025-01-15T10:00:00Z"
  }
}
```

**Response:**

```json
{
  "success": true,
  "lifetimeValue": 1250.00,
  "totalPurchases": 8
}
```
