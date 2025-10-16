#### Schema Definition

```javascript
{
  square_payments_partitioned: {
    timePartitioning: {
      type: 'DAY',
      field: 'created_at'
    },
    clustering: {
      fields: ['customer_id', 'status']
    }
  }
}
```
