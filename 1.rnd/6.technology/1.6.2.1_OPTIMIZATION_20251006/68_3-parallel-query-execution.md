### 3. Parallel Query Execution

```javascript
const [metricsResult, recentResult] = await Promise.all([
  client.query({ query: metricsQuery }),
  client.query({ query: recentQuery })
]);
```
