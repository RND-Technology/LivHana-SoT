/**
 * Token Management System
 * Handles JWT creation, validation, refresh, and revocation
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createClient } from 'redis';
import { logAuditEvent, AUDIT_EVENTS, SEVERITY } from '../logging/audit-logger.js';

class TokenManager {
  constructor({ jwtSecret, redisClient, logger }) {
    this.jwtSecret = jwtSecret;
    this.redisClient = redisClient;
    this.logger = logger;

    // Token configuration
    this.ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
    this.REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
    this.REFRESH_TOKEN_REDIS_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

    // Token prefixes in Redis
    this.REFRESH_TOKEN_PREFIX = 'refresh_token:';
    this.BLACKLIST_PREFIX = 'blacklist:';
    this.BLACKLIST_TTL = 15 * 60; // 15 minutes (access token expiry)
  }

  /**
   * Generate access token (short-lived)
   */
  generateAccessToken({ userId, email, role, permissions = [] }) {
    const payload = {
      id: userId,
      email,
      role,
      permissions,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'livhana-sot',
      audience: 'livhana-api'
    });
  }

  /**
   * Generate refresh token (long-lived)
   */
  async generateRefreshToken({ userId, email, role, sessionId = null }) {
    const tokenId = crypto.randomBytes(32).toString('hex');

    const payload = {
      id: userId,
      email,
      role,
      tokenId,
      sessionId: sessionId || crypto.randomBytes(16).toString('hex'),
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      issuer: 'livhana-sot',
      audience: 'livhana-api'
    });

    // Store refresh token in Redis
    const key = `${this.REFRESH_TOKEN_PREFIX}${tokenId}`;
    await this.redisClient.setEx(key, this.REFRESH_TOKEN_REDIS_TTL, JSON.stringify({
      userId,
      email,
      role,
      sessionId: payload.sessionId,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    }));

    return { token, tokenId, sessionId: payload.sessionId };
  }

  /**
   * Generate token pair (access + refresh)
   */
  async generateTokenPair({ userId, email, role, permissions = [], sessionId = null }) {
    const accessToken = this.generateAccessToken({ userId, email, role, permissions });
    const refreshData = await this.generateRefreshToken({ userId, email, role, sessionId });

    return {
      accessToken,
      refreshToken: refreshData.token,
      tokenId: refreshData.tokenId,
      sessionId: refreshData.sessionId,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer'
    };
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token, { checkBlacklist = true } = {}) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'livhana-sot',
        audience: 'livhana-api'
      });

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      // Check if token is blacklisted
      if (checkBlacklist) {
        const isBlacklisted = await this.isTokenBlacklisted(token);
        if (isBlacklisted) {
          throw new Error('Token has been revoked');
        }
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'livhana-sot',
        audience: 'livhana-api'
      });

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token exists in Redis
      const key = `${this.REFRESH_TOKEN_PREFIX}${decoded.tokenId}`;
      const storedData = await this.redisClient.get(key);

      if (!storedData) {
        throw new Error('Refresh token not found or expired');
      }

      // Update last used timestamp
      const data = JSON.parse(storedData);
      data.lastUsed = new Date().toISOString();
      await this.redisClient.setEx(key, this.REFRESH_TOKEN_REDIS_TTL, JSON.stringify(data));

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      }
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken, { ip = null, userAgent = null } = {}) {
    try {
      const decoded = await this.verifyRefreshToken(refreshToken);

      // Generate new access token
      const accessToken = this.generateAccessToken({
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || []
      });

      // Log token refresh
      await logAuditEvent({
        eventType: AUDIT_EVENTS.AUTH_TOKEN_REFRESH,
        severity: SEVERITY.INFO,
        userId: decoded.id,
        userRole: decoded.role,
        ip,
        userAgent,
        details: {
          sessionId: decoded.sessionId
        }
      });

      return {
        accessToken,
        expiresIn: 900,
        tokenType: 'Bearer'
      };
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Token refresh failed');
      throw error;
    }
  }

  /**
   * Revoke access token (add to blacklist)
   */
  async revokeAccessToken(token, { reason = 'logout' } = {}) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      const key = `${this.BLACKLIST_PREFIX}${token}`;
      await this.redisClient.setEx(key, this.BLACKLIST_TTL, JSON.stringify({
        userId: decoded.id,
        reason,
        revokedAt: new Date().toISOString()
      }));

      this.logger?.info({ userId: decoded.id, reason }, 'Access token revoked');
      return true;
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Failed to revoke access token');
      throw error;
    }
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(tokenId, { reason = 'logout' } = {}) {
    try {
      const key = `${this.REFRESH_TOKEN_PREFIX}${tokenId}`;
      const data = await this.redisClient.get(key);

      if (data) {
        const tokenData = JSON.parse(data);
        await this.redisClient.del(key);

        this.logger?.info({ userId: tokenData.userId, reason }, 'Refresh token revoked');
        return true;
      }

      return false;
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Failed to revoke refresh token');
      throw error;
    }
  }

  /**
   * Revoke all tokens for a user (logout from all devices)
   */
  async revokeAllUserTokens(userId, { reason = 'security' } = {}) {
    try {
      // Find all refresh tokens for user
      const pattern = `${this.REFRESH_TOKEN_PREFIX}*`;
      const keys = [];

      // Scan for all refresh tokens
      for await (const key of this.redisClient.scanIterator({
        MATCH: pattern,
        COUNT: 100
      })) {
        const data = await this.redisClient.get(key);
        if (data) {
          const tokenData = JSON.parse(data);
          if (tokenData.userId === userId) {
            keys.push(key);
          }
        }
      }

      // Delete all found tokens
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }

      this.logger?.info({ userId, tokensRevoked: keys.length, reason }, 'All user tokens revoked');
      return keys.length;
    } catch (error) {
      this.logger?.error({ error: error.message, userId }, 'Failed to revoke all user tokens');
      throw error;
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token) {
    try {
      const key = `${this.BLACKLIST_PREFIX}${token}`;
      const data = await this.redisClient.get(key);
      return !!data;
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Failed to check token blacklist');
      return false; // Fail open in case of Redis error
    }
  }

  /**
   * Get user's active sessions
   */
  async getUserSessions(userId) {
    try {
      const pattern = `${this.REFRESH_TOKEN_PREFIX}*`;
      const sessions = [];

      for await (const key of this.redisClient.scanIterator({
        MATCH: pattern,
        COUNT: 100
      })) {
        const data = await this.redisClient.get(key);
        if (data) {
          const tokenData = JSON.parse(data);
          if (tokenData.userId === userId) {
            sessions.push({
              sessionId: tokenData.sessionId,
              createdAt: tokenData.createdAt,
              lastUsed: tokenData.lastUsed
            });
          }
        }
      }

      return sessions;
    } catch (error) {
      this.logger?.error({ error: error.message, userId }, 'Failed to get user sessions');
      return [];
    }
  }
}

/**
 * Create token manager instance
 */
const createTokenManager = async ({ jwtSecret, logger }) => {
  const redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379')
    },
    password: process.env.REDIS_PASSWORD,
    database: parseInt(process.env.REDIS_TOKEN_DB || '2')
  });

  await redisClient.connect();

  redisClient.on('error', (err) => {
    logger?.error({ error: err.message }, 'Redis token manager error');
  });

  return new TokenManager({ jwtSecret, redisClient, logger });
};

export { TokenManager, createTokenManager };
