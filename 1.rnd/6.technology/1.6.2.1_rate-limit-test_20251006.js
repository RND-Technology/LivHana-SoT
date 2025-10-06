/**
 * Rate Limiting Tests
 * Validates DDoS protection and tiered rate limiting
 */

const request = require('supertest');
const express = require('express');
const { createRedisClient, createTieredRateLimiter, RATE_LIMITS } = require('../../../common/rate-limit');

describe('Rate Limiting - Integration Service', () => {
  let app;
  let redisClient;

  beforeAll(async () => {
    // Create test app with rate limiting
    app = express();
    app.use(express.json());

    // Initialize Redis client for testing
    redisClient = await createRedisClient({
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
      }
    });

    // Create rate limiter
    const rateLimiter = createTieredRateLimiter({
      redisClient,
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
      },
      serviceName: 'test'
    });

    // Apply rate limiting to test routes
    app.use('/api', rateLimiter);

    // Test endpoints
    app.get('/api/public', (req, res) => {
      res.json({ message: 'public endpoint', tier: 'public' });
    });

    app.get('/api/authenticated', (req, res) => {
      res.json({ message: 'authenticated endpoint', tier: 'authenticated' });
    });

    app.get('/api/admin', (req, res) => {
      res.json({ message: 'admin endpoint', tier: 'admin' });
    });
  });

  afterAll(async () => {
    if (redisClient) {
      await redisClient.quit();
    }
  });

  beforeEach(async () => {
    // Clear rate limit data before each test
    const keys = await redisClient.keys('rate-limit:test:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  });

  describe('Public Endpoint Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const response = await request(app)
        .get('/api/public')
        .expect(200);

      expect(response.body.message).toBe('public endpoint');
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
    });

    it('should return 429 when exceeding public rate limit', async () => {
      const publicLimit = RATE_LIMITS.PUBLIC.max;

      // Make requests up to the limit
      for (let i = 0; i < publicLimit; i++) {
        const response = await request(app)
          .get('/api/public')
          .set('X-Forwarded-For', '1.2.3.4');

        if (i < publicLimit - 1) {
          expect(response.status).toBe(200);
        }
      }

      // Next request should be rate limited
      const blockedResponse = await request(app)
        .get('/api/public')
        .set('X-Forwarded-For', '1.2.3.4')
        .expect(429);

      expect(blockedResponse.body.error).toBe('Too many requests');
      expect(blockedResponse.body.tier).toBe('public');
      expect(blockedResponse.body.retryAfter).toBeDefined();
    }, 30000); // Increase timeout for this test
  });

  describe('Authenticated User Rate Limiting', () => {
    it('should apply higher limits for authenticated users', async () => {
      const authenticatedLimit = RATE_LIMITS.AUTHENTICATED.max;
      const publicLimit = RATE_LIMITS.PUBLIC.max;

      expect(authenticatedLimit).toBeGreaterThan(publicLimit);

      // Simulate authenticated user
      const response = await request(app)
        .get('/api/authenticated')
        .set('X-User-Id', 'user123')
        .expect(200);

      expect(response.body.tier).toBe('authenticated');
    });
  });

  describe('Admin Rate Limiting', () => {
    it('should apply highest limits for admin users', async () => {
      const adminLimit = RATE_LIMITS.ADMIN.max;
      const authenticatedLimit = RATE_LIMITS.AUTHENTICATED.max;

      expect(adminLimit).toBeGreaterThan(authenticatedLimit);

      const response = await request(app)
        .get('/api/admin')
        .set('X-User-Role', 'admin')
        .expect(200);

      expect(response.body.tier).toBe('admin');
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include rate limit information in headers', async () => {
      const response = await request(app)
        .get('/api/public')
        .expect(200);

      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });

    it('should update remaining count correctly', async () => {
      const firstResponse = await request(app)
        .get('/api/public')
        .set('X-Forwarded-For', '5.6.7.8')
        .expect(200);

      const firstRemaining = parseInt(firstResponse.headers['ratelimit-remaining']);

      const secondResponse = await request(app)
        .get('/api/public')
        .set('X-Forwarded-For', '5.6.7.8')
        .expect(200);

      const secondRemaining = parseInt(secondResponse.headers['ratelimit-remaining']);

      expect(secondRemaining).toBe(firstRemaining - 1);
    });
  });

  describe('IP-based Rate Limiting', () => {
    it('should rate limit by IP address for unauthenticated requests', async () => {
      // First IP should have its own limit
      const ip1Response = await request(app)
        .get('/api/public')
        .set('X-Forwarded-For', '10.0.0.1')
        .expect(200);

      expect(ip1Response.headers['ratelimit-remaining']).toBeDefined();

      // Second IP should have independent limit
      const ip2Response = await request(app)
        .get('/api/public')
        .set('X-Forwarded-For', '10.0.0.2')
        .expect(200);

      expect(ip2Response.headers['ratelimit-remaining']).toBe(ip1Response.headers['ratelimit-remaining']);
    });
  });

  describe('Rate Limit Window', () => {
    it('should reset after time window expires', async () => {
      const windowMs = RATE_LIMITS.PUBLIC.windowMs;

      const firstResponse = await request(app)
        .get('/api/public')
        .set('X-Forwarded-For', '11.22.33.44')
        .expect(200);

      const resetTimestamp = parseInt(firstResponse.headers['ratelimit-reset']);
      const now = Math.floor(Date.now() / 1000);

      // Reset time should be in the future
      expect(resetTimestamp).toBeGreaterThan(now);

      // Reset should be approximately windowMs away
      const timeDiff = (resetTimestamp - now) * 1000;
      expect(timeDiff).toBeLessThanOrEqual(windowMs);
    });
  });
});

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
