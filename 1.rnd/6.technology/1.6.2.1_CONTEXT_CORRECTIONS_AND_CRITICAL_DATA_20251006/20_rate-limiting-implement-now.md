### Rate Limiting - IMPLEMENT NOW

**You said: "Complete all design, and build full auto!"**

**I'LL ADD IT NOW:**

```bash
# Install rate limiting
cd backend/common
npm install express-rate-limit
```

**Create rate limiter:**

```javascript
// backend/common/security/rate-limit.js
import rateLimit from 'express-rate-limit';

export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis for distributed rate limiting
    store: options.store, // pass Redis store in production
  });
};

// Tiered rate limits
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5 // 5 login attempts per 15 min
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100 // 100 API calls per 15 min
});

export const publicRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000 // 1000 requests per 15 min for public endpoints
});
```

**Apply to all services:**

```javascript
// backend/voice-service/src/index.js
import { apiRateLimiter } from '../../common/security/rate-limit.js';

app.use('/api', apiRateLimiter, authMiddleware({ logger }), voiceRouter);
```

---
