### 3.1 Authentication Enhancement

**File:** `/backend/integration-service/scripts/sync-lightspeed-to-bigquery.js`
**Lines:** 40-72

**Current Issue:**

```javascript
// Line 41-44: API Key stored in plain env var
[REDACTED - SECURITY BREACH]
  console.log('🔐 Using API Key authentication');
[REDACTED - SECURITY BREACH]
}
```

**Improvement:**

```javascript
// Use encrypted secrets with rotation
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const secretClient = new SecretManagerServiceClient();

async function authenticate() {
  if (process.env.NODE_ENV === 'production') {
    // Fetch from GCP Secret Manager
    const [version] = await secretClient.accessSecretVersion({
      name: 'projects/reggieanddrodispensary/secrets/lightspeed-api-key/versions/latest'
    });
    const apiKey = version.payload.data.toString('utf8');
    return apiKey;
  } else {
    // Dev mode: use env var
[REDACTED - SECURITY BREACH]
  }
}
```

**Security ROI:**

- Prevents API key leakage in logs
- Enables key rotation without code changes
- Compliance with PCI-DSS requirements for payment systems
