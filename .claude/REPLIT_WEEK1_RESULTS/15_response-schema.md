### Response Schema
```typescript
{
  id: string,
  basic: { /* Lightspeed customer data */ },
  purchase_history: [
    { product_id, purchase_count, last_purchase }
  ],
  preferences: { category: count },
  content_engagement: [
    { content_type, views, avg_time }
  ],
  predictions: {
    next_purchase_date: ISO8601 | null,
    likely_products: [
      { product_id, confidence }
    ]
  }
}
```
