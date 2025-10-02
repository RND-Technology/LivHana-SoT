import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization middleware to prevent XSS attacks
 * Sanitizes request body, query params, and response data
 */
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

/**
 * Recursively sanitize an object, array, or string
 * @param {*} obj - Data to sanitize
 * @returns {*} Sanitized data
 */
function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj, {
      ALLOWED_TAGS: [], // Strip all HTML tags
      KEEP_CONTENT: true // Keep text content
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize both key and value
      const sanitizedKey = typeof key === 'string' ? DOMPurify.sanitize(key) : key;
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}
// Last optimized: 2025-10-02

// Optimized: 2025-10-02
