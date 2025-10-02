/**
 * Audit Logging System
 * Logs security-critical events for compliance and forensics
 */

import { createLogger } from './index.js';
import { BigQuery } from '@google-cloud/bigquery';

const auditLogger = createLogger('security-audit');
const bigquery = new BigQuery();

/**
 * Audit Event Types
 */
const AUDIT_EVENTS = {
  // Authentication Events
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_TOKEN_REFRESH: 'auth.token.refresh',
  AUTH_TOKEN_EXPIRED: 'auth.token.expired',
  AUTH_TOKEN_INVALID: 'auth.token.invalid',
  AUTH_PASSWORD_CHANGE: 'auth.password.change',
  AUTH_PASSWORD_RESET: 'auth.password.reset',

  // Authorization Events
  AUTHZ_ACCESS_DENIED: 'authz.access.denied',
  AUTHZ_PERMISSION_GRANT: 'authz.permission.grant',
  AUTHZ_PERMISSION_REVOKE: 'authz.permission.revoke',
  AUTHZ_ROLE_CHANGE: 'authz.role.change',

  // Admin Actions
  ADMIN_USER_CREATE: 'admin.user.create',
  ADMIN_USER_DELETE: 'admin.user.delete',
  ADMIN_USER_UPDATE: 'admin.user.update',
  ADMIN_USER_SUSPEND: 'admin.user.suspend',
  ADMIN_CONFIG_CHANGE: 'admin.config.change',
  ADMIN_DATA_EXPORT: 'admin.data.export',
  ADMIN_SYSTEM_COMMAND: 'admin.system.command',

  // Data Access Events
  DATA_SENSITIVE_ACCESS: 'data.sensitive.access',
  DATA_SENSITIVE_EXPORT: 'data.sensitive.export',
  DATA_BULK_QUERY: 'data.bulk.query',
  DATA_MODIFICATION: 'data.modification',

  // Security Events
  SECURITY_RATE_LIMIT_EXCEEDED: 'security.rate_limit.exceeded',
  SECURITY_SUSPICIOUS_REQUEST: 'security.suspicious.request',
  SECURITY_INJECTION_ATTEMPT: 'security.injection.attempt',
  SECURITY_BRUTE_FORCE: 'security.brute_force',
  SECURITY_ANOMALY: 'security.anomaly',

  // Compliance Events
  COMPLIANCE_AGE_VERIFICATION: 'compliance.age.verification',
  COMPLIANCE_AGE_VERIFICATION_FAILURE: 'compliance.age.verification_failure',
  COMPLIANCE_COA_ACCESS: 'compliance.coa.access',
  COMPLIANCE_DATA_REQUEST: 'compliance.data.request',

  // System Events
  SYSTEM_CONFIG_LOAD: 'system.config.load',
  SYSTEM_SECRET_ACCESS: 'system.secret.access',
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RESTORE: 'system.restore'
};

/**
 * Audit Event Severity Levels
 */
const SEVERITY = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

/**
 * Log an audit event
 */
const logAuditEvent = async ({
  eventType,
  severity = SEVERITY.INFO,
  userId = null,
  userRole = null,
  ip = null,
  userAgent = null,
  resource = null,
  action = null,
  result = 'success',
  details = {},
  sessionId = null,
  requestId = null
}) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    severity,
    userId,
    userRole,
    ip,
    userAgent,
    resource,
    action,
    result,
    details: JSON.stringify(details),
    sessionId,
    requestId,
    environment: process.env.NODE_ENV || 'development',
    serviceName: process.env.SERVICE_NAME || 'unknown'
  };

  // Log to structured logger
  const logLevel = severity === SEVERITY.CRITICAL || severity === SEVERITY.ERROR ? 'error' :
                   severity === SEVERITY.WARNING ? 'warn' : 'info';

  auditLogger[logLevel](auditEntry, `Audit: ${eventType}`);

  // Write to BigQuery for long-term storage and compliance
  if (process.env.ENABLE_BIGQUERY_AUDIT === 'true') {
    try {
      await writeToBigQuery(auditEntry);
    } catch (error) {
      auditLogger.error({ error: error.message }, 'Failed to write audit log to BigQuery');
    }
  }

  // Alert on critical events
  if (severity === SEVERITY.CRITICAL) {
    await alertOnCriticalEvent(auditEntry);
  }

  return auditEntry;
};

/**
 * Write audit log to BigQuery
 */
const writeToBigQuery = async (auditEntry) => {
  const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET || 'security_audit');
  const table = dataset.table('audit_logs');

  const row = {
    ...auditEntry,
    insertId: `${auditEntry.timestamp}-${auditEntry.requestId || Math.random().toString(36)}`
  };

  await table.insert([row], {
    skipInvalidRows: false,
    ignoreUnknownValues: true
  });
};

/**
 * Alert on critical security events
 */
const alertOnCriticalEvent = async (auditEntry) => {
  // TODO: Integrate with alerting system (PagerDuty, Slack, etc.)
  auditLogger.error({
    alert: 'CRITICAL_SECURITY_EVENT',
    ...auditEntry
  }, 'CRITICAL SECURITY EVENT - IMMEDIATE ACTION REQUIRED');

  // If running in production, send alerts
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to alerting service
  }
};

/**
 * Create audit middleware for Express
 */
const createAuditMiddleware = ({ logger } = {}) => {
  return (req, res, next) => {
    // Generate request ID if not present
    req.requestId = req.requestId || req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Capture response for audit logging
    const originalSend = res.send;
    res.send = function (data) {
      res.send = originalSend;
      res.locals.responseData = data;
      return res.send(data);
    };

    // Log on response finish
    res.on('finish', () => {
      // Only audit certain events
      const shouldAudit =
        req.path.includes('/admin') ||
        req.path.includes('/auth') ||
        req.path.includes('/compliance') ||
        res.statusCode >= 400 ||
        req.method !== 'GET';

      if (shouldAudit) {
        const eventType = determineEventType(req, res);
        const severity = determineSeverity(res.statusCode, eventType);

        logAuditEvent({
          eventType,
          severity,
          userId: req.user?.id || null,
          userRole: req.user?.role || null,
          ip: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          resource: req.path,
          action: req.method,
          result: res.statusCode < 400 ? 'success' : 'failure',
          details: {
            statusCode: res.statusCode,
            query: req.query,
            bodyKeys: req.body ? Object.keys(req.body) : []
          },
          requestId: req.requestId
        }).catch(err => {
          logger?.error({ error: err.message }, 'Failed to log audit event');
        });
      }
    });

    next();
  };
};

/**
 * Determine event type from request/response
 */
const determineEventType = (req, res) => {
  const path = req.path.toLowerCase();
  const method = req.method.toUpperCase();

  // Authentication events
  if (path.includes('/login')) {
    return res.statusCode === 200 ? AUDIT_EVENTS.AUTH_LOGIN_SUCCESS : AUDIT_EVENTS.AUTH_LOGIN_FAILURE;
  }
  if (path.includes('/logout')) return AUDIT_EVENTS.AUTH_LOGOUT;
  if (path.includes('/refresh')) return AUDIT_EVENTS.AUTH_TOKEN_REFRESH;

  // Admin events
  if (path.includes('/admin')) {
    if (method === 'POST') return AUDIT_EVENTS.ADMIN_USER_CREATE;
    if (method === 'DELETE') return AUDIT_EVENTS.ADMIN_USER_DELETE;
    if (method === 'PUT' || method === 'PATCH') return AUDIT_EVENTS.ADMIN_USER_UPDATE;
  }

  // Compliance events
  if (path.includes('/age-verification')) {
    return res.statusCode === 200 ?
      AUDIT_EVENTS.COMPLIANCE_AGE_VERIFICATION :
      AUDIT_EVENTS.COMPLIANCE_AGE_VERIFICATION_FAILURE;
  }

  // Security events
  if (res.statusCode === 429) return AUDIT_EVENTS.SECURITY_RATE_LIMIT_EXCEEDED;
  if (res.statusCode === 403) return AUDIT_EVENTS.AUTHZ_ACCESS_DENIED;
  if (res.statusCode === 401) return AUDIT_EVENTS.AUTH_TOKEN_INVALID;

  // Data access
  if (path.includes('/bigquery') || path.includes('/query')) {
    return AUDIT_EVENTS.DATA_BULK_QUERY;
  }

  // Default
  return 'system.request';
};

/**
 * Determine severity from status code and event type
 */
const determineSeverity = (statusCode, eventType) => {
  // Critical events
  if (eventType === AUDIT_EVENTS.SECURITY_INJECTION_ATTEMPT ||
      eventType === AUDIT_EVENTS.SECURITY_BRUTE_FORCE ||
      eventType === AUDIT_EVENTS.ADMIN_DATA_EXPORT) {
    return SEVERITY.CRITICAL;
  }

  // Errors
  if (statusCode >= 500) return SEVERITY.ERROR;

  // Warnings
  if (statusCode >= 400 ||
      eventType === AUDIT_EVENTS.AUTH_LOGIN_FAILURE ||
      eventType === AUDIT_EVENTS.AUTHZ_ACCESS_DENIED ||
      eventType === AUDIT_EVENTS.SECURITY_RATE_LIMIT_EXCEEDED) {
    return SEVERITY.WARNING;
  }

  return SEVERITY.INFO;
};

/**
 * Query audit logs
 */
const queryAuditLogs = async ({
  startDate,
  endDate,
  userId = null,
  eventType = null,
  severity = null,
  limit = 100
}) => {
  const conditions = [];
  const params = [];

  if (startDate) {
    conditions.push('timestamp >= @startDate');
    params.push({ name: 'startDate', value: startDate, type: 'TIMESTAMP' });
  }

  if (endDate) {
    conditions.push('timestamp <= @endDate');
    params.push({ name: 'endDate', value: endDate, type: 'TIMESTAMP' });
  }

  if (userId) {
    conditions.push('userId = @userId');
    params.push({ name: 'userId', value: userId, type: 'STRING' });
  }

  if (eventType) {
    conditions.push('eventType = @eventType');
    params.push({ name: 'eventType', value: eventType, type: 'STRING' });
  }

  if (severity) {
    conditions.push('severity = @severity');
    params.push({ name: 'severity', value: severity, type: 'STRING' });
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT *
    FROM \`${process.env.GCP_PROJECT}.security_audit.audit_logs\`
    ${whereClause}
    ORDER BY timestamp DESC
    LIMIT @limit
  `;

  params.push({ name: 'limit', value: limit, type: 'INT64' });

  const [rows] = await bigquery.query({
    query,
    params,
    useLegacySql: false
  });

  return rows;
};

export { AUDIT_EVENTS, SEVERITY, logAuditEvent, createAuditMiddleware, queryAuditLogs };
