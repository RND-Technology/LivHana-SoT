#### GET /api/memory/analytics/ltv/:customerId

Calculate customer lifetime value.

**Response:**

```json
{
  "customerId": "customer-123",
  "total_spent": 2500.00,
  "order_count": 18,
  "avg_order_value": 138.89,
  "first_purchase": "2024-01-15T00:00:00Z",
  "last_purchase": "2025-01-10T00:00:00Z"
}
```
