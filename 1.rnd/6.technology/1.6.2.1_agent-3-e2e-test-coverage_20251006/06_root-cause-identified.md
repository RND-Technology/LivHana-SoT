#### ROOT CAUSE IDENTIFIED

**THE ISSUE IS NOT A HANG - IT'S AN ASYNC TIMING RACE CONDITION**

Analysis of `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service/src/index.js` reveals:

```javascript
// Line 27-38 of index.js
app.get('/health', (req, res) => {
  const status = getBigQueryStatus();  // ⚠️ SYNCHRONOUS CALL
  res.json({
    status: 'healthy',
    service: 'integration-service',
    timestamp: new Date().toISOString(),
    bigQuery: status,
    square: {
      enabled: squareCatalog.isLive(),  // ⚠️ SYNCHRONOUS CALL
      mode: squareCatalog.getMode()     // ⚠️ SYNCHRONOUS CALL
    }
  });
});
```

The health endpoint itself is synchronous and responds immediately. However, **on first call**, BigQuery's `getBigQueryStatus()` function triggers cache initialization:

```javascript
// From bigquery_live.js lines 241-245
async function ensureFreshCache() {
  if (!cache.lastRefresh || Date.now() > cache.expiresAt) {
    await refreshCache();  // ⚠️ THIS CAN TAKE 5-30 SECONDS ON FIRST RUN
  }
}
```

**Why curl works but Playwright "hangs":**

1. **curl is called AFTER services warm up** - Cache already initialized
2. **Playwright runs immediately** - Catches the service during cold start
3. **BigQuery queries take 5-30s** on first execution (lines 69-127 of bigquery_live.js)
4. **Playwright default timeout** is likely too short for cold start
