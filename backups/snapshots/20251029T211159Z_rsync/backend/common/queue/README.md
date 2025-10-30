# Queue Management System

## Last Audited: October 29, 2025 6:52 AM CDT

## Overview
Provides a hardened BullMQ queue factory with enhanced security, rate limiting, monitoring, and health checks. This implementation follows the Marine Corps standards for high-reliability message processing systems.

## Features
- Secure Redis connections with TLS and ACL support
- Rate limiting on high-volume queues
- Real-time health monitoring and anomaly detection
- P95 latency tracking (target < 800ms)
- Queue depth monitoring with auto-alerts
- Error rate tracking and alerting
- Comprehensive metrics collection

## Usage

### Basic Queue Creation
```javascript
import { createHardenedQueue } from './queue/index.js';

const queue = createHardenedQueue('my-queue', {
  rateLimitOpts: {
    max: 1000,        // Max jobs per interval
    interval: 60000   // Interval in ms (1 minute)
  }
});

// Add job with rate limiting
await queue.add('job-type', { data: 'payload' });
```

### Health Monitoring
```javascript
import queueHealthMonitor from '../health/QueueHealthMonitor.js';

// Listen for health alerts
queueHealthMonitor.on('alert', (alert) => {
  if (alert.type === 'anomaly' && alert.severity === 'critical') {
    notifyTeam(alert);
  }
});

// Get current health status
const health = queueHealthMonitor.getQueueHealth('my-queue');
console.log(health.status);  // 'healthy' or 'degraded'
```

## Configuration

### Queue Options
```javascript
{
  // Redis connection options
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
    tls: process.env.REDIS_TLS === 'true'
  },
  
  // Rate limiting options
  rateLimitOpts: {
    max: 1000,      // Max jobs per interval
    interval: 60000 // Interval in ms
  },
  
  // Job options
  jobOpts: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  },
  
  // Monitoring options
  monitoringOpts: {
    metricInterval: 5000,     // Metric collection interval
    alertThreshold: 40        // Anomaly score threshold
  }
}
```

### Health Monitor Thresholds
```javascript
{
  latencyThreshold: 800,    // P95 latency threshold (ms)
  depthThreshold: 1000,     // Max acceptable queue depth
  errorRateThreshold: 0.05, // 5% error rate threshold
  checkInterval: 5000       // Health check interval (ms)
}
```

## Metrics
The system tracks the following metrics in real-time:
- Queue depth (waiting + active jobs)
- P95 latency
- Error rate
- Throughput (jobs/minute)
- Worker count
- Anomaly score

## Testing
Run the test suite with:
```bash
npm test backend/common/tests/queue.test.js
```

Tests include:
- Queue factory functionality
- Rate limiting behavior
- Metric collection
- Health monitoring
- Anomaly detection
- End-to-end job processing

## Architecture Notes
- Uses singleton pattern for queue monitor
- Implements event emitter for real-time alerts
- Maintains rolling window of metrics (last hour)
- Calculates anomaly scores using weighted deltas
- Provides backwards compatibility layer for legacy code

## Dependencies
- bullmq: ^4.0.0
- redis: ^4.0.0
- events: ^3.3.0

## Security Considerations
- All Redis connections use TLS when enabled
- ACL support for Redis authentication
- Rate limiting prevents DoS scenarios
- Metric collection has minimal overhead
- Clean shutdown handling for all resources

## Monitoring Integration
The health monitoring system can be integrated with external monitoring tools via the alert event system. Each alert includes:
- Timestamp
- Queue name
- Alert type (anomaly or health_check)
- Severity level
- Current metrics
- Threshold values

## Maintenance
- Weekly drift scans check for unauthorized queue creation
- Auto-cleanup of completed/failed jobs
- Metric retention: 1 hour rolling window
- Alert history: last 100 alerts per queue
