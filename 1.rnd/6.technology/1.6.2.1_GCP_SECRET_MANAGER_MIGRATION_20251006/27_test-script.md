### Test Script

```javascript
// test-secrets.js
const { getSecret, loadSecrets, getCacheStatus } = require('./backend/common/secrets');

async function testSecrets() {
  console.log('Testing Secret Manager...\n');

  // Test 1: Single secret load
  console.log('Test 1: Load single secret');
  try {
    const secret = await getSecret('JWT_SECRET');
    console.log('✅ JWT_SECRET loaded from:', getCacheStatus().JWT_SECRET?.source);
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }

  // Test 2: Batch load
  console.log('\nTest 2: Batch load secrets');
  try {
    const secrets = await loadSecrets([
      'JWT_SECRET',
      'JWT_AUDIENCE',
      'JWT_ISSUER'
    ]);
    console.log('✅ Loaded', Object.keys(secrets).length, 'secrets');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }

  // Test 3: Cache status
  console.log('\nTest 3: Cache status');
  const status = getCacheStatus();
  console.log('Cached secrets:', Object.keys(status).length);
  Object.entries(status).forEach(([name, data]) => {
    console.log(`  - ${name}: ${data.source} (TTL: ${Math.floor(data.ttl / 60)}m)`);
  });

  // Test 4: Fallback behavior
  console.log('\nTest 4: Fallback behavior');
  try {
    await getSecret('NONEXISTENT_SECRET');
  } catch (error) {
    console.log('✅ Correctly failed for nonexistent secret');
  }
}

testSecrets().then(() => {
  console.log('\n✅ All tests completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Tests failed:', error);
  process.exit(1);
});
```

Run tests:

```bash
# Local dev (1Password)
node test-secrets.js

# Production (GCP)
GCP_PROJECT_ID=livhana-production node test-secrets.js
```

---
