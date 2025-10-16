### Basic Secret Loading

```javascript
const { getSecret } = require('../common/secrets');

// Load a single secret
const apiKey = await getSecret('SQUARE_ACCESS_TOKEN');

// Force refresh (bypass cache)
const freshKey = await getSecret('SQUARE_ACCESS_TOKEN', { refresh: true });

// Custom cache TTL (2 hours)
const shortLivedKey = await getSecret('TEMP_TOKEN', {
  expiresIn: 2 * 60 * 60 * 1000
});
```
