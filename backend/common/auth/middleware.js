import jwt from 'jsonwebtoken';

const defaultConfig = {
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER,
  algorithms: (process.env.JWT_ALGORITHMS || 'HS256').split(',').map(a => a.trim()),
};

export const authMiddleware = ({ logger, config = {} } = {}) => {
  const mergedConfig = { ...defaultConfig, ...config };

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
