/**
 * Security Headers Middleware
 * Implements production-grade security headers using helmet.js
 */

import helmet from 'helmet';
import cors from 'cors';

/**
 * Create security headers middleware with strict CSP
 */
const createSecurityHeaders = ({ logger, config = {} } = {}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  logger?.info({ environment: process.env.NODE_ENV }, 'Initializing security headers');

  return helmet({
    // Content Security Policy - prevents XSS attacks
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // TODO: Remove unsafe-eval in production
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.API_BASE_URL || "'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: isDevelopment ? null : [],
        ...(config.csp || {})
      }
    },

    // HTTP Strict Transport Security - force HTTPS
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },

    // X-Frame-Options - prevent clickjacking
    frameguard: {
      action: 'deny'
    },

    // X-Content-Type-Options - prevent MIME sniffing
    noSniff: true,

    // X-XSS-Protection - legacy XSS protection
    xssFilter: true,

    // Referrer-Policy - control referrer information
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },

    // X-DNS-Prefetch-Control - control DNS prefetching
    dnsPrefetchControl: {
      allow: false
    },

    // X-Download-Options - prevent IE from executing downloads
    ieNoOpen: true,

    // X-Permitted-Cross-Domain-Policies - restrict cross-domain requests
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none'
    },

    // Hide X-Powered-By header
    hidePoweredBy: true,

    // Expect-CT - Certificate Transparency
    expectCt: {
      maxAge: 86400,
      enforce: true
    }
  });
};

/**
 * Create CORS middleware with security options
 */
const createSecureCORS = ({ logger, allowedOrigins = [] } = {}) => {
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'https://livhana.com',
    'https://www.livhana.com',
    'https://app.livhana.com'
  ];

  const origins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

  logger?.info({ origins }, 'Initializing CORS with allowed origins');

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }

      if (origins.includes(origin)) {
        callback(null, true);
      } else {
        logger?.warn({ origin }, 'CORS request from unauthorized origin');
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Age-Verification',
      'X-Request-ID'
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After'
    ],
    maxAge: 86400 // 24 hours
  });
};

/**
 * Request sanitization middleware - prevents injection attacks
 */
const createRequestSanitizer = ({ logger } = {}) => {
  return (req, res, next) => {
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          // Remove potentially dangerous characters
          req.query[key] = req.query[key]
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, ''); // Remove event handlers
        }
      });
    }

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      const sanitizeObject = (obj) => {
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'string') {
            obj[key] = obj[key]
              .replace(/[<>]/g, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+=/gi, '');
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        });
      };
      sanitizeObject(req.body);
    }

    next();
  };
};

/**
 * Security audit logger - logs suspicious requests
 */
const createSecurityAuditor = ({ logger } = {}) => {
  return (req, res, next) => {
    const suspiciousPatterns = [
      /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i, // Path traversal
      /(union|select|insert|update|delete|drop|create|alter)\s+/i, // SQL injection
      /<script|javascript:|onerror=|onload=/i, // XSS
      /(\$\{|\{\{|<%)/i, // Template injection
      /(cmd|exec|eval|system|shell)/i // Command injection
    ];

    const checkString = (str) => {
      return suspiciousPatterns.some(pattern => pattern.test(str));
    };

    const suspicious = [];

    // Check URL
    if (checkString(req.url)) {
      suspicious.push('URL');
    }

    // Check query parameters
    if (req.query) {
      Object.entries(req.query).forEach(([key, value]) => {
        if (typeof value === 'string' && checkString(value)) {
          suspicious.push(`Query: ${key}`);
        }
      });
    }

    // Check body
    if (req.body && typeof req.body === 'object') {
      const checkObject = (obj, path = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const fullPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string' && checkString(value)) {
            suspicious.push(`Body: ${fullPath}`);
          } else if (typeof value === 'object' && value !== null) {
            checkObject(value, fullPath);
          }
        });
      };
      checkObject(req.body);
    }

    if (suspicious.length > 0) {
      logger?.warn({
        ip: req.ip,
        path: req.path,
        method: req.method,
        suspicious,
        userAgent: req.headers['user-agent']
      }, 'Suspicious request detected');

      // Log to security audit
      // TODO: Send to SIEM/security monitoring system
    }

    next();
  };
};

export { createSecurityHeaders, createSecureCORS, createRequestSanitizer, createSecurityAuditor };
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
