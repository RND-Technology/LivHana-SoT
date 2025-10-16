#### Integration Service Example

```javascript
// backend/integration-service/src/index.js

const express = require('express');
const { initializeJWTConfig } = require('../../common/auth/config-secure');
const { loadSecrets, startRotation } = require('../../common/secrets');

const app = express();

async function startServer() {
  try {
    // Initialize JWT config
    await initializeJWTConfig();

    // Load all required secrets at startup
    const secrets = await loadSecrets([
      'SQUARE_ACCESS_TOKEN',
      'KAJA_API_KEY',
      'KAJA_API_SECRET',
      'AGE_VERIFICATION_ENCRYPTION_KEY'
    ]);

    // Start auto-rotation
    startRotation();

    // Make secrets available to app
    global.SQUARE_ACCESS_TOKEN = secrets.SQUARE_ACCESS_TOKEN;
    global.KAJA_API_KEY = secrets.KAJA_API_KEY;

    // Continue with app setup
    const PORT = process.env.PORT || 3005;
    app.listen(PORT, () => {
      console.log(`Integration Service running on port ${PORT}`);
      console.log('Secrets loaded from:', process.env.GCP_PROJECT_ID ? 'GCP' : '1Password/env');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```
