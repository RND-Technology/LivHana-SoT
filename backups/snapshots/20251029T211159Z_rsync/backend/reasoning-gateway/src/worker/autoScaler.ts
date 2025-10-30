import { Queue, Worker } from 'bullmq';

export interface AutoScalerOptions {
  queue: Queue;
  createWorker: (slotId: number) => Worker;
  minWorkers?: number;
  maxWorkers?: number;
  scaleUpThreshold?: number;
  scaleDownThreshold?: number;
  pollIntervalMs?: number;
  orchestratorUrl?: string;
  serviceName?: string;
  logger?: (message: string, context?: Record<string, unknown>) => void;
  secretToken?: string;
}

export interface AutoScalerSnapshot {
  timestamp: string;
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  workers: number;
  targetWorkers: number;
  lastAction?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class AutoScaler {
  private readonly queue: Queue;
  private readonly createWorker: (slotId: number) => Worker;
  private readonly logger: (message: string, context?: Record<string, unknown>) => void;
  private readonly orchestratorUrl?: string;
  private readonly secretToken?: string;
  private readonly serviceName: string;

  private minWorkers: number;
  private maxWorkers: number;
  private scaleUpThreshold: number;
  private scaleDownThreshold: number;
  private pollIntervalMs: number;

  private workers: Map<number, Worker> = new Map();
  private nextWorkerId = 1;
  private timer?: NodeJS.Timeout;
  private lastSnapshot?: AutoScalerSnapshot;
  private targetWorkers: number;
  private scalingHistory: Array<{
    action: string;
    timestamp: string;
    targetWorkers: number;
    reason?: string;
  }> = [];

  constructor(options: AutoScalerOptions) {
    this.queue = options.queue;
    this.createWorker = options.createWorker;
    this.logger = options.logger ?? (() => undefined);
    this.orchestratorUrl = options.orchestratorUrl;
    this.secretToken = options.secretToken;
    this.serviceName = options.serviceName ?? 'reasoning-gateway';

    this.minWorkers = Math.max(1, options.minWorkers ?? 1);
    this.maxWorkers = Math.max(this.minWorkers, options.maxWorkers ?? Math.max(this.minWorkers, 6));
    this.scaleUpThreshold = Math.max(1, options.scaleUpThreshold ?? 5);
    this.scaleDownThreshold = Math.max(0, options.scaleDownThreshold ?? 1);
    this.pollIntervalMs = Math.max(1000, options.pollIntervalMs ?? 5000);

    this.targetWorkers = this.minWorkers;
  }

  public getState(): AutoScalerSnapshot | undefined {
    return this.lastSnapshot;
  }

  public async start(): Promise<void> {
    if (this.timer) {
      return;
    }

    await this.ensureWorkerCount(this.minWorkers);
    await this.tick();
    this.timer = setInterval(() => {
      void this.tick();
    }, this.pollIntervalMs);
  }

  public async stop(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    for (const worker of this.workers.values()) {
      try {
        await worker.close();
      } catch (error) {
        this.logger('Failed to close worker during shutdown', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    this.workers.clear();
  }

  public async setTargetWorkers(target: number, context?: Record<string, unknown>): Promise<AutoScalerSnapshot> {
    const clamped = clamp(Math.round(target), this.minWorkers, this.maxWorkers);
    this.targetWorkers = clamped;
    const action = await this.ensureWorkerCount(clamped);
    return await this.tick(action, context);
  }

  public async scale(direction: 'up' | 'down', context?: Record<string, unknown>): Promise<AutoScalerSnapshot> {
    const delta = direction === 'up' ? 1 : -1;
    return await this.setTargetWorkers(this.targetWorkers + delta, {
      direction,
      ...context
    });
  }

  private async tick(actionLabel?: string, context?: Record<string, unknown>): Promise<AutoScalerSnapshot> {
    try {
      const counts = await this.queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
      const waiting = counts.waiting ?? 0;
      const active = counts.active ?? 0;
      const delayed = counts.delayed ?? 0;
      const failed = counts.failed ?? 0;
      const completed = counts.completed ?? 0;
      const workers = this.workers.size;

      // Auto adjust target if queue is busy or idle
      if (!actionLabel) {
        if (waiting > this.scaleUpThreshold && workers < this.maxWorkers) {
          this.targetWorkers = clamp(workers + 1, this.minWorkers, this.maxWorkers);
          actionLabel = await this.ensureWorkerCount(this.targetWorkers);
        } else if (waiting <= this.scaleDownThreshold && workers > this.minWorkers) {
          this.targetWorkers = clamp(workers - 1, this.minWorkers, this.maxWorkers);
          actionLabel = await this.ensureWorkerCount(this.targetWorkers);
        } else {
          actionLabel = 'steady';
        }
      }

      const snapshot: AutoScalerSnapshot = {
        timestamp: new Date().toISOString(),
        waiting,
        active,
        delayed,
        failed,
        completed,
        workers,
        targetWorkers: this.targetWorkers,
        lastAction: actionLabel
      };

      this.lastSnapshot = snapshot;

      await this.reportToOrchestrator(snapshot, context);
      return snapshot;
    } catch (error) {
      this.logger('AutoScaler tick failed', {
        error: error instanceof Error ? error.message : String(error)
      });

      const snapshot: AutoScalerSnapshot = {
        timestamp: new Date().toISOString(),
        waiting: 0,
        active: 0,
        delayed: 0,
        failed: 0,
        completed: 0,
        workers: this.workers.size,
        targetWorkers: this.targetWorkers,
        lastAction: 'error'
      };
      this.lastSnapshot = snapshot;
      return snapshot;
    }
  }

  private async ensureWorkerCount(target: number): Promise<string> {
    const current = this.workers.size;

    if (target === current) {
      return 'steady';
    }

    if (target > current) {
      while (this.workers.size < target) {
        this.spawnWorker();
      }
      this.logger('Scaled workers up', { target });
      return `scaled_up_to_${target}`;
    }

    const ids = Array.from(this.workers.keys()).sort((a, b) => b - a);
    for (const id of ids) {
      if (this.workers.size <= target) {
        break;
      }
      await this.removeWorker(id);
    }
    this.logger('Scaled workers down', { target });
    return `scaled_down_to_${target}`;
  }

  private spawnWorker(): void {
    const id = this.nextWorkerId++;
    const worker = this.createWorker(id);
    this.workers.set(id, worker);
  }

  private async removeWorker(id: number): Promise<void> {
    const worker = this.workers.get(id);
    if (!worker) {
      return;
    }

    try {
      await worker.close();
    } catch (error) {
      this.logger('Failed to close worker', {
        workerId: id,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    this.workers.delete(id);
  }

  private async reportToOrchestrator(snapshot: AutoScalerSnapshot, context?: Record<string, unknown>): Promise<void> {
    if (!this.orchestratorUrl) {
      return;
    }

    const payload = {
      source: this.serviceName,
      snapshot,
      context: context ?? {},
      timestamp: snapshot.timestamp
    };

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.secretToken) {
        headers['x-orchestration-token'] = this.secretToken;
      }

      const endpoint = this.orchestratorUrl.replace(/\/?$/, '') + '/api/orchestration/queue';
      await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    } catch (error) {
      this.logger('Failed to push autoscaler snapshot to orchestration service', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Evaluate scaling decision based on queue metrics (PO1 Day 2)
   * Factors: queue depth + average latency
   */
  public async evaluateScaling(): Promise<{
    action: 'scale_up' | 'scale_down' | 'no_change' | 'error';
    targetWorkers: number;
    reason: string;
    metrics: {
      queueDepth: number;
      avgLatency: number;
      currentWorkers: number;
    };
    scalingFactor: number;
    error?: string;
  }> {
    try {
      const counts = await this.queue.getJobCounts('waiting', 'active');
      const queueDepth = (counts.waiting ?? 0) + (counts.active ?? 0);
      const currentWorkers = this.workers.size;

      // Get queue metrics (latency)
      const queueMetrics = (this.queue as any).getMetrics?.() || { latency: 0, p95Latency: 0 };
      const avgLatency = queueMetrics.latency || 0;

      // Calculate scaling factor based on depth + latency
      // High depth or high latency = higher scaling factor
      const depthFactor = queueDepth / this.scaleUpThreshold;
      const latencyFactor = avgLatency > 500 ? avgLatency / 500 : 1;
      const scalingFactor = Math.max(depthFactor, latencyFactor);

      let action: 'scale_up' | 'scale_down' | 'no_change' = 'no_change';
      let targetWorkers = currentWorkers;
      let reason = 'Queue stable';

      // Scale up logic
      if (queueDepth > this.scaleUpThreshold && currentWorkers < this.maxWorkers) {
        action = 'scale_up';
        targetWorkers = Math.min(
          this.maxWorkers,
          Math.ceil(currentWorkers * scalingFactor)
        );
        reason = `Queue depth ${queueDepth} > threshold ${this.scaleUpThreshold}, avg latency ${avgLatency}ms`;

        // Record scaling history
        this.scalingHistory.push({
          action,
          timestamp: new Date().toISOString(),
          targetWorkers,
          reason
        });
      }
      // Scale down logic
      else if (queueDepth <= this.scaleDownThreshold && currentWorkers > this.minWorkers) {
        action = 'scale_down';
        targetWorkers = Math.max(this.minWorkers, currentWorkers - 1);
        reason = `Queue depth low (${queueDepth}), can reduce workers`;

        // Record scaling history
        this.scalingHistory.push({
          action,
          timestamp: new Date().toISOString(),
          targetWorkers,
          reason
        });
      }

      return {
        action,
        targetWorkers,
        reason,
        metrics: {
          queueDepth,
          avgLatency,
          currentWorkers
        },
        scalingFactor
      };
    } catch (error) {
      return {
        action: 'error',
        targetWorkers: this.workers.size,
        reason: 'Failed to evaluate scaling',
        metrics: {
          queueDepth: 0,
          avgLatency: 0,
          currentWorkers: this.workers.size
        },
        scalingFactor: 1,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Set worker count directly (for testing)
   */
  public async setWorkerCount(count: number): Promise<void> {
    if (count < this.minWorkers || count > this.maxWorkers || isNaN(count)) {
      throw new Error(`Invalid worker count: ${count}. Must be between ${this.minWorkers} and ${this.maxWorkers}`);
    }

    await this.ensureWorkerCount(count);
  }

  /**
   * Get current autoscaler metrics
   */
  public async getMetrics(): Promise<{
    currentWorkers: number;
    minWorkers: number;
    maxWorkers: number;
    targetWorkers: number;
    queueDepth: number;
    avgLatency: number;
  }> {
    const counts = await this.queue.getJobCounts('waiting', 'active');
    const queueDepth = (counts.waiting ?? 0) + (counts.active ?? 0);
    const queueMetrics = (this.queue as any).getMetrics?.() || { latency: 0 };

    return {
      currentWorkers: this.workers.size,
      minWorkers: this.minWorkers,
      maxWorkers: this.maxWorkers,
      targetWorkers: this.targetWorkers,
      queueDepth,
      avgLatency: queueMetrics.latency || 0
    };
  }

  /**
   * Get scaling history
   */
  public async getScalingHistory(): Promise<Array<{
    action: string;
    timestamp: string;
    targetWorkers: number;
    reason?: string;
  }>> {
    return [...this.scalingHistory];
  }
}
