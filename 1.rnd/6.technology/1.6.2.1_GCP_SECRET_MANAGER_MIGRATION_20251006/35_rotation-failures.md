### Rotation Failures

```javascript
// Check rotation status
const { getRotationStatus } = require('./backend/common/secrets/rotation-scheduler');
console.log(getRotationStatus());

// View detailed cache status
const { getCacheStatus } = require('./backend/common/secrets');
console.log(getCacheStatus());

// Clear cache and retry
const { clearCache } = require('./backend/common/secrets');
clearCache();
```
