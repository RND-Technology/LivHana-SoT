### 4. Performance Monitoring

```javascript
const startTime = Date.now();
// ... execute query ...
const queryTime = Date.now() - startTime;
logger.info(`Dashboard query completed in ${queryTime}ms`);
```

---
