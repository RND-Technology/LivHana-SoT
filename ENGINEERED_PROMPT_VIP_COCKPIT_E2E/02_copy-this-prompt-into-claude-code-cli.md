## 🎯 COPY THIS PROMPT INTO CLAUDE CODE CLI

```
Build a production-ready VIP Cockpit system for Reggie & Dro / LivHana empire with secure login, role-based access, and E2E dashboards for all services using live production data.

MISSION:
Create a comprehensive R&D testing and monitoring cockpit that provides authenticated VIP users with full visibility and control across the entire ecosystem (delivery, voice, HNC content, e-commerce, compliance, analytics) with real-time production data.

ARCHITECTURE:
1. Authentication Layer:
   - Secure VIP login (email + password + 2FA optional)
   - JWT token-based auth (30-day expiration)
   - Role-based access control (RBAC): Admin, Developer, QA, Viewer
   - Session management with secure cookies
   - Password hashing with bcrypt (12+ rounds)
   - Rate limiting on login attempts (5 attempts/15 min)

2. User Profile System:
   - User table: id, email, password_hash, role, name, created_at, last_login
   - Profile preferences: theme (dark/light), default dashboard, timezone
   - Activity logging: all actions tracked with timestamps
   - Multi-factor authentication (TOTP via Google Authenticator)
   - API key generation for programmatic access

3. Unified Dashboard (Empire Cockpit):
   - Single-page React app with real-time updates
   - Service status cards (all microservices)
   - Live metrics streaming via WebSocket
   - Interactive charts (Chart.js or Recharts)
   - Responsive design (desktop + mobile)
   - Dark mode by default (professional aesthetic)

4. E2E Service Integration:
   a) Delivery Service Dashboard:
      - Live orders in progress
      - Provider status (DoorDash, Uber, Postmates, Grubhub)
      - Delivery metrics (avg time, cost, success rate)
      - Map view of active deliveries
      - Cost savings vs Nash in real-time
      - Provider comparison analytics

   b) Voice Service Dashboard:
      - ElevenLabs TTS usage and quota
      - DeepSeek reasoning queue status
      - Active voice sessions
      - Average response time
      - Error rates and retry statistics

   c) E-Commerce Dashboard (Lightspeed):
      - Real-time order feed
      - Revenue metrics (hourly, daily, weekly)
      - Top products by sales
      - Cart abandonment rate
      - Customer acquisition funnel
      - Inventory levels with low-stock alerts

   d) Compliance Dashboard (COA System):
      - Products with valid COAs
      - Expired/expiring COAs (alert system)
      - Texas compliance status (all batches <0.3% THC)
      - Lab test results visualization
      - Non-compliant product alerts

   e) HNC Content Engine:
      - Episode production status
      - Video generation progress
      - AI agent task queue
      - Content distribution metrics (YouTube, TikTok)
      - Engagement analytics

   f) Infrastructure Dashboard:
      - Cloud Run service health (all services)
      - Cloud Functions execution stats
      - Database connection pool status
      - Redis cache hit rates
      - Cloud Storage usage
      - Error rates by service
      - Response time percentiles (p50, p95, p99)

   g) Analytics Dashboard:
      - Customer behavior analytics
      - Revenue forecasting
      - A/B test results
      - SEO performance
      - Traffic sources
      - Conversion funnels

5. Real-Time Data Integration:
   - WebSocket server for live updates
   - Server-Sent Events (SSE) as fallback
   - Direct database queries (read replicas for performance)
   - API aggregation layer (combines data from all services)
   - Caching layer (Redis) for frequently accessed data
   - Polling intervals: 5s (critical), 30s (standard), 5min (analytics)

6. Security Best Practices:
   - HTTPS only (TLS 1.3)
   - Content Security Policy (CSP) headers
   - CORS configured for specific origins only
   - SQL injection prevention (parameterized queries)
   - XSS prevention (input sanitization)
   - CSRF tokens on all forms
   - Rate limiting per user (100 requests/min)
   - IP whitelisting for admin routes (optional)
   - Audit log for all admin actions
   - Encrypted environment variables (Secret Manager)

7. Testing Features:
   - API test runner (call any endpoint, see response)
   - Database query executor (read-only for non-admins)
   - Service health check runner (ping all services)
   - Load testing trigger (controlled stress tests)
   - Feature flag management (enable/disable features)
   - A/B test configuration
   - Mock data generator for testing
   - Error simulation (trigger specific error scenarios)

TECHNICAL STACK:
- Backend: Node.js + Express.js
- Frontend: React + Vite
- Auth: JWT + bcrypt + express-session
- Database: PostgreSQL (for user data, logs)
- Real-time: Socket.io or Server-Sent Events
- Charts: Recharts or Chart.js
- State Management: React Context or Zustand
- Styling: Tailwind CSS
- Deployment: Google Cloud Run
- Monitoring: Cloud Monitoring + custom metrics

FILE STRUCTURE:
```

backend/vip-cockpit/
├── src/
│   ├── index.js                 # Main Express app
│   ├── auth/
│   │   ├── auth-middleware.js   # JWT verification
│   │   ├── login.js             # Login endpoint
│   │   ├── register.js          # User registration (admin only)
│   │   ├── 2fa.js               # Two-factor auth
│   │   └── session.js           # Session management
│   ├── routes/
│   │   ├── dashboard.js         # Dashboard data aggregation
│   │   ├── delivery.js          # Delivery service metrics
│   │   ├── voice.js             # Voice service metrics
│   │   ├── ecommerce.js         # Lightspeed data
│   │   ├── compliance.js        # COA system data
│   │   ├── content.js           # HNC metrics
│   │   ├── infrastructure.js    # Cloud infrastructure
│   │   ├── analytics.js         # Business analytics
│   │   └── testing.js           # Testing tools
│   ├── services/
│   │   ├── data-aggregator.js   # Combines data from all services
│   │   ├── websocket.js         # Real-time updates
│   │   ├── cache.js             # Redis caching
│   │   └── logger.js            # Audit logging
│   ├── models/
│   │   ├── user.js              # User model
│   │   ├── session.js           # Session model
│   │   └── audit-log.js         # Audit log model
│   └── config/
│       ├── database.js          # DB connection
│       ├── redis.js             # Redis connection
│       └── services.js          # Service URLs
├── .env.example
├── package.json
├── Dockerfile
└── deploy.sh

frontend/vip-cockpit/
├── src/
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── Delivery.jsx         # Delivery dashboard
│   │   ├── Voice.jsx            # Voice dashboard
│   │   ├── ECommerce.jsx        # E-commerce dashboard
│   │   ├── Compliance.jsx       # Compliance dashboard
│   │   ├── Content.jsx          # Content engine dashboard
│   │   ├── Infrastructure.jsx   # Infrastructure dashboard
│   │   ├── Analytics.jsx        # Analytics dashboard
│   │   ├── Testing.jsx          # Testing tools
│   │   └── Profile.jsx          # User profile
│   ├── components/
│   │   ├── ServiceCard.jsx      # Service status card
│   │   ├── MetricChart.jsx      # Reusable chart component
│   │   ├── RealtimeWidget.jsx   # Real-time data widget
│   │   ├── AlertBanner.jsx      # Critical alerts
│   │   ├── Navbar.jsx           # Navigation
│   │   └── PrivateRoute.jsx     # Protected route wrapper
│   ├── hooks/
│   │   ├── useAuth.js           # Auth context hook
│   │   ├── useWebSocket.js      # WebSocket hook
│   │   └── useMetrics.js        # Metrics fetching hook
│   ├── services/
│   │   ├── api.js               # API client (axios)
│   │   └── websocket.js         # WebSocket client
│   ├── styles/
│   │   └── globals.css          # Tailwind + custom styles
│   └── utils/
│       ├── formatters.js        # Data formatting
│       └── validators.js        # Input validation
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── Dockerfile

```

DATABASE SCHEMA:
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  name VARCHAR(255) NOT NULL,
  totp_secret VARCHAR(255),
  totp_enabled BOOLEAN DEFAULT FALSE,
  api_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Sessions table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE,
  theme VARCHAR(20) DEFAULT 'dark',
  default_dashboard VARCHAR(50) DEFAULT 'overview',
  timezone VARCHAR(50) DEFAULT 'America/Chicago',
  email_notifications BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

API ENDPOINTS:

```
# Authentication
POST   /api/auth/login              - Login with email/password
POST   /api/auth/logout             - Logout and invalidate token
POST   /api/auth/register           - Register new user (admin only)
POST   /api/auth/2fa/enable         - Enable 2FA
POST   /api/auth/2fa/verify         - Verify 2FA code
GET    /api/auth/me                 - Get current user info
POST   /api/auth/refresh            - Refresh JWT token
POST   /api/auth/api-key/generate   - Generate API key

# Dashboard
GET    /api/dashboard/overview      - Get all services overview
GET    /api/dashboard/alerts        - Get active alerts
GET    /api/dashboard/metrics       - Get aggregated metrics

# Delivery Service
GET    /api/delivery/live-orders    - Active deliveries
GET    /api/delivery/providers      - Provider status
GET    /api/delivery/metrics        - Performance metrics
GET    /api/delivery/map            - Delivery map data

# Voice Service
GET    /api/voice/sessions          - Active voice sessions
GET    /api/voice/queue             - Reasoning queue status
GET    /api/voice/metrics           - Usage metrics

# E-Commerce
GET    /api/ecommerce/orders        - Recent orders
GET    /api/ecommerce/revenue       - Revenue metrics
GET    /api/ecommerce/products      - Product performance
GET    /api/ecommerce/inventory     - Inventory levels

# Compliance
GET    /api/compliance/coas         - COA status
GET    /api/compliance/expired      - Expired COAs
GET    /api/compliance/alerts       - Compliance alerts
GET    /api/compliance/texas        - Texas compliance summary

# Content Engine
GET    /api/content/episodes        - Episode status
GET    /api/content/progress        - Generation progress
GET    /api/content/queue           - AI agent queue
GET    /api/content/analytics       - Content performance

# Infrastructure
GET    /api/infrastructure/services - All service health
GET    /api/infrastructure/metrics  - Cloud metrics
GET    /api/infrastructure/errors   - Error logs

# Analytics
GET    /api/analytics/revenue       - Revenue analytics
GET    /api/analytics/customers     - Customer analytics
GET    /api/analytics/traffic       - Traffic analytics
GET    /api/analytics/conversion    - Conversion funnels

# Testing Tools
POST   /api/testing/api-call        - Test API endpoint
POST   /api/testing/health-check    - Check all services
POST   /api/testing/query           - Execute DB query (read-only)
POST   /api/testing/feature-flag    - Toggle feature flag
GET    /api/testing/mock-data       - Generate mock data

# WebSocket
WS     /ws/realtime                 - Real-time updates stream
```

SECURITY IMPLEMENTATION:

```javascript
// JWT middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Role-based access
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Rate limiting
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

// Audit logging
const auditLog = async (userId, action, resource, details) => {
  await db.query(
    'INSERT INTO audit_logs (user_id, action, resource, details, ip_address) VALUES ($1, $2, $3, $4, $5)',
    [userId, action, resource, JSON.stringify(details), req.ip]
  );
};
```

REAL-TIME DATA STREAMING:

```javascript
// WebSocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  // Verify JWT token
  const token = new URL(req.url, 'http://localhost').searchParams.get('token');
  const user = verifyToken(token);
  if (!user) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  // Subscribe to real-time updates
  const interval = setInterval(async () => {
    const metrics = await aggregateMetrics();
    ws.send(JSON.stringify({
      type: 'metrics',
      data: metrics,
      timestamp: Date.now()
    }));
  }, 5000); // Every 5 seconds

  ws.on('close', () => clearInterval(interval));
});
```

DASHBOARD UI (React):

```jsx
// Dashboard.jsx
import { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import ServiceCard from '../components/ServiceCard';
import MetricChart from '../components/MetricChart';

function Dashboard() {
  const [metrics, setMetrics] = useState({});
  const { data, isConnected } = useWebSocket('/ws/realtime');

  useEffect(() => {
    if (data) setMetrics(data);
  }, [data]);

  return (
    <div className="dashboard p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">
        Empire Cockpit - Live Dashboard
      </h1>

      {!isConnected && (
        <div className="bg-yellow-900 text-yellow-200 p-4 rounded mb-4">
          ⚠️ Reconnecting to real-time data...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ServiceCard
          title="Delivery Service"
          status={metrics.delivery?.status}
          metric={metrics.delivery?.activeOrders}
          label="Active Orders"
        />
        <ServiceCard
          title="Voice Service"
          status={metrics.voice?.status}
          metric={metrics.voice?.activeSessions}
          label="Active Sessions"
        />
        <ServiceCard
          title="E-Commerce"
          status={metrics.ecommerce?.status}
          metric={`$${metrics.ecommerce?.todayRevenue}`}
          label="Today's Revenue"
        />
        <ServiceCard
          title="Compliance"
          status={metrics.compliance?.status}
          metric={metrics.compliance?.validCOAs}
          label="Valid COAs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricChart
          title="Delivery Performance"
          data={metrics.delivery?.hourlyStats}
          type="line"
        />
        <MetricChart
          title="Revenue by Hour"
          data={metrics.ecommerce?.hourlyRevenue}
          type="bar"
        />
      </div>
    </div>
  );
}
```

DEPLOYMENT:

```bash
# Backend deployment
cd backend/vip-cockpit
gcloud run deploy vip-cockpit \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 1 \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="JWT_SECRET=vip-cockpit-jwt-secret:latest,DATABASE_URL=vip-cockpit-db-url:latest,REDIS_URL=vip-cockpit-redis-url:latest"

# Frontend deployment
cd frontend/vip-cockpit
npm run build
gcloud storage cp -r dist/* gs://vip-cockpit-frontend/

# Map domain
gcloud run domain-mappings create \
  --service vip-cockpit \
  --domain cockpit.herbitrage.com
```

ENVIRONMENT VARIABLES (.env):

```bash
# Server
NODE_ENV=production
PORT=8080

# Database
DATABASE_URL=postgresql://user:pass@host:5432/vip_cockpit

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=30d

# Service URLs
DELIVERY_SERVICE_URL=https://delivery.herbitrage.com
VOICE_SERVICE_URL=https://voice.herbitrage.com
LIGHTSPEED_API_URL=https://api.lightspeedhq.com
COA_SERVICE_URL=https://legal.herbitrage.com
HNC_SERVICE_URL=https://content.herbitrage.com

# Service API Keys
DELIVERY_API_KEY=your-delivery-api-key
VOICE_API_KEY=your-voice-api-key
LIGHTSPEED_API_TOKEN=your-lightspeed-token
COA_API_KEY=your-coa-api-key
HNC_API_KEY=your-hnc-api-key

# Google Cloud
GCP_PROJECT_ID=livhana-trinity
GCP_REGION=us-central1

# Session
SESSION_SECRET=your-session-secret-change-in-production
SESSION_MAX_AGE=2592000000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

ROLES & PERMISSIONS:

```javascript
const ROLES = {
  ADMIN: {
    name: 'admin',
    permissions: ['read:all', 'write:all', 'delete:all', 'manage:users']
  },
  DEVELOPER: {
    name: 'developer',
    permissions: ['read:all', 'write:code', 'test:all']
  },
  QA: {
    name: 'qa',
    permissions: ['read:all', 'test:all', 'write:bugs']
  },
  VIEWER: {
    name: 'viewer',
    permissions: ['read:dashboards', 'read:metrics']
  }
};
```

SUCCESS CRITERIA:
✅ Secure authentication with JWT + 2FA
✅ All services visible in unified dashboard
✅ Real-time data updates (<5s latency)
✅ Mobile-responsive design
✅ Production-ready security (HTTPS, rate limiting, audit logs)
✅ Role-based access control (4 roles)
✅ Testing tools integrated (API tester, health checks)
✅ Live production data (no mocks)
✅ Sub-second response times for all endpoints
✅ 99.9% uptime

DELIVERABLES:

1. Complete backend API (Node.js + Express)
2. Complete frontend dashboard (React + Vite)
3. Authentication system with 2FA
4. Database schema with migrations
5. WebSocket real-time updates
6. Deployment scripts for Cloud Run
7. Environment configuration
8. API documentation
9. User management system
10. Audit logging system

OUTPUT:

- Provide complete file structure with all code
- Include deployment instructions
- Document all API endpoints
- Create admin user script
- Test all integrations before delivery
- Ensure production-ready security
- Implement error handling throughout
- Add comprehensive logging

```

---
