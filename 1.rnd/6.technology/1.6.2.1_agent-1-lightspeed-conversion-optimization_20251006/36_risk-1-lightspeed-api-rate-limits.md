### Risk 1: LightSpeed API Rate Limits

**Probability:** MEDIUM
**Impact:** HIGH (sync failures = data gaps)

**Current Exposure:**

- 15-minute sync interval = 96 API calls/day
- Full catalog fetch = ~500 products × 96 = 48K API calls/day
- LightSpeed limit: Unknown (need to check docs)

**Mitigation:**

```javascript
// Implement incremental sync (Lines 239-305 optimization)
// Add rate limit monitoring
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Max 100 requests per minute
  handler: (req, res) => {
    logger.error('Rate limit exceeded', { endpoint: req.path });
    res.status(429).json({ error: 'Rate limit exceeded, retry later' });
  }
});

// Apply to all LightSpeed API calls
app.use('/api/lightspeed', apiLimiter);
```
