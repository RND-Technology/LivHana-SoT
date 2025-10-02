// Example: How to integrate Secret Manager in your service
// This shows the recommended patterns for different use cases

import express from 'express';
import { initializeJWTConfig, getJWTConfig } from '../auth/config-secure.js';
import { getSecret, loadSecrets, startRotation, getCacheStatus } from './secret-manager.js';

const app = express();

// ========================================
// PATTERN 1: Basic Service Initialization
// ========================================
async function basicInitialization() {
  try {
    // Step 1: Initialize JWT config (required for auth)
    await initializeJWTConfig();

    // Step 2: Start automatic secret rotation (optional but recommended)
    startRotation();

    // Step 3: Load any additional secrets your service needs
    const apiKey = await getSecret('SQUARE_ACCESS_TOKEN');

    console.info('Service initialized with secure secrets');
    return { apiKey };
  } catch (error) {
    console.error('Failed to initialize secrets:', error);
    process.exit(1);
  }
}

// ========================================
// PATTERN 2: Batch Load Multiple Secrets
// ========================================
async function batchLoadSecrets() {
  try {
    // Load all required secrets at once (more efficient)
    const secrets = await loadSecrets([
      'SQUARE_ACCESS_TOKEN',
      'KAJA_API_KEY',
      'KAJA_API_SECRET',
      'ANTHROPIC_API_KEY'
    ]);

    // Use the secrets
    console.info('Loaded secrets:', Object.keys(secrets));

    return secrets;
  } catch (error) {
    console.error('Failed to load secrets:', error);
    throw error;
  }
}

// ========================================
// PATTERN 3: Lazy Load (Load When Needed)
// ========================================
class ServiceWithLazySecrets {
  constructor() {
    this.squareToken = null;
  }

  async getSquareToken() {
    // Load on first use, then cache in memory
    if (!this.squareToken) {
      this.squareToken = await getSecret('SQUARE_ACCESS_TOKEN');
    }
    return this.squareToken;
  }

  async makeSquareRequest() {
    const token = await this.getSquareToken();
    // Use token for API call
    console.info('Making Square API call with token from:', token ? 'secret manager' : 'unknown');
  }
}

// ========================================
// PATTERN 4: Express Middleware with Secrets
// ========================================
function createAuthMiddleware() {
  // JWT config must be initialized first
  const jwtConfigSecrets = getJWTConfig();

  return (req, res, next) => {
    // Use jwtConfigSecrets for token verification
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token using jwtConfigSecrets
    // (implement actual verification logic here using jwtConfigSecrets.secret)
    if (jwtConfigSecrets && jwtConfigSecrets.secret) {
      next();
    } else {
      res.status(500).json({ error: 'JWT config not available' });
    }
  };
}

// ========================================
// PATTERN 5: Health Check with Secret Status
// ========================================
function setupHealthChecks(app) {
  app.get('/health/secrets', (req, res) => {
    const status = getCacheStatus();

    res.json({
      status: 'ok',
      secretsLoaded: Object.keys(status).length,
      secrets: Object.entries(status).map(([name, data]) => ({
        name,
        source: data.source,
        ttl: Math.floor(data.ttl / 60), // minutes
        expiresAt: data.expiresAt
      })),
      timestamp: new Date().toISOString()
    });
  });
}

// ========================================
// PATTERN 6: Complete Service Setup
// ========================================
async function startService() {
  console.info('Starting service with Secret Manager...');

  try {
    // Initialize JWT config
    await initializeJWTConfig();
    console.info('✅ JWT config initialized');

    // Load service-specific secrets
    const secrets = await loadSecrets([
      'SQUARE_ACCESS_TOKEN',
      'KAJA_API_KEY'
    ]);
    console.info('✅ Loaded', Object.keys(secrets).length, 'secrets');

    // Start automatic rotation
    startRotation();
    console.info('✅ Auto-rotation enabled (24h interval)');

    // Setup health checks
    setupHealthChecks(app);

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.info(`✅ Service running on port ${PORT}`);
      console.info('Secret sources:', Object.values(getCacheStatus()).map(s => s.source));
    });

  } catch (error) {
    console.error('❌ Failed to start service:', error);
    process.exit(1);
  }
}

// ========================================
// USAGE EXAMPLES
// ========================================

// Example 1: Basic usage
// await basicInitialization();

// Example 2: Batch load
// const secrets = await batchLoadSecrets();

// Example 3: Lazy loading
// const service = new ServiceWithLazySecrets();
// await service.makeSquareRequest();

// Example 4: Complete service startup
// await startService();

export {
  basicInitialization,
  batchLoadSecrets,
  ServiceWithLazySecrets,
  createAuthMiddleware,
  setupHealthChecks,
  startService
};
// Last optimized: 2025-10-02
