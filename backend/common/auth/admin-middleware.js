/**
 * Admin-only middleware
 * Extends the base auth middleware to require admin role
 */

export const adminMiddleware = ({ logger } = {}) => {
  return (req, res, next) => {
    // At this point, req.user should already be set by authMiddleware
    if (!req.user) {
      logger?.warn({ path: req.path }, 'Admin middleware called without user context');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check for admin role
    const isAdmin = req.user.role === 'admin' || req.user.roles?.includes('admin');

    if (!isAdmin) {
      logger?.warn({
        userId: req.user.sub || req.user.id,
        role: req.user.role,
        path: req.path
      }, 'Non-admin user attempted admin action');

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    // User is admin, proceed
    next();
  };
};

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
