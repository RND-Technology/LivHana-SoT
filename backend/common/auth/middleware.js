import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from './config.js';

export const authMiddleware = ({ logger, config = {} } = {}) => {
  const mergedConfig = { ...JWT_CONFIG, ...config };

  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      logger?.warn({ path: req.path }, 'Missing authorization header');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        audience: mergedConfig.audience,
        issuer: mergedConfig.issuer,
        algorithms: mergedConfig.algorithms,
      });

      req.user = decoded;
      next();
    } catch (error) {
      logger?.error({ error: error.message }, 'JWT validation failed');
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
