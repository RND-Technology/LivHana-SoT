// Shared JWT configuration with GCP Secret Manager support
// This ensures consistent auth across the entire backend with secure secret management

import { getSecret } from '../secrets/secret-manager.js';

let jwtConfig = null;
let configInitialized = false;

/**
 * Initialize JWT config with secrets from Secret Manager
 * Call this during service startup, before any auth operations
 */
async function initializeJWTConfig() {
  if (configInitialized) {
    return jwtConfig;
  }

  try {
    // Load JWT secrets from Secret Manager (with fallback)
    const [secret, audience, issuer] = await Promise.all([
      getSecret('JWT_SECRET'),
      getSecret('JWT_AUDIENCE'),
      getSecret('JWT_ISSUER')
    ]);

    jwtConfig = {
      secret,
      audience,
      issuer,
      algorithms: ['HS256'],
      expiresIn: '24h'
    };

    configInitialized = true;
    console.info('[JWT Config] Initialized with secure secrets');
    return jwtConfig;
  } catch (error) {
    console.error('[JWT Config] Failed to initialize:', error.message);
    throw new Error('JWT configuration initialization failed');
  }
}

/**
 * Get JWT config (throws if not initialized)
 */
function getJWTConfig() {
  if (!configInitialized || !jwtConfig) {
    throw new Error('JWT config not initialized. Call initializeJWTConfig() first.');
  }
  return jwtConfig;
}

/**
 * Validate that JWT config is properly initialized
 */
function validateJWTConfig() {
  const config = getJWTConfig();

  const required = ['secret', 'audience', 'issuer'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required JWT configuration: ${missing.join(', ')}`);
  }

  return true;
}

/**
 * Refresh JWT secrets (for rotation)
 */
async function refreshJWTConfig() {
  console.info('[JWT Config] Refreshing secrets...');
  configInitialized = false;
  return initializeJWTConfig();
}

export {
  initializeJWTConfig,
  getJWTConfig,
  validateJWTConfig,
  refreshJWTConfig
};

// Legacy export for compatibility (sync version - use with caution)
export const JWT_CONFIG = new Proxy({}, {
  get(target, prop) {
    if (!configInitialized) {
      throw new Error('JWT config not initialized. Call initializeJWTConfig() first.');
    }
    return jwtConfig[prop];
  }
});
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
