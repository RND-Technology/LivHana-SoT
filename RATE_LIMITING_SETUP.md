# Rate Limiting & DDoS Protection

Production-grade rate limiting has been implemented across all backend services to prevent DDoS attacks and abuse.

## Overview

- **Redis-backed**: Rate limits shared across all service instances
- **Tiered limits**: Different limits based on authentication level
- **Real-time monitoring**: Live statistics and configuration endpoints
- **Graceful degradation**: Services continue if Redis is unavailable

## Rate Limit Tiers

| Tier | Requests/Minute | Use Case |
|------|----------------|----------|
| **Public** | 100 | Unauthenticated users (by IP) |
| **Authenticated** | 300 | Logged-in users |
| **Admin** | 1000 | Admin users |
| **Health** | 300 | Health check endpoints |

## Implementation Details

### Services Protected

1. **Integration Service** (Port 3005)
   - All `/api/*` routes
   - Health check endpoint `/health`
   - BigQuery, Square, Membership, Raffle APIs

2. **Reasoning Gateway** (Port 4002)
   - All `/api/*` routes
   - Health check endpoints `/health` and `/healthz`
   - Reasoning, Memory, Autonomous APIs

### Key Features

#### 1. Redis Store
```javascript
// Shared rate limit state across all instances
const redisClient = await createRedisClient({ logger });
const rateLimiter = createTieredRateLimiter({
  redisClient,
  logger,
  serviceName: 'integration-service'
});
```

#### 2. Tiered Rate Limiting
Rate limits automatically adjust based on user authentication:
- Extracts user info from `req.user` (set by auth middleware)
- Admin users get 1000 req/min
- Authenticated users get 300 req/min
- Public/unauthenticated get 100 req/min

#### 3. IP-based Tracking
```javascript
// Uses IP for unauthenticated, user ID for authenticated
keyGenerator: (req) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  return req.ip || req.connection.remoteAddress;
}
```

#### 4. Standard Headers
All responses include rate limit information:
```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1696281600
```

#### 5. 429 Response Format
```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "tier": "public",
  "retryAfter": "60s"
}
```

## Configuration

### Environment Variables

```bash
# Required - Redis connection
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional - Redis authentication
REDIS_PASSWORD=your-password

# Optional - Rate limit specific database (default: 1)
REDIS_RATE_LIMIT_DB=1

# Optional - Disable rate limiting (default: enabled)
RATE_LIMIT_ENABLED=true
```

### Integration Service (.env)
```bash
# Add to backend/integration-service/.env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_RATE_LIMIT_DB=1
RATE_LIMIT_ENABLED=true
```

### Reasoning Gateway (.env)
```bash
# Add to backend/reasoning-gateway/.env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_RATE_LIMIT_DB=1
RATE_LIMIT_ENABLED=true
```

## Monitoring Endpoints

### Get Rate Limit Statistics
```bash
# Integration Service
curl http://localhost:3005/api/monitoring/rate-limit/stats

# Reasoning Gateway
curl http://localhost:4002/api/monitoring/rate-limit/stats

# Response
{
  "success": true,
  "stats": {
    "totalHits": 1547,
    "totalBlocks": 23,
    "blockRate": "1.49%",
    "since": "2025-10-01T10:00:00.000Z",
    "uptime": "3600s"
  },
  "tiers": {
    "PUBLIC": { "windowMs": 60000, "max": 100, "tier": "public" },
    "AUTHENTICATED": { "windowMs": 60000, "max": 300, "tier": "authenticated" },
    "ADMIN": { "windowMs": 60000, "max": 1000, "tier": "admin" }
  },
  "timestamp": "2025-10-01T11:00:00.000Z"
}
```

### Get Rate Limit Configuration
```bash
# Integration Service
curl http://localhost:3005/api/monitoring/rate-limit/config

# Reasoning Gateway
curl http://localhost:4002/api/monitoring/rate-limit/config

# Response
{
  "success": true,
  "enabled": true,
  "tiers": {
    "PUBLIC": { "windowMs": 60000, "max": 100, "tier": "public" },
    "AUTHENTICATED": { "windowMs": 60000, "max": 300, "tier": "authenticated" },
    "ADMIN": { "windowMs": 60000, "max": 1000, "tier": "admin" },
    "HEALTH": { "windowMs": 60000, "max": 300, "tier": "health" }
  },
  "redisConfig": {
    "host": "localhost",
    "port": "6379",
    "database": "1"
  }
}
```

### Reset Statistics (Admin Only)
```bash
curl -X POST http://localhost:3005/api/monitoring/rate-limit/stats/reset \
  -H "Authorization: Bearer <admin-token>"
```

## Testing

### Run Automated Tests
```bash
# Unit tests
cd backend/integration-service
npm test -- rate-limit.test.js

# Live integration test
cd backend/integration-service
./scripts/test-rate-limiting.sh
```

### Manual Testing

#### Test Public Rate Limit (100 req/min)
```bash
# Make 110 requests quickly
for i in {1..110}; do
  curl -s http://localhost:3005/health | grep -q healthy && echo "✓" || echo "✗ Rate limited"
done
```

#### Test with Authentication
```bash
# With JWT token (300 req/min)
TOKEN="your-jwt-token"
for i in {1..110}; do
  curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3005/api/bigquery/sales | grep -q success && echo "✓" || echo "✗"
done
```

#### Test Admin Limits
```bash
# Admin user (1000 req/min)
ADMIN_TOKEN="admin-jwt-token"
for i in {1..200}; do
  curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3005/api/bigquery/sales | grep -q success && echo "✓" || echo "✗"
done
```

## Architecture

### Files Modified

1. **Backend Services**
   - `/backend/integration-service/src/index.js` - Rate limiting integration
   - `/backend/reasoning-gateway/src/index.js` - Rate limiting integration

2. **Common Library**
   - `/backend/common/rate-limit/index.js` - CommonJS version
   - `/backend/common/rate-limit/index.mjs` - ES Module version

3. **Dependencies**
   - `express-rate-limit` - Rate limiting middleware
   - `rate-limit-redis` - Redis store adapter

### Redis Key Structure

```
rate-limit:<service>:<tier>:<identifier>
```

Examples:
```
rate-limit:integration-service:public:192.168.1.100
rate-limit:integration-service:authenticated:user:user123
rate-limit:reasoning-gateway:admin:user:admin456
```

## Production Deployment

### 1. Ensure Redis is Running
```bash
# Check Redis connectivity
redis-cli ping
# Should return: PONG
```

### 2. Configure Environment
```bash
# Set production Redis host
export REDIS_HOST=your-redis-host.com
export REDIS_PORT=6379
export REDIS_PASSWORD=your-secure-password
export REDIS_RATE_LIMIT_DB=1
```

### 3. Start Services
```bash
# Integration Service
cd backend/integration-service
npm start

# Reasoning Gateway
cd backend/reasoning-gateway
npm start
```

### 4. Verify Rate Limiting
```bash
# Check configuration
curl http://localhost:3005/api/monitoring/rate-limit/config

# Monitor statistics
watch -n 5 'curl -s http://localhost:3005/api/monitoring/rate-limit/stats | jq .stats'
```

## Troubleshooting

### Rate Limiting Not Working

1. **Check Redis Connection**
   ```bash
   redis-cli -h localhost -p 6379 ping
   ```

2. **Check Environment Variables**
   ```bash
   echo $REDIS_HOST
   echo $RATE_LIMIT_ENABLED
   ```

3. **Check Logs**
   ```bash
   # Should see: "Rate limiting initialized successfully"
   tail -f backend/integration-service/logs/app.log | grep "rate"
   ```

### Too Many 429 Errors

1. **Increase Rate Limits** (if legitimate traffic)
   ```javascript
   // Edit backend/common/rate-limit/index.js
   const RATE_LIMITS = {
     PUBLIC: {
       max: 200, // Increase from 100
       ...
     }
   }
   ```

2. **Check Authentication**
   - Ensure users are properly authenticated
   - Authenticated users get 3x higher limits

3. **Use Admin Accounts**
   - Admin users get 10x higher limits

### Redis Memory Issues

Rate limit data is automatically expired after the window period. To manually clear:

```bash
# Clear all rate limit keys
redis-cli --scan --pattern 'rate-limit:*' | xargs redis-cli del
```

## Monitoring & Alerts

### CloudWatch Metrics (AWS)

If using AWS, monitor these metrics:

1. **Rate Limit Blocks**
   - Metric: `RateLimitBlocks`
   - Alert if > 100/min

2. **Block Rate**
   - Metric: `RateLimitBlockRate`
   - Alert if > 5%

3. **Redis Connection Errors**
   - Metric: `RedisConnectionErrors`
   - Alert immediately

### Grafana Dashboard

Create dashboard with:
- Rate limit hits over time
- Blocks by tier (public/authenticated/admin)
- Block rate percentage
- Top rate-limited IPs/users

## Security Considerations

1. **IP Spoofing Prevention**
   - Use `trust proxy` in Express for accurate IP detection
   - Validate X-Forwarded-For headers

2. **Distributed Rate Limiting**
   - Redis ensures limits work across multiple instances
   - Use Redis Cluster for high availability

3. **Rate Limit Bypass**
   - Monitor admin accounts carefully
   - Log all rate limit resets
   - Alert on suspicious patterns

4. **DDoS Mitigation**
   - Rate limiting is first line of defense
   - Use WAF (Cloudflare, AWS WAF) for L7 attacks
   - Implement connection limits at load balancer

## Performance Impact

- **Latency**: < 5ms per request (Redis lookup)
- **Memory**: ~1KB per unique IP/user in window
- **CPU**: Negligible overhead
- **Redis**: ~10 ops/sec per 100 req/sec

## Future Enhancements

1. **Dynamic Rate Limits**
   - Adjust based on server load
   - Increase during low traffic periods

2. **Reputation Scoring**
   - Lower limits for suspicious IPs
   - Higher limits for trusted users

3. **Geographic Rate Limits**
   - Different limits by region
   - Block high-risk countries

4. **Advanced Analytics**
   - ML-based anomaly detection
   - Predictive rate limiting

## Support

For issues or questions:
1. Check logs for rate limiting errors
2. Verify Redis connectivity
3. Test monitoring endpoints
4. Run test script: `./scripts/test-rate-limiting.sh`

---

**Status**: ✅ ACTIVE - DDoS Protection Enabled

**Last Updated**: 2025-10-01

**Deployed To**: Integration Service, Reasoning Gateway
