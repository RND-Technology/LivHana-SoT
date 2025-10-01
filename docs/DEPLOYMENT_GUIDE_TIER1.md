# 🚀 LivHana Tier-1 Deployment Guide

**Version:** 1.0 (Post Security Hardening)
**Date:** September 30, 2025
**Status:** PRODUCTION READY ✅

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Environment Setup

- [ ] 1Password CLI installed and configured
- [ ] Docker & Docker Compose installed
- [ ] Node.js v20+ installed
- [ ] Redis 7+ running (or use Docker)
- [ ] All secrets stored in 1Password vault `LivHana-Ops-Keys`

### Security Verification

- [ ] Authentication enabled on all services
- [ ] `.env.runtime` files use 1Password references (not plaintext)
- [ ] JWT secrets unified across all services
- [ ] CORS whitelist configured for production domains
- [ ] All tests passing (`npm test` in backend/common)
- [ ] No high/critical npm audit vulnerabilities

---

## 🔧 INITIAL SETUP

### 1. Clone Repository

```bash
git clone git@github.com:RND-Technology/LivHana-SoT.git
cd LivHana-SoT
```

### 2. Install 1Password CLI

```bash
# macOS
brew install --cask 1password-cli

# Verify installation
op --version

# Sign in
op account add
```

### 3. Configure Environment Files

```bash
# Copy example files
cp backend/voice-service/.env.example backend/voice-service/.env.runtime
cp backend/reasoning-gateway/.env.example backend/reasoning-gateway/.env.runtime

# Edit with 1Password references (or leave as-is if using .env.docker)
```

### 4. Install Dependencies

```bash
# Backend common
cd backend/common
npm install

# Voice service
cd ../voice-service
npm install

# Reasoning gateway
cd ../reasoning-gateway
npm install

# Integration service
cd ../integration-service
npm install

# Frontend
cd ../../frontend/vibe-cockpit
npm install
```

---

## 🐳 DOCKER DEPLOYMENT (RECOMMENDED)

### Using Docker Compose with Voice Mode Stack

```bash
# Start the full stack
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
docker compose -f infra/docker/docker-compose.voice-mode.yml up -d

# View logs
docker compose -f infra/docker/docker-compose.voice-mode.yml logs -f

# Check status
docker compose -f infra/docker/docker-compose.voice-mode.yml ps
```

**Services Started:**
- Redis (port 6379)
- voice-service (port 4001)
- reasoning-gateway (port 4002)
- deepseek-stub (port 8080)

### With 1Password Secret Injection

```bash
# Use op run to inject secrets from 1Password
op run --env-file=backend/voice-service/.env.docker -- \
  docker compose -f infra/docker/docker-compose.voice-mode.yml up -d
```

---

## 🖥️ LOCAL DEVELOPMENT

### Start Services Individually

#### 1. Start Redis

```bash
# Option A: Docker
docker run -d -p 6379:6379 redis:7-alpine

# Option B: Homebrew
brew services start redis
```

#### 2. Start DeepSeek Stub (Development Only)

```bash
cd infra/docker/deepseek-stub
docker build -t deepseek-stub .
docker run -d -p 8080:8080 deepseek-stub
```

#### 3. Start Voice Service

```bash
cd backend/voice-service

# With 1Password
op run --env-file=.env.docker -- npm start

# Or with .env.runtime (development)
npm start
```

#### 4. Start Reasoning Gateway

```bash
cd backend/reasoning-gateway

# With 1Password
op run --env-file=.env.docker -- npm start

# Or with .env.runtime (development)
npm start
```

#### 5. Start Frontend

```bash
cd frontend/vibe-cockpit
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Voice API: http://localhost:4001
- Reasoning API: http://localhost:4002

---

## 🔐 AUTHENTICATION SETUP

### Generate JWT Tokens for Testing

```javascript
// test-token-generator.js
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    sub: 'test-user-123',
    email: 'test@livhana.com'
  },
  process.env.JWT_SECRET,
  {
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    expiresIn: '24h'
  }
);

console.log('Bearer ' + token);
```

### Test Authenticated Endpoint

```bash
# Generate token (replace with your actual values)
export JWT_SECRET="your-secret-here"
export JWT_AUDIENCE="livhana-api"
export JWT_ISSUER="livhana-auth"

# Get token
TOKEN=$(node test-token-generator.js)

# Test voice service
curl -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","userId":"test-123"}' \
  http://localhost:4001/api/voice/synthesize
```

---

## 🧪 TESTING

### Run Unit Tests

```bash
cd backend/common
npm test
```

**Expected Output:**
```
✓ memory/store.test.js (2 tests)
✓ queue/stream.test.js (3 tests)
✓ guardrails/index.test.js (2 tests)

Test Files  3 passed (3)
     Tests  7 passed (7)
```

### Integration Tests

```bash
# Start all services first, then:
cd tests/integration
npm test
```

### Health Check Tests

```bash
# Voice service (no auth required)
curl http://localhost:4001/health

# Reasoning gateway (no auth required)
curl http://localhost:4002/health

# Expected response:
{
  "status": "healthy",
  "service": "voice-service",
  "queue": "voice-mode-reasoning-jobs",
  "redis": "connected"
}
```

---

## 📊 MONITORING

### Service Health Endpoints

| Service | Endpoint | Auth Required |
|---------|----------|---------------|
| voice-service | http://localhost:4001/health | ❌ No |
| reasoning-gateway | http://localhost:4002/health | ❌ No |
| integration-service | http://localhost:3005/health | ❌ No |

### Queue Monitoring

```bash
# Connect to Redis
redis-cli

# Check queue length
LLEN bull:voice-mode-reasoning-jobs:wait

# View recent jobs
LRANGE bull:voice-mode-reasoning-jobs:completed 0 10
```

### Logs

```bash
# Docker Compose logs
docker compose logs -f voice-service
docker compose logs -f reasoning-gateway

# Local development (uses Pino structured logging)
npm start | pino-pretty
```

---

## 🚨 TROUBLESHOOTING

### Issue: "Unauthorized" Error

**Cause:** Missing or invalid JWT token

**Solution:**
```bash
# Verify JWT_SECRET matches across services
grep JWT_SECRET backend/*/. env.runtime

# Generate new test token
node test-token-generator.js

# Test with new token
curl -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/voice/synthesize
```

### Issue: "Redis connection failed"

**Cause:** Redis not running or wrong host

**Solution:**
```bash
# Check Redis status
redis-cli ping
# Should return: PONG

# Check REDIS_HOST in .env
grep REDIS_HOST backend/*/.env.runtime

# Start Redis if needed
docker run -d -p 6379:6379 redis:7-alpine
```

### Issue: "Module not found" errors

**Cause:** Dependencies not installed

**Solution:**
```bash
# Reinstall all dependencies
cd backend/common && npm install
cd ../voice-service && npm install
cd ../reasoning-gateway && npm install
```

### Issue: "Port already in use"

**Cause:** Service already running

**Solution:**
```bash
# Find process using port
lsof -i :4001

# Kill process
kill -9 <PID>

# Or use different port
PORT=4003 npm start
```

---

## 🔄 DEPLOYMENT TO PRODUCTION

### Pre-Flight Checklist

- [ ] All secrets in 1Password (no plaintext in .env files)
- [ ] ALLOWED_ORIGINS set to production domains only
- [ ] JWT_SECRET is strong (64+ characters, random)
- [ ] All tests passing
- [ ] npm audit shows 0 high/critical vulnerabilities
- [ ] Health endpoints responding
- [ ] Logs configured for production (LOG_LEVEL=warn)
- [ ] Error tracking configured (Sentry/etc)
- [ ] Backup/recovery procedures documented

### Deployment Steps

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install --production

# 3. Run tests
npm test

# 4. Build frontend
cd frontend/vibe-cockpit
npm run build

# 5. Start services with 1Password
op run --env-file=backend/voice-service/.env.docker -- \
  docker compose up -d

# 6. Verify health
curl https://api.livhana.com/health

# 7. Monitor logs
docker compose logs -f
```

### Rollback Procedure

```bash
# 1. Revert to previous commit
git revert HEAD

# 2. Redeploy
docker compose up -d --force-recreate

# 3. Verify
curl https://api.livhana.com/health
```

---

## 📈 PERFORMANCE TUNING

### Redis Optimization

```bash
# Increase max memory
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Node.js Optimization

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Enable clustering
PM2_HOME=./.pm2 pm2 start src/index.js -i max
```

---

## 📞 SUPPORT

**Technical Issues:** Jesse Niesen
**Security Issues:** security@livhana.com
**Documentation:** docs/README.md

---

## 📚 ADDITIONAL RESOURCES

- [Security Hardening Guide](./SECURITY_HARDENING_GUIDE.md)
- [Tier-1 Assessment](./TIER1_COMPLETE_ASSESSMENT_20250930.md)
- [Architecture Decision Records](./architecture/)
- [API Documentation](./api/)

---

**Deployment Guide Version:** 1.0
**Last Updated:** September 30, 2025
**Maintained By:** LivHana DevOps Team
