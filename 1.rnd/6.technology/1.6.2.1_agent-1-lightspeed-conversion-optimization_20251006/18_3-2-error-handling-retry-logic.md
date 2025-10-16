### 3.2 Error Handling & Retry Logic

**File:** `/backend/integration-service/src/lightspeed-sync-scheduler.js`
**Lines:** 16-31

**Current Issue:**

```javascript
try {
  const output = execSync('node scripts/sync-lightspeed-to-bigquery.js', {
    cwd: __dirname + '/..',
    encoding: 'utf8',
    timeout: 300000 // 5 min timeout
  });
  logger.info('Lightspeed sync completed successfully');
} catch (error) {
  logger.error('Lightspeed sync failed', { error: error.message });
  // NO RETRY LOGIC
}
```

**Improvement:**

```javascript
async function executeSyncWithRetry(maxRetries = 3, delay = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const output = execSync('node scripts/sync-lightspeed-to-bigquery.js', {
        cwd: __dirname + '/..',
        encoding: 'utf8',
        timeout: 300000
      });

      logger.info('Lightspeed sync completed successfully', {
        attempt,
        output: output.trim().split('\n').slice(-5).join('\n')
      });
      return; // Success - exit retry loop

    } catch (error) {
      logger.error('Lightspeed sync failed', {
        attempt,
        maxRetries,
        error: error.message,
        stderr: error.stderr?.toString()
      });

      if (attempt < maxRetries) {
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        // Final failure - alert ops team
        await sendSlackAlert('🚨 LightSpeed sync failed after 3 attempts');
      }
    }
  }
}
```

**Reliability ROI:**

- Prevents data gaps from transient API failures
- Reduces ops team alert fatigue (auto-recovery)
- Maintains sync continuity during LightSpeed API hiccups
