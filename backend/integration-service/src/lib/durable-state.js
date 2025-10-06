/**
 * DURABLE STATE MANAGEMENT
 * 
 * Replaces in-memory Maps with Cloud SQL persistence
 * Ensures state survives Cloud Run restarts and scaling
 */

import { createLogger } from '../../common/logging/index.js';
import { Pool } from 'pg';

const logger = createLogger('durable-state');

class DurableStateManager {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
    this.safeMode = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    // In SAFE_MODE, skip database initialization
    if (process.env.SAFE_MODE === 'true') {
      logger.warn('Durable state manager running in SAFE_MODE - database disabled');
      this.isInitialized = true;
      this.safeMode = true;
      return;
    }

    try {
      // Cloud SQL connection configuration
      const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'livhana_integration',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };

      this.pool = new Pool(config);
      
      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      // Initialize schema
      await this.initializeSchema();
      
      this.isInitialized = true;
      logger.info('Durable state manager initialized', { 
        host: config.host,
        database: config.database 
      });

    } catch (error) {
      logger.error('Failed to initialize durable state manager', { error: error.message });
      throw error;
    }
  }

  async initializeSchema() {
    const schema = `
      -- Verification sessions table
      CREATE TABLE IF NOT EXISTS verification_sessions (
        order_id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255),
        customer_email VARCHAR(255) NOT NULL,
        order_total DECIMAL(10,2),
        status VARCHAR(50) NOT NULL DEFAULT 'pending_verification',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deadline TIMESTAMP WITH TIME ZONE NOT NULL,
        verification_attempts INTEGER DEFAULT 0,
        last_reminder_sent TIMESTAMP WITH TIME ZONE,
        membership_opt_in BOOLEAN DEFAULT FALSE,
        age_verified BOOLEAN DEFAULT FALSE,
        veriff_session_id VARCHAR(255),
        verification_url TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Webhook events table (for idempotency)
      CREATE TABLE IF NOT EXISTS webhook_events (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(event_id, provider)
      );

      -- Countdown timers table
      CREATE TABLE IF NOT EXISTS countdown_timers (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        timer_type VARCHAR(50) NOT NULL,
        deadline TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        cloud_task_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        INDEX idx_countdown_deadline (deadline),
        INDEX idx_countdown_status (status)
      );

      -- Event log for BigQuery export
      CREATE TABLE IF NOT EXISTS event_log (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        order_id VARCHAR(255),
        customer_id VARCHAR(255),
        event_data JSONB NOT NULL,
        event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        INDEX idx_event_time (event_time),
        INDEX idx_event_type (event_type)
      );
    `;

    await this.pool.query(schema);
    logger.info('Database schema initialized');
  }

  // Verification session management
  async setVerificationSession(orderId, sessionData) {
    await this.initialize();
    
    if (this.safeMode) {
      logger.warn('SAFE_MODE: setVerificationSession skipped', { orderId });
      return { order_id: orderId, ...sessionData };
    }
    
    const query = `
      INSERT INTO verification_sessions (
        order_id, customer_id, customer_email, order_total, status,
        deadline, verification_attempts, membership_opt_in, age_verified,
        veriff_session_id, verification_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (order_id) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        verification_attempts = EXCLUDED.verification_attempts,
        membership_opt_in = EXCLUDED.membership_opt_in,
        age_verified = EXCLUDED.age_verified,
        veriff_session_id = EXCLUDED.veriff_session_id,
        verification_url = EXCLUDED.verification_url,
        updated_at = NOW()
    `;

    const values = [
      orderId,
      sessionData.customerId,
      sessionData.customerEmail,
      sessionData.orderTotal,
      sessionData.status,
      sessionData.deadline,
      sessionData.verificationAttempts || 0,
      sessionData.membershipOptIn || false,
      sessionData.ageVerified || false,
      sessionData.veriffSessionId,
      sessionData.verificationUrl
    ];

    await this.pool.query(query, values);
    logger.info('Verification session stored', { orderId, status: sessionData.status });
  }

  async getVerificationSession(orderId) {
    await this.initialize();
    
    const query = 'SELECT * FROM verification_sessions WHERE order_id = $1';
    const result = await this.pool.query(query, [orderId]);
    
    return result.rows[0] || null;
  }

  async getAllPendingVerifications() {
    await this.initialize();
    
    const query = `
      SELECT * FROM verification_sessions 
      WHERE status IN ('pending_verification', 'verification_sent')
      AND deadline > NOW()
      ORDER BY deadline ASC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getExpiredVerifications() {
    await this.initialize();
    
    const query = `
      SELECT * FROM verification_sessions 
      WHERE status = 'pending_verification'
      AND deadline <= NOW()
      ORDER BY deadline ASC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Webhook idempotency
  async isWebhookProcessed(eventId, provider) {
    await this.initialize();
    
    const query = 'SELECT 1 FROM webhook_events WHERE event_id = $1 AND provider = $2';
    const result = await this.pool.query(query, [eventId, provider]);
    
    return result.rows.length > 0;
  }

  async markWebhookProcessed(eventId, provider, eventType, payload) {
    await this.initialize();
    
    const query = `
      INSERT INTO webhook_events (event_id, provider, event_type, payload)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (event_id, provider) DO NOTHING
    `;
    
    await this.pool.query(query, [eventId, provider, eventType, JSON.stringify(payload)]);
    logger.info('Webhook marked as processed', { eventId, provider, eventType });
  }

  // Countdown timer management
  async createCountdownTimer(orderId, timerType, deadline, cloudTaskId = null) {
    await this.initialize();
    
    const query = `
      INSERT INTO countdown_timers (order_id, timer_type, deadline, cloud_task_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (order_id, timer_type) 
      DO UPDATE SET deadline = EXCLUDED.deadline, cloud_task_id = EXCLUDED.cloud_task_id
    `;
    
    await this.pool.query(query, [orderId, timerType, deadline, cloudTaskId]);
    logger.info('Countdown timer created', { orderId, timerType, deadline });
  }

  async getActiveCountdownTimers() {
    await this.initialize();
    
    const query = `
      SELECT * FROM countdown_timers 
      WHERE status = 'active' 
      AND deadline > NOW()
      ORDER BY deadline ASC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async markCountdownCompleted(orderId, timerType) {
    await this.initialize();
    
    const query = `
      UPDATE countdown_timers 
      SET status = 'completed' 
      WHERE order_id = $1 AND timer_type = $2
    `;
    
    await this.pool.query(query, [orderId, timerType]);
    logger.info('Countdown timer completed', { orderId, timerType });
  }

  // Event logging for BigQuery export
  async logEvent(eventType, orderId, customerId, eventData) {
    await this.initialize();
    
    const query = `
      INSERT INTO event_log (event_type, order_id, customer_id, event_data)
      VALUES ($1, $2, $3, $4)
    `;
    
    await this.pool.query(query, [eventType, orderId, customerId, JSON.stringify(eventData)]);
  }

  // Health check
  async healthCheck() {
    try {
      await this.initialize();
      const result = await this.pool.query('SELECT 1 as healthy');
      return { healthy: true, database: 'connected' };
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      return { healthy: false, database: 'disconnected', error: error.message };
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isInitialized = false;
      logger.info('Durable state manager closed');
    }
  }
}

// Singleton instance
const durableState = new DurableStateManager();

export default durableState;
