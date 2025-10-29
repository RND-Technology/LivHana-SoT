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
}
