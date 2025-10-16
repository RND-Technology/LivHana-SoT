### Cache Management

```javascript
const { getCacheStatus, clearCache } = require('../common/secrets');

// View cache status
const status = getCacheStatus();
console.log('Cached secrets:', status);
// Output:
// {
//   JWT_SECRET: { source: 'GCP Secret Manager', ttl: 86394, expiresAt: '2025-10-02T...' },
//   SQUARE_ACCESS_TOKEN: { source: '1Password', ttl: 86394, expiresAt: '2025-10-02T...' }
// }

// Clear cache (forces reload on next access)
clearCache();
```

---
