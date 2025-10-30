import { EventEmitter } from 'events';
import { queueMonitor } from '../queue/index.js';

/**
 * Queue Health Monitor
 * Provides real-time health monitoring and alerting for queue system
 */
class QueueHealthMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      latencyThreshold: 800, // p95 latency threshold in ms
      depthThreshold: 1000, // Max acceptable queue depth
      errorRateThreshold: 0.05, // 5% error rate threshold
      checkInterval: 5000, // Check every 5 seconds
      ...options
    };

    this.healthStatus = new Map();
    this.startMonitoring();
  }

  startMonitoring() {
    // Monitor queue anomalies
    queueMonitor.on('anomaly', this.handleAnomaly.bind(this));

    // Regular health checks
    setInterval(() => {
      this.checkQueueHealth();
    }, this.options.checkInterval);
  }

  handleAnomaly({ queueName, score, metrics }) {
    const severity = this.calculateSeverity(score, metrics);
    const alert = {
      type: 'anomaly',
      queueName,
      score,
      metrics,
      severity,
      timestamp: new Date().toISOString()
    };

    this.emit('alert', alert);
    this.updateHealthStatus(queueName, alert);
  }

  calculateSeverity(score, metrics) {
    if (score > 80) return 'critical';
    if (score > 60) return 'high';
    if (score > 40) return 'medium';
    return 'low';
  }

  async checkQueueHealth() {
    const queues = Array.from(queueMonitor.metrics.keys());
    
    for (const queueName of queues) {
      const metrics = queueMonitor.getQueueMetrics(queueName);
      const health = this.evaluateHealth(metrics);
      
      if (health.status !== 'healthy') {
        const alert = {
          type: 'health_check',
          queueName,
          ...health,
          timestamp: new Date().toISOString()
        };
        
        this.emit('alert', alert);
        this.updateHealthStatus(queueName, alert);
      }
    }
  }

  evaluateHealth(metrics) {
    const issues = [];
    let status = 'healthy';

    // Check latency
    if (metrics.p95Latency > this.options.latencyThreshold) {
      issues.push({
        type: 'high_latency',
        value: metrics.p95Latency,
        threshold: this.options.latencyThreshold
      });
      status = 'degraded';
    }

    // Check queue depth
    if (metrics.depth > this.options.depthThreshold) {
      issues.push({
        type: 'high_depth',
        value: metrics.depth,
        threshold: this.options.depthThreshold
      });
      status = 'degraded';
    }

    // Check error rate
    const errorRate = metrics.errors / (metrics.completed + metrics.errors || 1);
    if (errorRate > this.options.errorRateThreshold) {
      issues.push({
        type: 'high_error_rate',
        value: errorRate,
        threshold: this.options.errorRateThreshold
      });
      status = 'degraded';
    }

    return {
      status,
      issues,
      metrics
    };
  }

  updateHealthStatus(queueName, alert) {
    const currentStatus = this.healthStatus.get(queueName) || [];
    currentStatus.unshift(alert);
    
    // Keep last 100 alerts
    if (currentStatus.length > 100) {
      currentStatus.pop();
    }
    
    this.healthStatus.set(queueName, currentStatus);
  }

  getQueueHealth(queueName) {
    const alerts = this.healthStatus.get(queueName) || [];
    const metrics = queueMonitor.getQueueMetrics(queueName);
    
    return {
      queueName,
      currentMetrics: metrics,
      recentAlerts: alerts.slice(0, 10),
      status: this.evaluateHealth(metrics)
    };
  }

  getAllQueuesHealth() {
    const queues = Array.from(queueMonitor.metrics.keys());
    return queues.map(queueName => this.getQueueHealth(queueName));
  }
}

// Create singleton instance
const queueHealthMonitor = new QueueHealthMonitor();

// Export singleton
export default queueHealthMonitor;
