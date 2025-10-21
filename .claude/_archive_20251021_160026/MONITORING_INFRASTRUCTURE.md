---
status: READY FOR IMPLEMENTATION
priority: WEEK 2 HARDENING
created: 2025-10-08T09:00:00Z
---

# MONITORING & LOGGING INFRASTRUCTURE

Production-ready observability for all 5 prototypes

---

## 🎯 ARCHITECTURE

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  Services    │────>│  Prometheus   │────>│  Grafana     │
│  (5 total)   │     │  (Metrics)    │     │  (Dashboards)│
└──────────────┘     └───────────────┘     └──────────────┘
       │
       │ Logs
       ▼
┌──────────────┐     ┌───────────────┐
│  Cloud       │────>│  BigQuery     │
│  Logging     │     │  (Analysis)   │
└──────────────┘     └───────────────┘
       │
       │ Errors
       ▼
┌──────────────┐
│  Sentry      │
│  (Errors)    │
└──────────────┘
```

---

## 📊 PROMETHEUS METRICS

### Service-Level Metrics (All Services)

```typescript
// Add to each service
import promClient from 'prom-client';

const register = new promClient.Registry();

// Default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Business Metrics

**Lightspeed BigQuery Pipeline:**
```typescript
const salesSynced = new promClient.Counter({
  name: 'sales_synced_total',
  help: 'Total number of sales synced to BigQuery'
});

const syncLatency = new promClient.Histogram({
  name: 'sync_latency_seconds',
  help: 'Time taken to sync sales',
  buckets: [1, 5, 10, 30, 60, 120]
});

const syncErrors = new promClient.Counter({
  name: 'sync_errors_total',
  help: 'Total number of sync errors',
  labelNames: ['error_type']
});
```

**Customer Profile Service:**
```typescript
const profileRequests = new promClient.Counter({
  name: 'profile_requests_total',
  help: 'Total number of profile requests'
});

const profileCacheHits = new promClient.Counter({
  name: 'profile_cache_hits_total',
  help: 'Total number of cache hits'
});
```

**SI Recommendations:**
```typescript
const recommendationsServed = new promClient.Counter({
  name: 'recommendations_served_total',
  help: 'Total number of recommendations served'
});

const recommendationQuality = new promClient.Histogram({
  name: 'recommendation_confidence',
  help: 'Confidence score of recommendations',
  buckets: [0.1, 0.3, 0.5, 0.7, 0.9, 1.0]
});
```

**Voice Commerce:**
```typescript
const voiceCommands = new promClient.Counter({
  name: 'voice_commands_total',
  help: 'Total number of voice commands processed',
  labelNames: ['intent']
});

const orderCreations = new promClient.Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created via voice'
});

const intentConfidence = new promClient.Histogram({
  name: 'intent_confidence',
  help: 'Confidence score of intent extraction',
  buckets: [0.1, 0.3, 0.5, 0.7, 0.9, 1.0]
});
```

---

## 📝 STRUCTURED LOGGING

### Winston Logger Configuration

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'unknown',
    version: process.env.SERVICE_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  },
  transports: [
    // Console (for Cloud Run)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add context to logs
logger.child = (meta: object) => logger.child(meta);

export default logger;
```

### Logging Best Practices

```typescript
// Good logging examples

// Request logging
logger.info('Incoming request', {
  method: req.method,
  path: req.path,
  user_id: req.user?.id,
  request_id: req.id
});

// Business event logging
logger.info('Sale synced to BigQuery', {
  sale_id: sale.saleID,
  customer_id: sale.customer?.id,
  amount: sale.total,
  latency_ms: Date.now() - startTime
});

// Error logging
logger.error('Failed to sync sale', {
  error: error.message,
  stack: error.stack,
  sale_id: sale.saleID,
  retry_count: retryCount
});

// Performance logging
logger.debug('Query executed', {
  query: 'getCustomerProfile',
  customer_id: customerId,
  latency_ms: queryTime,
  cache_hit: cacheHit
});
```

---

## 🚨 ERROR TRACKING (SENTRY)

### Sentry Configuration

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.SERVICE_VERSION,
  tracesSampleRate: 0.1, // Sample 10% of transactions
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.headers?.['authorization'];
    }
    return event;
  }
});

// Express middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());

// Manual error reporting
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      service: 'lightspeed-bigquery',
      operation: 'syncSales'
    },
    extra: {
      sale_id: saleId,
      retry_count: retryCount
    }
  });
  throw error;
}
```

---

## 📈 GRAFANA DASHBOARDS

### Service Health Dashboard

**Panels:**
1. **Request Rate**: `rate(http_requests_total[5m])`
2. **Error Rate**: `rate(http_requests_total{status_code=~"5.."}[5m])`
3. **P95 Latency**: `histogram_quantile(0.95, http_request_duration_seconds)`
4. **CPU Usage**: `process_cpu_usage_percent`
5. **Memory Usage**: `process_resident_memory_bytes / 1024 / 1024`

### Business Metrics Dashboard

**Lightspeed BigQuery:**
- Sales synced per minute
- Sync latency (P50, P95, P99)
- Error rate by error type
- BigQuery insertion rate

**Customer Profile:**
- Profile requests per minute
- Cache hit rate
- Average profile enrichment time
- Data source health (Lightspeed, BigQuery)

**SI Recommendations:**
- Recommendations served per minute
- Average confidence score
- Collaborative filtering hit rate
- Fallback rate (popular products)

**Voice Commerce:**
- Voice commands per minute
- Intent distribution (pie chart)
- Order conversion rate (voice → order)
- Average intent confidence

---

## 🔔 ALERTING RULES

### Critical Alerts (PagerDuty)

```yaml
# Alert: Service Down
- alert: ServiceDown
  expr: up{job="service"} == 0
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Service {{ $labels.instance }} is down"

# Alert: High Error Rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate on {{ $labels.service }}"

# Alert: High Latency
- alert: HighLatency
  expr: histogram_quantile(0.95, http_request_duration_seconds) > 10
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "High P95 latency on {{ $labels.service }}"
```

### Business Alerts (Slack)

```yaml
# Alert: Sales Sync Stalled
- alert: SalesSyncStalled
  expr: rate(sales_synced_total[10m]) == 0
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "No sales synced in 15 minutes"

# Alert: Low Recommendation Quality
- alert: LowRecommendationQuality
  expr: avg(recommendation_confidence) < 0.5
  for: 30m
  labels:
    severity: warning
  annotations:
    summary: "Average recommendation confidence below 0.5"

# Alert: Voice Commerce Conversion Drop
- alert: VoiceConversionDrop
  expr: rate(orders_created_total[1h]) / rate(voice_commands_total[1h]) < 0.1
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: "Voice-to-order conversion below 10%"
```

---

## 🚀 DEPLOYMENT

### 1. Add Dependencies

```bash
npm install prom-client winston @sentry/node
```

### 2. Update Each Service

Add monitoring middleware to each service's Express app.

### 3. Deploy Prometheus

```bash
# Cloud Run or GKE
kubectl apply -f monitoring/prometheus.yaml
```

### 4. Deploy Grafana

```bash
# Cloud Run or GKE
kubectl apply -f monitoring/grafana.yaml
```

### 5. Configure Alerts

```bash
# Add alerting rules to Prometheus
kubectl apply -f monitoring/alerts.yaml
```

---

## 📊 SLIs/SLOs

### Service-Level Objectives

**Lightspeed BigQuery Pipeline:**
- **Availability**: 99.9% (8.76 hours downtime/year)
- **Latency**: P95 < 5 seconds
- **Error Rate**: < 1% of syncs fail

**Customer Profile Service:**
- **Availability**: 99.9%
- **Latency**: P95 < 2 seconds
- **Error Rate**: < 0.5%

**SI Recommendations:**
- **Availability**: 99.5%
- **Latency**: P95 < 3 seconds
- **Quality**: Average confidence > 0.6

**Voice Commerce:**
- **Availability**: 99.5%
- **Latency**: P95 < 5 seconds (includes Claude API)
- **Accuracy**: Intent extraction confidence > 0.7

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Add prom-client to all services
- [ ] Add Winston structured logging
- [ ] Add Sentry error tracking
- [ ] Create Prometheus config
- [ ] Create Grafana dashboards
- [ ] Configure alerting rules
- [ ] Set up PagerDuty integration
- [ ] Set up Slack integration
- [ ] Test alerts (trigger test errors)
- [ ] Document runbooks for alerts

---

**Status**: READY FOR IMPLEMENTATION
**Estimated Time**: 4-6 hours
**Priority**: WEEK 2
**Dependencies**: All services deployed to Cloud Run
