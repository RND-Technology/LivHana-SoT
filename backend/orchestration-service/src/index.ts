import http from 'http';
import path from 'path';
import os from 'os';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import type { RawData } from 'ws';
import { Queue } from 'bullmq';
import { readFile } from 'fs/promises';

interface AgentRegistryEntry {
  status?: string;
  pid?: number | null;
  port?: number | null;
  rpm_csf?: string;
  self_heal?: boolean;
  self_improve?: boolean;
  priority?: number;
  dependencies?: string[];
}

interface AgentState {
  name: string;
  status: string;
  port?: number | null;
  pid?: number | null;
  rpmCsf?: string;
  priority?: number;
  dependencies?: string[];
  lastSeen: string;
}

interface ServiceHealthTarget {
  name: string;
  url: string;
}

interface ServiceState {
  name: string;
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs?: number;
  lastChecked: string;
  lastSuccess?: string;
  error?: string;
}

interface VoiceCommandRecord {
  command: string;
  status: 'accepted' | 'rejected' | 'failed' | 'queued';
  response?: string;
  requestedBy?: string;
  timestamp: string;
}

interface QueueState {
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  workers: number;
  target: number;
  lastAction?: string;
  lastUpdate?: string;
  source?: string;
}

interface OrchestrationState {
  lastUpdated: string;
  agents: Record<string, AgentState>;
  services: Record<string, ServiceState>;
  queue: QueueState;
  voice: {
    lastCommand?: string;
    lastCommandAt?: string;
    history: VoiceCommandRecord[];
  };
  system: {
    load: number[];
    uptime: number;
    hostname: string;
  };
  alerts: string[];
}

interface QueueSnapshotPayload {
  source?: string;
  snapshot: {
    timestamp?: string;
    waiting?: number;
    active?: number;
    delayed?: number;
    failed?: number;
    completed?: number;
    workers?: number;
    targetWorkers?: number;
    lastAction?: string;
  };
  context?: Record<string, unknown>;
}

interface ScaleForwardResult {
  forwarded: boolean;
  status?: number;
  body?: unknown;
  error?: string;
}

const PORT = parseInt(process.env.ORCHESTRATION_PORT ?? '4010', 10);
const MIN_WORKERS = Math.max(1, parseInt(process.env.REASONING_MIN_WORKERS ?? '1', 10));
const MAX_WORKERS = Math.max(MIN_WORKERS, parseInt(process.env.REASONING_MAX_WORKERS ?? '6', 10));
const AGENT_REGISTRY_PATH = path.resolve(process.env.AGENT_REGISTRY_PATH ?? 'tmp/agent_status/shared/agent_registry.json');
const HEALTH_TARGETS = (process.env.ORCHESTRATION_HEALTH_TARGETS ?? 'voice-service:http://localhost:8080/health,reasoning-gateway:http://localhost:4002/health')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map<ServiceHealthTarget>((entry) => {
    const [name, url] = entry.split(':');
    return {
      name: name.trim(),
      url: url?.startsWith('http') ? url.trim() : `http://${url?.trim()}`
    };
  });

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB ?? '0', 10)
};

const QUEUE_NAME = process.env.REASONING_QUEUE_NAME ?? 'voice-mode-reasoning-jobs';
const POLL_INTERVAL_MS = Math.max(2000, parseInt(process.env.ORCHESTRATION_POLL_INTERVAL_MS ?? '4000', 10));
const SERVICE_HEALTH_INTERVAL_MS = Math.max(5000, parseInt(process.env.ORCHESTRATION_HEALTH_INTERVAL_MS ?? '15000', 10));
const VOICE_HISTORY_LIMIT = Math.max(10, parseInt(process.env.ORCHESTRATION_VOICE_HISTORY_LIMIT ?? '100', 10));
const REASONING_GATEWAY_BASE_URL = process.env.REASONING_GATEWAY_BASE_URL ?? 'http://localhost:4002';
const REASONING_GATEWAY_CONTROL_URL = process.env.REASONING_GATEWAY_CONTROL_URL ?? `${REASONING_GATEWAY_BASE_URL.replace(/\/?$/, '')}/internal/worker-scale`;
const CONTROL_SECRET = process.env.ORCHESTRATION_CONTROL_SECRET;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const sockets = new Set<WebSocket>();

const defaultQueueState: QueueState = {
  waiting: 0,
  active: 0,
  delayed: 0,
  failed: 0,
  completed: 0,
  workers: MIN_WORKERS,
  target: MIN_WORKERS
};

const state: OrchestrationState = {
  lastUpdated: new Date().toISOString(),
  agents: {},
  services: {},
  queue: defaultQueueState,
  voice: {
    history: []
  },
  system: {
    load: os.loadavg(),
    uptime: os.uptime(),
    hostname: os.hostname()
  },
  alerts: []
};

let queue: Queue | undefined;

try {
  queue = new Queue(QUEUE_NAME, { connection: REDIS_CONFIG });
} catch (error) {
  log('Queue initialization failed', { error: error instanceof Error ? error.message : String(error) });
}

app.use(helmet());
app.use(cors({
  origin: [
    'https://reggieanddro.com',
    'https://voice.reggieanddro.com',
    'https://brain.reggieanddro.com',
    'http://localhost:3000',
    'http://localhost:4010',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

function log(message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  if (context) {
    console.log(`[orchestration] ${message}`, context);
  } else {
    console.log(`[orchestration] ${message}`);
  }
}

function broadcast(type: string, payload: unknown) {
  const data = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  for (const socket of sockets) {
    try {
      socket.send(data);
    } catch (error) {
      log('Failed to broadcast to websocket client', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

function updateSystemMetrics() {
  state.system.load = os.loadavg();
  state.system.uptime = os.uptime();
  state.system.hostname = os.hostname();
  state.lastUpdated = new Date().toISOString();
}

async function refreshAgentRegistry() {
  try {
    const raw = await readFile(AGENT_REGISTRY_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as { agents?: Record<string, AgentRegistryEntry>; last_update?: string };
    const agents = parsed.agents ?? {};
    const now = new Date().toISOString();

    for (const [name, details] of Object.entries(agents)) {
      state.agents[name] = {
        name,
        status: details.status ?? 'unknown',
        port: details.port ?? undefined,
        pid: details.pid ?? undefined,
        rpmCsf: details.rpm_csf,
        priority: details.priority ?? undefined,
        dependencies: details.dependencies ?? [],
        lastSeen: parsed.last_update ?? now
      };
    }

    state.lastUpdated = parsed.last_update ?? now;
    broadcast('agents:update', state.agents);
  } catch (error) {
    log('Agent registry refresh failed', {
      path: AGENT_REGISTRY_PATH,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

async function pollQueueCounts() {
  if (!queue) {
    return;
  }
  try {
    const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
    state.queue = {
      ...state.queue,
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
      lastUpdate: new Date().toISOString(),
      lastAction: state.queue.lastAction ?? 'poll'
    };
    state.lastUpdated = state.queue.lastUpdate ?? state.lastUpdated;
    broadcast('queue:tick', state.queue);
  } catch (error) {
    log('Failed to poll queue counts', {
      queue: QUEUE_NAME,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

async function pollServiceHealth() {
  const now = new Date().toISOString();
  await Promise.all(
    HEALTH_TARGETS.map(async (target) => {
      const started = Date.now();
      let status: ServiceState['status'] = 'down';
      let latencyMs: number | undefined;
      let errorMessage: string | undefined;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(target.url, { signal: controller.signal });
        latencyMs = Date.now() - started;
        status = response.ok ? 'healthy' : 'degraded';
        if (!response.ok) {
          errorMessage = `${response.status} ${response.statusText}`;
        }
        state.services[target.name] = {
          name: target.name,
          url: target.url,
          status,
          latencyMs,
          lastChecked: now,
          lastSuccess: response.ok ? now : state.services[target.name]?.lastSuccess,
          error: errorMessage
        };
      } catch (error) {
        clearTimeout(timeout);
        latencyMs = Date.now() - started;
        errorMessage = error instanceof Error ? error.message : String(error);
        state.services[target.name] = {
          name: target.name,
          url: target.url,
          status: 'down',
          latencyMs,
          lastChecked: now,
          lastSuccess: state.services[target.name]?.lastSuccess,
          error: errorMessage
        };
      }
      clearTimeout(timeout);
    })
  );

  state.lastUpdated = now;
  broadcast('services:update', state.services);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

async function forwardScaleCommand(target: number, direction?: string, requestedBy?: string, reason?: string): Promise<ScaleForwardResult> {
  if (!REASONING_GATEWAY_CONTROL_URL) {
    return { forwarded: false };
  }

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (CONTROL_SECRET) {
      headers['x-orchestration-token'] = CONTROL_SECRET;
    }

    const body = {
      target,
      direction,
      requestedBy: requestedBy ?? 'orchestration-service',
      reason,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(REASONING_GATEWAY_CONTROL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    return {
      forwarded: true,
      status: response.status,
      body: payload
    };
  } catch (error) {
    return {
      forwarded: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

app.get('/health', (_req: Request, res: Response) => {
  updateSystemMetrics();
  res.json({
    status: 'ok',
    service: 'orchestration-service',
    timestamp: new Date().toISOString(),
    queue: state.queue,
    agents: Object.keys(state.agents),
    services: Object.keys(state.services)
  });
});

app.get('/api/orchestration/state', (_req: Request, res: Response) => {
  updateSystemMetrics();
  res.json(state);
});

app.post('/api/orchestration/queue', (req: Request, res: Response) => {
  const payload = req.body as QueueSnapshotPayload;
  if (!payload || !payload.snapshot) {
    return res.status(400).json({ success: false, error: 'snapshot payload required' });
  }

  const snapshot = payload.snapshot;
  const now = snapshot.timestamp ?? new Date().toISOString();

  state.queue = {
    ...state.queue,
    waiting: snapshot.waiting ?? state.queue.waiting,
    active: snapshot.active ?? state.queue.active,
    delayed: snapshot.delayed ?? state.queue.delayed,
    failed: snapshot.failed ?? state.queue.failed,
    completed: snapshot.completed ?? state.queue.completed,
    workers: typeof snapshot.workers === 'number' ? snapshot.workers : state.queue.workers,
    target: typeof snapshot.targetWorkers === 'number' ? clamp(snapshot.targetWorkers, MIN_WORKERS, MAX_WORKERS) : state.queue.target,
    lastAction: snapshot.lastAction ?? state.queue.lastAction,
    lastUpdate: now,
    source: payload.source ?? state.queue.source
  };

  state.lastUpdated = now;
  broadcast('queue:update', state.queue);
  res.json({ success: true, queue: state.queue });
});

app.post('/api/orchestration/voice-command', (req: Request, res: Response) => {
  const { command, status = 'accepted', response: responseText, requestedBy } = req.body ?? {};
  if (!command || typeof command !== 'string') {
    return res.status(400).json({ success: false, error: 'command is required' });
  }

  const record: VoiceCommandRecord = {
    command,
    status,
    response: responseText,
    requestedBy,
    timestamp: new Date().toISOString()
  };

  state.voice.lastCommand = command;
  state.voice.lastCommandAt = record.timestamp;
  state.voice.history.unshift(record);
  state.voice.history = state.voice.history.slice(0, VOICE_HISTORY_LIMIT);
  state.lastUpdated = record.timestamp;

  broadcast('voice:command', record);
  res.json({ success: true, record });
});

app.post('/api/orchestration/scale', async (req: Request, res: Response) => {
  const { direction, target, requestedBy, reason } = req.body ?? {};
  if (typeof target !== 'number' && direction !== 'up' && direction !== 'down') {
    return res.status(400).json({ success: false, error: 'direction or target required' });
  }

  let desired = state.queue.target;
  if (typeof target === 'number' && !Number.isNaN(target)) {
    desired = clamp(target, MIN_WORKERS, MAX_WORKERS);
  } else if (direction === 'up') {
    desired = clamp(state.queue.target + 1, MIN_WORKERS, MAX_WORKERS);
  } else if (direction === 'down') {
    desired = clamp(state.queue.target - 1, MIN_WORKERS, MAX_WORKERS);
  }

  const now = new Date().toISOString();
  state.queue.target = desired;
  state.queue.lastAction = `manual_${direction ?? 'set'}`;
  state.queue.lastUpdate = now;
  state.lastUpdated = now;

  broadcast('queue:target', {
    desired,
    requestedBy,
    reason,
    direction: direction ?? 'set',
    timestamp: now
  });

  const forward = await forwardScaleCommand(desired, direction, requestedBy, reason);
  res.json({
    success: true,
    desired,
    min: MIN_WORKERS,
    max: MAX_WORKERS,
    forwarded: forward.forwarded,
    statusCode: forward.status,
    response: forward.body,
    error: forward.error
  });
});

app.post('/api/orchestration/agents/:name/status', (req: Request, res: Response) => {
  const name = req.params.name;
  const { status, port, pid, priority, dependencies } = req.body ?? {};
  if (!status) {
    return res.status(400).json({ success: false, error: 'status is required' });
  }

  const now = new Date().toISOString();
  state.agents[name] = {
    name,
    status,
    port,
    pid,
    priority,
    dependencies,
    rpmCsf: state.agents[name]?.rpmCsf,
    lastSeen: now
  };

  state.lastUpdated = now;
  broadcast('agents:update', state.agents);
  res.json({ success: true, agent: state.agents[name] });
});

app.post('/api/orchestration/agents/:name/restart', (req: Request, res: Response) => {
  const name = req.params.name;
  const requestedBy = req.body?.requestedBy;
  const now = new Date().toISOString();

  const existing = state.agents[name];
  state.agents[name] = {
    name,
    status: 'restarting',
    port: existing?.port,
    pid: existing?.pid,
    priority: existing?.priority,
    dependencies: existing?.dependencies ?? [],
    rpmCsf: existing?.rpmCsf,
    lastSeen: now
  };

  state.lastUpdated = now;
  broadcast('agents:restart', {
    name,
    requestedBy,
    timestamp: now
  });

  res.json({
    success: true,
    agent: state.agents[name],
    message: `Restart signal acknowledged for ${name}`
  });
});

app.post('/api/orchestration/services/:name/status', (req: Request, res: Response) => {
  const name = req.params.name;
  const { status, url, latencyMs, error } = req.body ?? {};

  if (!status) {
    return res.status(400).json({ success: false, error: 'status is required' });
  }

  const now = new Date().toISOString();
  state.services[name] = {
    name,
    url: url ?? state.services[name]?.url ?? '',
    status,
    latencyMs,
    error,
    lastChecked: now,
    lastSuccess: status === 'healthy' ? now : state.services[name]?.lastSuccess
  };

  state.lastUpdated = now;
  broadcast('services:update', state.services);
  res.json({ success: true, service: state.services[name] });
});

wss.on('connection', (socket: WebSocket) => {
  sockets.add(socket);
  try {
    socket.send(JSON.stringify({ type: 'state:init', payload: state }));
  } catch (error) {
    log('Failed to send initial state to websocket client', {
      error: error instanceof Error ? error.message : String(error)
    });
  }

  socket.on('message', (raw: RawData) => {
    try {
      const parsed = JSON.parse(raw.toString());
      if (parsed?.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch (error) {
      log('Failed to process websocket message', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  socket.on('close', () => {
    sockets.delete(socket);
  });

  socket.on('error', (error: Error) => {
    log('Websocket client error', {
      error: error instanceof Error ? error.message : String(error)
    });
  });
});

const agentRegistryTimer = setInterval(() => {
  void refreshAgentRegistry();
}, Math.max(5000, parseInt(process.env.ORCHESTRATION_AGENT_REFRESH_MS ?? '7000', 10)));

const queueTimer = setInterval(() => {
  void pollQueueCounts();
}, POLL_INTERVAL_MS);

const serviceTimer = setInterval(() => {
  void pollServiceHealth();
}, SERVICE_HEALTH_INTERVAL_MS);

const systemTimer = setInterval(() => {
  updateSystemMetrics();
  broadcast('system:update', state.system);
}, Math.max(10000, parseInt(process.env.ORCHESTRATION_SYSTEM_INTERVAL_MS ?? '15000', 10)));

process.on('SIGTERM', async () => {
  clearInterval(agentRegistryTimer);
  clearInterval(queueTimer);
  clearInterval(serviceTimer);
  clearInterval(systemTimer);
  if (queue) {
    await queue.close();
  }
  for (const socket of sockets) {
    socket.close();
  }
});

server.listen(PORT, () => {
  log('Orchestration service online', {
    port: PORT,
    queue: QUEUE_NAME,
    redisHost: REDIS_CONFIG.host,
    minWorkers: MIN_WORKERS,
    maxWorkers: MAX_WORKERS
  });
  void refreshAgentRegistry();
  void pollQueueCounts();
  void pollServiceHealth();
});
