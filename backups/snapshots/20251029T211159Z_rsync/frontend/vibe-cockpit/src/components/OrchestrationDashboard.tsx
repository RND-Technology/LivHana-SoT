import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AgentState = {
  name: string;
  status: string;
  priority?: number;
  dependencies?: string[];
  rpmCsf?: string;
  port?: number;
  pid?: number;
  lastSeen?: string;
};

type ServiceState = {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  url: string;
  latencyMs?: number;
  lastChecked?: string;
  lastSuccess?: string;
  error?: string;
};

type QueueState = {
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  workers: number;
  target: number;
  lastAction?: string;
  lastUpdate?: string;
};

type VoiceRecord = {
  command: string;
  status: string;
  response?: string;
  requestedBy?: string;
  timestamp: string;
};

type SystemState = {
  load: number[];
  uptime: number;
  hostname: string;
};

type OrchestrationState = {
  lastUpdated?: string;
  agents: Record<string, AgentState>;
  services: Record<string, ServiceState>;
  queue: QueueState;
  voice: {
    lastCommand?: string;
    lastCommandAt?: string;
    history: VoiceRecord[];
  };
  system: SystemState;
  alerts: string[];
};

type OrchestrationMessage = {
  type: string;
  payload: any;
  timestamp?: string;
};

const DEFAULT_HTTP_BASE = (import.meta as any)?.env?.VITE_ORCHESTRATION_HTTP_URL || `${window.location.protocol}//${window.location.hostname}:4010`;
const DEFAULT_WS_URL = (import.meta as any)?.env?.VITE_ORCHESTRATION_WS_URL || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:4010/ws`;

function formatTimestamp(timestamp?: string) {
  if (!timestamp) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'running':
    case 'healthy':
    case 'accepted':
      return '#136f63';
    case 'degraded':
    case 'warning':
      return '#b68d40';
    case 'down':
    case 'failed':
    case 'rejected':
      return '#a4161a';
    case 'restarting':
      return '#386641';
    default:
      return '#343a40';
  }
}

function Badge({ text, tone }: { text: string; tone: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 8px',
        borderRadius: '999px',
        background: `${tone}20`,
        color: tone,
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.03em'
      }}
    >
      {text}
    </span>
  );
}

function mergeState(previous: OrchestrationState | null, message: OrchestrationMessage): OrchestrationState {
  if (message.type === 'state:init' || !previous) {
    return message.payload as OrchestrationState;
  }

  switch (message.type) {
    case 'queue:update':
    case 'queue:tick':
    case 'queue:target': {
      return {
        ...previous,
        queue: {
          ...previous.queue,
          ...message.payload
        },
        lastUpdated: message.timestamp ?? previous.lastUpdated
      };
    }
    case 'agents:update': {
      return {
        ...previous,
        agents: { ...previous.agents, ...(message.payload || {}) },
        lastUpdated: message.timestamp ?? previous.lastUpdated
      };
    }
    case 'agents:restart': {
      const agentName = message.payload?.name;
      if (!agentName) return previous;
      const agent = previous.agents[agentName] || { name: agentName, status: 'restarting' };
      return {
        ...previous,
        agents: {
          ...previous.agents,
          [agentName]: {
            ...agent,
            status: 'restarting',
            lastSeen: message.payload?.timestamp || agent.lastSeen
          }
        }
      };
    }
    case 'services:update': {
      return {
        ...previous,
        services: {
          ...previous.services,
          ...(message.payload || {})
        },
        lastUpdated: message.timestamp ?? previous.lastUpdated
      };
    }
    case 'system:update': {
      return {
        ...previous,
        system: {
          ...previous.system,
          ...(message.payload || {})
        }
      };
    }
    case 'voice:command': {
      const history = [message.payload, ...previous.voice.history];
      return {
        ...previous,
        voice: {
          lastCommand: message.payload?.command || previous.voice.lastCommand,
          lastCommandAt: message.payload?.timestamp || previous.voice.lastCommandAt,
          history: history.slice(0, 20)
        }
      };
    }
    default:
      return previous;
  }
}

export default function OrchestrationDashboard() {
  const [state, setState] = useState<OrchestrationState | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);

  const httpBase = DEFAULT_HTTP_BASE.replace(/\/$/, '');
  const wsUrl = DEFAULT_WS_URL;

  const fetchSnapshot = useCallback(async () => {
    try {
      const response = await fetch(`${httpBase}/api/orchestration/state`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: OrchestrationState = await response.json();
      setState(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`Failed to load orchestration state: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }, [httpBase]);

  useEffect(() => {
    void fetchSnapshot();
  }, [fetchSnapshot]);

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      setConnectionStatus('connecting');
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus('open');
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as OrchestrationMessage;
          setState((prev) => mergeState(prev, message));
        } catch (error) {
          setErrorMessage(`Failed to parse orchestration message: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
      };

      socket.onerror = (event) => {
        console.error('Orchestration WebSocket error', event);
        setConnectionStatus('error');
        setErrorMessage('WebSocket connection error - attempting to reconnect.');
      };

      socket.onclose = () => {
        setConnectionStatus('closed');
        if (reconnectTimer.current) {
          window.clearTimeout(reconnectTimer.current);
        }
        reconnectTimer.current = window.setTimeout(() => {
          connect();
        }, 4000);
      };
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(`Unable to connect to orchestration WebSocket: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }, [wsUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimer.current) {
        window.clearTimeout(reconnectTimer.current);
      }
    };
  }, [connect]);

  const agentList = useMemo(() => {
    if (!state?.agents) return [];
    return Object.values(state.agents).sort((a, b) => {
      const priorityDiff = (a.priority || 0) - (b.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.name.localeCompare(b.name);
    });
  }, [state?.agents]);

  const serviceList = useMemo(() => {
    if (!state?.services) return [];
    return Object.values(state.services).sort((a, b) => a.name.localeCompare(b.name));
  }, [state?.services]);

  return (
    <section
      aria-label="Autonomous orchestration dashboard"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: '#0b172a',
        color: '#f5f5f5',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #17314f',
        boxShadow: '0 10px 40px rgba(11, 23, 42, 0.4)'
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Agent Orchestration Control</h2>
          <Badge text={connectionStatus.toUpperCase()} tone={statusColor(connectionStatus)} />
        </div>
        <div style={{ fontSize: '0.85rem', color: '#d0d8e2' }}>
          <span>Last update: {formatTimestamp(state?.lastUpdated)}</span>
          <span style={{ marginLeft: '12px' }}>Queue target: {state?.queue?.target ?? '—'} workers</span>
          <span style={{ marginLeft: '12px' }}>System: {state?.system?.hostname ?? '—'}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => void fetchSnapshot()}
            style={{
              background: '#1f4068',
              color: '#f5f5f5',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Refresh Snapshot
          </button>
          {errorMessage && (
            <span style={{ color: '#ffb703', fontSize: '0.8rem' }}>{errorMessage}</span>
          )}
        </div>
      </header>

      <section
        aria-label="Queue overview"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px'
        }}
      >
        {[
          { label: 'Waiting', value: state?.queue?.waiting ?? 0 },
          { label: 'Active', value: state?.queue?.active ?? 0 },
          { label: 'Delayed', value: state?.queue?.delayed ?? 0 },
          { label: 'Failed', value: state?.queue?.failed ?? 0 },
          { label: 'Completed (1h)', value: state?.queue?.completed ?? 0 },
          { label: 'Workers', value: `${state?.queue?.workers ?? 0}/${state?.queue?.target ?? 0}` }
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: '#10233d',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #193a5c'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#8aa5c4' }}>{label}</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </section>

      <section
        aria-label="Agent readiness"
        style={{
          background: '#10233d',
          borderRadius: '12px',
          border: '1px solid #193a5c',
          padding: '16px'
        }}
      >
        <h3 style={{ marginTop: 0 }}>Agents</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#8aa5c4' }}>
              <th style={{ padding: '8px 4px' }}>Name</th>
              <th style={{ padding: '8px 4px' }}>Status</th>
              <th style={{ padding: '8px 4px' }}>Priority</th>
              <th style={{ padding: '8px 4px' }}>Dependencies</th>
              <th style={{ padding: '8px 4px' }}>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {agentList.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '12px', color: '#8aa5c4' }}>No agents registered yet.</td>
              </tr>
            ) : (
              agentList.map((agent) => (
                <tr key={agent.name} style={{ borderTop: '1px solid #193a5c' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>{agent.name}</td>
                  <td style={{ padding: '8px 4px' }}>
                    <Badge text={agent.status} tone={statusColor(agent.status)} />
                  </td>
                  <td style={{ padding: '8px 4px' }}>{agent.priority ?? '—'}</td>
                  <td style={{ padding: '8px 4px', color: '#8aa5c4' }}>{agent.dependencies?.join(', ') || '—'}</td>
                  <td style={{ padding: '8px 4px', color: '#8aa5c4' }}>{formatTimestamp(agent.lastSeen)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section
        aria-label="Service health"
        style={{
          background: '#10233d',
          borderRadius: '12px',
          border: '1px solid #193a5c',
          padding: '16px'
        }}
      >
        <h3 style={{ marginTop: 0 }}>Platform Health</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#8aa5c4' }}>
              <th style={{ padding: '8px 4px' }}>Service</th>
              <th style={{ padding: '8px 4px' }}>Status</th>
              <th style={{ padding: '8px 4px' }}>Latency</th>
              <th style={{ padding: '8px 4px' }}>Last Checked</th>
              <th style={{ padding: '8px 4px' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {serviceList.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '12px', color: '#8aa5c4' }}>No health targets configured.</td>
              </tr>
            ) : (
              serviceList.map((service) => (
                <tr key={service.name} style={{ borderTop: '1px solid #193a5c' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>{service.name}</td>
                  <td style={{ padding: '8px 4px' }}>
                    <Badge text={service.status} tone={statusColor(service.status)} />
                  </td>
                  <td style={{ padding: '8px 4px' }}>{service.latencyMs ? `${service.latencyMs} ms` : '—'}</td>
                  <td style={{ padding: '8px 4px', color: '#8aa5c4' }}>{formatTimestamp(service.lastChecked)}</td>
                  <td style={{ padding: '8px 4px', color: '#8aa5c4' }}>{service.error || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section
        aria-label="Voice control history"
        style={{
          background: '#10233d',
          borderRadius: '12px',
          border: '1px solid #193a5c',
          padding: '16px'
        }}
      >
        <h3 style={{ marginTop: 0 }}>Last Voice Commands</h3>
        <ol style={{ margin: 0, paddingInlineStart: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(state?.voice?.history || []).slice(0, 6).map((record, index) => (
            <li key={`${record.timestamp}-${index}`} style={{ color: '#d0d8e2' }}>
              <span style={{ fontWeight: 600 }}>{formatTimestamp(record.timestamp)}:</span>
              <span style={{ marginLeft: '6px' }}>
                "{record.command}" → {record.response || record.status}
              </span>
            </li>
          ))}
          {(state?.voice?.history || []).length === 0 && (
            <li style={{ color: '#8aa5c4' }}>No voice commands recorded yet.</li>
          )}
        </ol>
      </section>
    </section>
  );
}

