### Batch Secret Loading

```javascript
const { loadSecrets } = require('../common/secrets');

// Load multiple secrets at once
const secrets = await loadSecrets([
  'JWT_SECRET',
  'SQUARE_ACCESS_TOKEN',
  'KAJA_API_KEY'
]);

console.log('Loaded secrets:', Object.keys(secrets));
```
