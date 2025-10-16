#### Reasoning Gateway Example

```javascript
// backend/reasoning-gateway/src/index.js

const express = require('express');
const { initializeJWTConfig } = require('../../common/auth/config-secure');
const { startRotation } = require('../../common/secrets/rotation-scheduler');

const app = express();

async function startServer() {
  try {
    // Initialize secrets BEFORE any auth operations
    await initializeJWTConfig();

    // Start automatic secret rotation (24h)
    startRotation();

    // Load other secrets as needed
    const { getSecret } = require('../../common/secrets');
    const anthropicKey = await getSecret('ANTHROPIC_API_KEY');
    const deepseekKey = await getSecret('DEEPSEEK_API_KEY');

    // Continue with app setup
    const PORT = process.env.PORT || 4002;
    app.listen(PORT, () => {
      console.log(`Reasoning Gateway running on port ${PORT}`);
      console.log('Secret Manager: Active');
      console.log('Auto-Rotation: Enabled (24h)');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```
