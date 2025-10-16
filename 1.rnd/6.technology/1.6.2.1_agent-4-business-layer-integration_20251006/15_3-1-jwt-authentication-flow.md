### 3.1 JWT Authentication Flow

**Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                   JWT AUTHENTICATION FLOW                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │  Auth Gateway│         │   Backend    │
│   (Vite App) │────────▶│  Middleware  │────────▶│   Services   │
│              │         │              │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                         │                         │
       │ Authorization:         │ JWT verification        │
       │ Bearer <token>         │ Algorithm: HS256        │ req.user = decoded
       │                        │ Check audience/issuer   │
       ▼                        ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│  TOKEN PAYLOAD:                                               │
│  {                                                            │
│    sub: "user-id-123",                                        │
│    email: "customer@example.com",                            │
│    role: "customer" | "admin",                               │
│    aud: "livhana-services",                                  │
│    iss: "livhana-auth",                                      │
│    iat: 1696123456,                                          │
│    exp: 1696209856 // 24 hours                              │
│  }                                                            │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**

**File:** `/backend/common/auth/middleware.js`

```javascript
export const authMiddleware = ({ logger, config = {} } = {}) => {
  const mergedConfig = { ...JWT_CONFIG, ...config };

  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check for Bearer token
    if (!authHeader?.startsWith('Bearer ')) {
      logger?.warn({ path: req.path }, 'Missing authorization header');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
      // Verify JWT signature + claims
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        audience: mergedConfig.audience, // "livhana-services"
        issuer: mergedConfig.issuer, // "livhana-auth"
        algorithms: mergedConfig.algorithms, // ["HS256"]
      });

      // Attach user to request
      req.user = decoded;
      next();

    } catch (error) {
      logger?.error({ error: error.message }, 'JWT validation failed');
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};
```

**Configuration:**

**File:** `/backend/common/auth/config.js`

```javascript
export const JWT_CONFIG = {
  audience: process.env.JWT_AUDIENCE || 'livhana-services',
  issuer: process.env.JWT_ISSUER || 'livhana-auth',
  algorithms: ['HS256'], // HMAC SHA-256
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
```

**Environment Variables:**

```bash
JWT_SECRET=<256-bit secret key> # REQUIRED
JWT_AUDIENCE=livhana-services
JWT_ISSUER=livhana-auth
JWT_EXPIRES_IN=24h
```

**Token Generation:**

**File:** `/backend/reasoning-gateway/scripts/generate-dev-token.js`

```javascript
import jwt from 'jsonwebtoken';

const payload = {
  sub: 'dev-user-123',
  email: 'dev@livhana.com',
  role: 'admin',
  name: 'Dev User'
};

const token = jwt.sign(payload, process.env.JWT_SECRET, {
  audience: 'livhana-services',
  issuer: 'livhana-auth',
  expiresIn: '24h'
});

console.log('Dev JWT Token:', token);
```

**Protected Routes:**

```javascript
// integration-service/src/index.js:41-44
if (process.env.NODE_ENV === 'production') {
  app.use('/api', authMiddleware({ logger }));
}
// In dev: Auth DISABLED for testing
// In prod: Auth REQUIRED for all /api routes

// reasoning-gateway/src/index.js:59-61
app.use('/api/reasoning', authMiddleware({ logger }), createReasoningRouter(...));
app.use('/api/memory', authMiddleware({ logger }), createMemoryRouter(...));
app.use('/api/autonomous', authMiddleware({ logger }), createAutonomousRouter(...));
// Auth ALWAYS enabled on reasoning-gateway
```

**Security Features:**

1. **Algorithm Whitelist:** Only HS256 allowed (prevents algorithm confusion attacks)
2. **Audience Validation:** Token must be issued for "livhana-services"
3. **Issuer Validation:** Token must be from "livhana-auth"
4. **Expiration Enforcement:** 24-hour default expiry
5. **Secret Rotation:** JWT_SECRET can be rotated via env var

**Admin Authorization:**

**File:** `/backend/common/auth/admin-middleware.js`

```javascript
export const adminMiddleware = ({ logger } = {}) => {
  return (req, res, next) => {
    // Assumes authMiddleware already ran (req.user populated)

    if (!req.user) {
      logger?.warn('Admin check failed: No user in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.role !== 'admin') {
      logger?.warn({ userId: req.user.sub, role: req.user.role }, 'Admin access denied');
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  };
};

// Usage:
app.get('/api/admin/stats', authMiddleware({ logger }), adminMiddleware({ logger }), (req, res) => {
  // Only admins can access
});
```

---
