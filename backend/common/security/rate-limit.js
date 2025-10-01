import rateLimit from 'express-rate-limit';

/**
 * Create a rate limiter with custom options
 * @param {Object} options - Rate limit configuration
 * @returns {Function} Express middleware
 */
export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: options.message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count all requests
    skipFailedRequests: false,
    // Handler for when rate limit is exceeded
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: options.message || 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000) // seconds
      });
    },
    // Use Redis for distributed rate limiting in production
    store: options.store, // pass Redis store when available
  });
};

/**
 * Rate limiter for authentication endpoints (stricter)
 * 5 attempts per 15 minutes
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.'
});

/**
 * Rate limiter for general API endpoints
 * 100 requests per 15 minutes
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'API rate limit exceeded, please try again later.'
});

/**
 * Rate limiter for public endpoints (more lenient)
 * 1000 requests per 15 minutes
 */
export const publicRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Rate limit exceeded, please try again later.'
});

/**
 * Rate limiter for voice synthesis (resource-intensive)
 * 20 requests per minute
 */
export const voiceRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Voice synthesis rate limit exceeded, please slow down.'
});

/**
 * Rate limiter for AI reasoning (resource-intensive)
 * 10 requests per minute
 */
export const reasoningRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'AI reasoning rate limit exceeded, please wait before trying again.'
});
