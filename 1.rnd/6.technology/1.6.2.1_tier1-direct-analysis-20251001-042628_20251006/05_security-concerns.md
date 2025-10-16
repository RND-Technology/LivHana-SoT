### **Security Concerns:**

```javascript
// ⚠️ ISSUE: No rate limiting on subscription endpoint
router.post('/api/memberships/subscribe', async (req, res) => {
  // Direct BigQuery insert without rate limit check
  await saveMembership(membershipData);
});
```

**FIX:** Add rate limiting middleware:

```javascript
const rateLimit = require('express-rate-limit');

const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 min
  message: 'Too many subscription attempts, please try again later'
});

router.post('/api/memberships/subscribe', subscriptionLimiter, async (req, res) => {
  // ... existing code
});
```
