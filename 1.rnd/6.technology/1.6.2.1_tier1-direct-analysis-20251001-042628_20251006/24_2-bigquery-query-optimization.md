### **2. BigQuery Query Optimization:**

**Current Pattern:**

```javascript
const query = `SELECT * FROM table WHERE condition`;
const [rows] = await bqClient.query(query);
```

**Optimized Pattern:**

```javascript
const query = `SELECT specific, columns FROM table WHERE condition LIMIT 1`;
const [rows] = await bqClient.query({
  query,
  location: LOCATION,
  params: { customerId },
  maxResults: 1,
  useQueryCache: true // Enable query cache!
});
```
