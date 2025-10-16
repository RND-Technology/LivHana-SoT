### Refresh Mechanism

```javascript
// Auto-refresh every 30 seconds
useEffect(() => {
  if (!autoRefresh) return;
  const interval = setInterval(() => {
    fetchAllData();
  }, REFRESH_INTERVAL);
  return () => clearInterval(interval);
}, [autoRefresh, fetchAllData]);
```

---
