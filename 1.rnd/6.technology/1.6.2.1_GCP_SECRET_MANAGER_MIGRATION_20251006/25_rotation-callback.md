### Rotation Callback

```javascript
const { startRotation } = require('../common/secrets/rotation-scheduler');

startRotation({
  onRotationComplete: async (result) => {
    if (result.success) {
      console.log(`✅ Rotated ${result.secretsRotated} secrets in ${result.duration}ms`);
      // Send metrics to monitoring system
      await sendMetric('secret.rotation.success', result.secretsRotated);
    } else {
      console.error(`❌ Rotation failed: ${result.error}`);
      // Alert on failure
      await sendAlert('secret.rotation.failed', result.error);
    }
  }
});
```

---
