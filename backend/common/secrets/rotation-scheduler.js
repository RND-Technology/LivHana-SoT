// Automatic secret rotation scheduler
// Runs every 24 hours to refresh secrets from GCP Secret Manager

import { secretManager } from './secret-manager.js';

class SecretRotationScheduler {
  constructor(options = {}) {
    this.interval = options.interval || 24 * 60 * 60 * 1000; // 24 hours
    this.enabled = options.enabled !== false;
    this.timerId = null;
    this.lastRotation = null;
    this.rotationCount = 0;
    this.onRotationComplete = options.onRotationComplete || null;
  }

  /**
   * Start the rotation scheduler
   */
  start() {
    if (!this.enabled) {
      console.info('[SecretRotation] Scheduler disabled');
      return;
    }

    if (this.timerId) {
      console.info('[SecretRotation] Scheduler already running');
      return;
    }

    this.timerId = setInterval(() => {
      this.rotate().catch(error => {
        console.error('[SecretRotation] Rotation failed:', error);
      });
    }, this.interval);

    console.info(`[SecretRotation] Scheduler started (interval: ${this.interval / 1000 / 60 / 60}h)`);

    // Perform initial rotation after 1 minute
    setTimeout(() => {
      this.rotate().catch(error => {
        console.error('[SecretRotation] Initial rotation failed:', error);
      });
    }, 60 * 1000);
  }

  /**
   * Stop the rotation scheduler
   */
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      console.info('[SecretRotation] Scheduler stopped');
    }
  }

  /**
   * Perform secret rotation
   */
  async rotate() {
    console.info('[SecretRotation] Starting secret rotation...');
    const startTime = Date.now();

    try {
      await secretManager.refreshAll();

      this.lastRotation = new Date();
      this.rotationCount++;

      const duration = Date.now() - startTime;
      const cacheStatus = secretManager.getCacheStatus();

      console.info('[SecretRotation] Rotation completed', {
        duration: `${duration}ms`,
        secretsRotated: Object.keys(cacheStatus).length,
        nextRotation: new Date(Date.now() + this.interval).toISOString()
      });

      // Call callback if provided
      if (this.onRotationComplete) {
        await this.onRotationComplete({
          success: true,
          duration,
          secretsRotated: Object.keys(cacheStatus).length,
          timestamp: this.lastRotation
        });
      }
    } catch (error) {
      console.error('[SecretRotation] Rotation failed:', error);

      if (this.onRotationComplete) {
        await this.onRotationComplete({
          success: false,
          error: error.message,
          timestamp: new Date()
        });
      }

      throw error;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      running: !!this.timerId,
      interval: this.interval,
      lastRotation: this.lastRotation,
      rotationCount: this.rotationCount,
      nextRotation: this.timerId
        ? new Date(Date.now() + this.interval).toISOString()
        : null
    };
  }
}

// Export singleton instance
const rotationScheduler = new SecretRotationScheduler();

export {
  SecretRotationScheduler,
  rotationScheduler,
  rotationScheduler as default
};

export const startRotation = (options) => {
  if (options) {
    Object.assign(rotationScheduler, options);
  }
  rotationScheduler.start();
};

export const stopRotation = () => rotationScheduler.stop();
export const rotateNow = () => rotationScheduler.rotate();
export const getRotationStatus = () => rotationScheduler.getStatus();
