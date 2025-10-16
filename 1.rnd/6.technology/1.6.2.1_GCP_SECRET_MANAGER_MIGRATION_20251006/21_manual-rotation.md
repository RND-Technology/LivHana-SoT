### Manual Rotation

```javascript
const { rotateNow, getRotationStatus } = require('../common/secrets/rotation-scheduler');

// Trigger immediate rotation (e.g., after secret update in GCP)
await rotateNow();

// Check rotation status
const status = getRotationStatus();
console.log('Last rotation:', status.lastRotation);
console.log('Next rotation:', status.nextRotation);
console.log('Total rotations:', status.rotationCount);
```
