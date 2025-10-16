#### Before: Client-Side Filtering

```javascript
// ❌ OLD: Fetch 1000 rows, filter in JavaScript
const [payments] = await client.query({
  query: 'SELECT * FROM payments WHERE created_at > ...'
});

const todayRevenue = payments
  .filter(p => new Date(p.created_at) >= dayAgo)
  .reduce((sum, p) => sum + p.amount, 0);
```

**Problems:**

- Full table scan (180 days of data)
- 1000+ rows transferred
- Client-side aggregation
- Multiple passes over data
- 2-5 second latency
