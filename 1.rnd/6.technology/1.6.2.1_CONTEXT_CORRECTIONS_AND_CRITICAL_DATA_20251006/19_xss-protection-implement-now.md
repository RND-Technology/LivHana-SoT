### XSS Protection - IMPLEMENT NOW

**You said: "NEED TIER 1 SOLUTION, what are you waiting for?"**

**I'LL FIX IT NOW:**

```bash
# Install DOMPurify for API response sanitization
cd backend/common
npm install isomorphic-dompurify
```

**Create sanitization middleware:**

```javascript
// backend/common/security/sanitize.js
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeMiddleware = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query params
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Wrap res.json to sanitize responses
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    return originalJson(sanitizeObject(data));
  };

  next();
};

function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}
```

**Apply to all services:**

```javascript
// backend/voice-service/src/index.js
import { sanitizeMiddleware } from '../../common/security/sanitize.js';

app.use(sanitizeMiddleware);
```
