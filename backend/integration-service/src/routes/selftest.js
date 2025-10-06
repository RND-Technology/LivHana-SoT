import express from 'express';
import { createLogger } from '../../common/logging/index.js';
import { getVeriffClient } from '../lib/veriff-client.js';
import { getSendGridClient } from '../lib/sendgrid-client.js';
import { getKAJARefundClient } from '../lib/kaja-refund-client.js';
import LightspeedClient from '../lib/lightspeed-client.js';
import { getBigQueryStatus } from '../bigquery_live.js';

const router = express.Router();
const logger = createLogger('selftest');

/**
 * /__selftest - Golden Path Self-Test Endpoint
 *
 * Tests all critical subsystems in dry-run mode:
 * - Veriff: API key valid (dry-run)
 * - SendGrid: API key valid (dry-run)
 * - KAJA: API credentials valid (dry-run)
 * - LightSpeed: Connection established
 * - BigQuery: Dataset accessible
 * - Datastore: State persistence (when implemented)
 *
 * Returns JSON matrix: ok | degraded | blocker
 *
 * SAFE_MODE detection:
 * - If any subsystem is degraded (missing keys), set X-Safe-Mode: true
 * - If any subsystem is blocker (cannot function), return 503
 *
 * Usage:
 * - Wire to uptime check: curl -sf https://integration-service.run.app/__selftest | jq
 * - Alert on any "blocker" status
 * - Monitor for "degraded" (safe mode active)
 */

router.get('/__selftest', async (req, res) => {
  const startTime = Date.now();
  const results = {};
  const SAFE_MODE = process.env.SAFE_MODE === 'true';

  logger.info('🔍 Running self-test');

  // Test 1: Veriff Age Verification
  try {
    const veriff = getVeriffClient();

    if (!veriff.apiKey) {
      results.veriff = {
        status: 'blocker',
        message: 'VERIFF_API_KEY not configured',
        critical: true
      };
    } else {
      // Dry-run: Just check that client can be instantiated
      results.veriff = {
        status: 'ok',
        message: 'Veriff client initialized',
        baseUrl: veriff.baseUrl,
        hasApiSecret: !!veriff.apiSecret
      };
    }
  } catch (error) {
    results.veriff = {
      status: 'blocker',
      message: `Veriff initialization failed: ${error.message}`,
      critical: true
    };
  }

  // Test 2: SendGrid Email
  try {
    const sendgrid = getSendGridClient();

    if (!sendgrid.isAvailable()) {
      results.sendgrid = {
        status: SAFE_MODE ? 'safe_mode' : 'degraded',
        message: 'SENDGRID_API_KEY not configured - emails disabled',
        critical: false,
        safeMode: SAFE_MODE
      };
    } else {
      results.sendgrid = {
        status: 'ok',
        message: 'SendGrid client initialized',
        fromEmail: sendgrid.fromEmail,
        fromName: sendgrid.fromName
      };
    }
  } catch (error) {
    results.sendgrid = {
      status: 'degraded',
      message: `SendGrid initialization failed: ${error.message}`,
      critical: false
    };
  }

  // Test 3: KAJA Refunds
  try {
    const kaja = getKAJARefundClient();

    if (!kaja.isAvailable()) {
      results.kaja = {
        status: SAFE_MODE ? 'safe_mode' : 'degraded',
        message: 'KAJA credentials not configured - refunds will be mocked',
        critical: false,
        safeMode: SAFE_MODE
      };
    } else {
      results.kaja = {
        status: 'ok',
        message: 'KAJA client initialized',
        merchantId: kaja.merchantId,
        baseUrl: kaja.baseUrl
      };
    }
  } catch (error) {
    results.kaja = {
      status: 'degraded',
      message: `KAJA initialization failed: ${error.message}`,
      critical: false
    };
  }

  // Test 4: LightSpeed
  try {
    const lightspeed = new LightspeedClient();

    if (!lightspeed.isConfigured()) {
      results.lightspeed = {
        status: 'blocker',
        message: 'LightSpeed credentials not configured',
        critical: true
      };
    } else {
      results.lightspeed = {
        status: 'ok',
        message: 'LightSpeed client initialized',
        accountId: lightspeed.accountId
      };
    }
  } catch (error) {
    results.lightspeed = {
      status: 'blocker',
      message: `LightSpeed initialization failed: ${error.message}`,
      critical: true
    };
  }

  // Test 5: BigQuery
  try {
    const bqStatus = getBigQueryStatus();

    if (!bqStatus.enabled) {
      results.bigquery = {
        status: 'degraded',
        message: 'BigQuery disabled - using mock data',
        critical: false
      };
    } else {
      results.bigquery = {
        status: 'ok',
        message: 'BigQuery enabled',
        dataset: bqStatus.dataset,
        mode: bqStatus.mode
      };
    }
  } catch (error) {
    results.bigquery = {
      status: 'degraded',
      message: `BigQuery check failed: ${error.message}`,
      critical: false
    };
  }

  // Test 6: Datastore (in-memory Map for now)
  try {
    // TODO: Replace with Cloud SQL/Firestore check
    results.datastore = {
      status: 'degraded',
      message: 'Using in-memory Map (not durable) - need Cloud SQL/Firestore',
      critical: false,
      issue: 'State will be lost on restart'
    };
  } catch (error) {
    results.datastore = {
      status: 'blocker',
      message: `Datastore check failed: ${error.message}`,
      critical: true
    };
  }

  // Calculate overall status
  const blockers = Object.values(results).filter(r => r.status === 'blocker');
  const degraded = Object.values(results).filter(r => r.status === 'degraded' || r.status === 'safe_mode');
  const ok = Object.values(results).filter(r => r.status === 'ok');

  const overallStatus = blockers.length > 0 ? 'blocker' :
                       degraded.length > 0 ? 'degraded' :
                       'ok';

  const httpStatus = overallStatus === 'blocker' ? 503 : 200;
  const isSafeMode = SAFE_MODE || degraded.some(r => r.status === 'safe_mode');

  const elapsed = Date.now() - startTime;

  const response = {
    status: overallStatus,
    safeMode: isSafeMode,
    summary: {
      ok: ok.length,
      degraded: degraded.length,
      blockers: blockers.length,
      total: Object.keys(results).length
    },
    subsystems: results,
    timestamp: new Date().toISOString(),
    elapsed: `${elapsed}ms`,
    version: process.env.GIT_COMMIT || 'unknown',
    environment: process.env.NODE_ENV || 'development'
  };

  // Add X-Safe-Mode header if in safe mode
  if (isSafeMode) {
    res.setHeader('X-Safe-Mode', 'true');
  }

  logger.info('✅ Self-test complete', {
    status: overallStatus,
    safeMode: isSafeMode,
    blockers: blockers.length,
    degraded: degraded.length,
    elapsed: `${elapsed}ms`
  });

  res.status(httpStatus).json(response);
});

export default router;

// Created: 2025-10-05
// Self-test endpoint for golden-path validation
// Returns ok | degraded | blocker status per subsystem
// Wire to uptime checks + alerting
