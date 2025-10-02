// GCP Secret Manager with fallback to 1Password and .env
// Provides zero-downtime secret rotation and automatic refresh

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

class SecretManager {
  constructor() {
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID;
    this.cache = new Map();
    this.refreshInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.initPromise = null;

    // Initialize GCP client if project ID is available
    if (this.projectId) {
      try {
        this.client = new SecretManagerServiceClient();
        console.info('[SecretManager] GCP Secret Manager initialized');
      } catch (error) {
        console.warn('[SecretManager] Failed to initialize GCP client:', error.message);
        this.client = null;
      }
    }
  }

  /**
   * Get a secret with fallback strategy:
   * 1. Try cached value (if not expired)
   * 2. Try GCP Secret Manager (if available)
   * 3. Try 1Password op:// reference
   * 4. Fall back to process.env
   */
  async getSecret(secretName, options = {}) {
    const { refresh = false, expiresIn = this.refreshInterval } = options;

    // Check cache first (unless refresh is requested)
    if (!refresh && this.cache.has(secretName)) {
      const cached = this.cache.get(secretName);
      if (Date.now() < cached.expiresAt) {
        return cached.value;
      }
    }

    let value = null;
    let source = null;

    // Strategy 1: Try GCP Secret Manager (production)
    if (this.client && this.projectId) {
      try {
        value = await this.getFromGCP(secretName);
        source = 'GCP Secret Manager';
      } catch (error) {
        console.warn(`[SecretManager] GCP fetch failed for ${secretName}:`, error.message);
      }
    }

    // Strategy 2: Try 1Password op:// reference (local dev)
    if (!value) {
      const envValue = process.env[secretName];
      if (envValue && envValue.startsWith('op://')) {
        try {
          value = await this.getFrom1Password(envValue);
          source = '1Password';
        } catch (error) {
          console.warn(`[SecretManager] 1Password fetch failed for ${secretName}:`, error.message);
        }
      }
    }

    // Strategy 3: Fall back to direct .env value (emergency)
    if (!value) {
      value = process.env[secretName];
      source = '.env (fallback)';
      if (!value) {
        throw new Error(`Secret ${secretName} not found in any source`);
      }
    }

    // Cache the value
    this.cache.set(secretName, {
      value,
      expiresAt: Date.now() + expiresIn,
      source
    });

    console.info(`[SecretManager] Loaded ${secretName} from ${source}`);
    return value;
  }

  /**
   * Fetch secret from GCP Secret Manager
   */
  async getFromGCP(secretName) {
    if (!this.client || !this.projectId) {
      throw new Error('GCP Secret Manager not initialized');
    }

    const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;

    try {
      const [version] = await this.client.accessSecretVersion({ name });
      const payload = version.payload.data.toString('utf8');
      return payload;
    } catch (error) {
      if (error.code === 5) {
        throw new Error(`Secret ${secretName} not found in GCP`);
      }
      throw error;
    }
  }

  /**
   * Fetch secret from 1Password using op CLI
   */
  async getFrom1Password(opRef) {
    try {
      const { stdout } = await execAsync(`op read "${opRef}"`);
      return stdout.trim();
    } catch (error) {
      throw new Error(`1Password CLI failed: ${error.message}`);
    }
  }

  /**
   * Load multiple secrets at once
   */
  async loadSecrets(secretNames) {
    const results = {};
    const errors = [];

    await Promise.all(
      secretNames.map(async (name) => {
        try {
          results[name] = await this.getSecret(name);
        } catch (error) {
          errors.push({ name, error: error.message });
        }
      })
    );

    if (errors.length > 0) {
      console.error('[SecretManager] Failed to load some secrets:', errors);
    }

    return results;
  }

  /**
   * Refresh all cached secrets (for rotation)
   */
  async refreshAll() {
    console.info('[SecretManager] Refreshing all cached secrets...');
    const secretNames = Array.from(this.cache.keys());

    for (const name of secretNames) {
      try {
        await this.getSecret(name, { refresh: true });
      } catch (error) {
        console.error(`[SecretManager] Failed to refresh ${name}:`, error.message);
      }
    }

    console.info(`[SecretManager] Refreshed ${secretNames.length} secrets`);
  }

  /**
   * Start automatic secret rotation (every 24 hours)
   */
  startAutoRotation() {
    setInterval(() => {
      this.refreshAll().catch(error => {
        console.error('[SecretManager] Auto-rotation failed:', error);
      });
    }, this.refreshInterval);

    console.info('[SecretManager] Auto-rotation enabled (24h interval)');
  }

  /**
   * Get cache status for monitoring
   */
  getCacheStatus() {
    const status = {};
    for (const [name, data] of this.cache.entries()) {
      const ttl = Math.max(0, data.expiresAt - Date.now());
      status[name] = {
        source: data.source,
        ttl: Math.floor(ttl / 1000), // seconds
        expiresAt: new Date(data.expiresAt).toISOString()
      };
    }
    return status;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
    console.info('[SecretManager] Cache cleared');
  }
}

// Export singleton instance
const secretManager = new SecretManager();

export {
  SecretManager,
  secretManager,

  // Convenience functions
  secretManager as default
};

export const getSecret = (name, options) => secretManager.getSecret(name, options);
export const loadSecrets = (names) => secretManager.loadSecrets(names);
export const refreshAll = () => secretManager.refreshAll();
export const startAutoRotation = () => secretManager.startAutoRotation();
export const getCacheStatus = () => secretManager.getCacheStatus();
export const clearCache = () => secretManager.clearCache();
// Last optimized: 2025-10-02
