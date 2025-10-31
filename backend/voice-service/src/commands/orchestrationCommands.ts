export interface OrchestrationCommandOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  logger?: (message: string, context?: Record<string, unknown>) => void;
  requestedBy?: string;
}

export interface OrchestrationCommandResult {
  success: boolean;
  message: string;
  canonicalCommand: string;
  details?: Record<string, unknown>;
  telemetry?: Record<string, unknown>;
}

interface CommandHandlerDefinition {
  name: string;
  matcher: (input: string) => boolean | RegExpMatchArray | null;
  execute: (input: string, options: Required<Pick<OrchestrationCommandOptions, 'baseUrl' | 'fetchImpl' | 'logger' | 'requestedBy'>>) => Promise<OrchestrationCommandResult>;
}

const DEFAULT_BASE_URL = process.env.ORCHESTRATION_SERVICE_URL || 'http://localhost:4010';
const SCALE_ENDPOINT = '/api/orchestration/scale';
const STATE_ENDPOINT = '/api/orchestration/state';
const VOICE_ENDPOINT = '/api/orchestration/voice-command';
const RESTART_ENDPOINT = (agent: string) => `/api/orchestration/agents/${agent}/restart`;

function normalize(input: string): string {
  return input.trim();
}

function createLogger(options: Required<Pick<OrchestrationCommandOptions, 'logger'>>) {
  return (message: string, context?: Record<string, unknown>) => {
    options.logger(message, context);
  };
}

async function postJson(fetchImpl: typeof fetch, url: string, body: unknown) {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

const commandHandlers: CommandHandlerDefinition[] = [
  {
    name: 'status',
    matcher: (input) => /(orchestration|dashboard|agent|queue).*status/.test(input) || /show .*status/.test(input) || /health/.test(input),
    execute: async (_input, { baseUrl, fetchImpl }) => {
      const response = await fetchImpl(`${baseUrl}${STATE_ENDPOINT}`);
      const state = await response.json();
      const agentCount = Object.keys(state.agents || {}).length;
      const runningAgents = Object.values(state.agents || {}).filter((agent: any) => agent.status === 'running').length;
      const message = `Dashboard live. Agents running: ${runningAgents}/${agentCount}. Queue waiting: ${state.queue?.waiting ?? 0}. Active workers: ${state.queue?.workers ?? 0}/${state.queue?.target ?? 0}.`;
      return {
        success: true,
        message,
        canonicalCommand: 'status',
        details: state
      };
    }
  },
  {
    name: 'set-voice-mode',
    matcher: (input) => input.match(/(set|switch|change|enable|use)\s+(?:voice\s+)?mode\s+(?:to\s+)?(atlas|comt|default|standard)/i),
    execute: async (input, { baseUrl, fetchImpl, logger, requestedBy }) => {
      const match = input.match(/(atlas|comt|default|standard)/i);
      const mode = match ? match[1].toLowerCase() : 'default';

      const { response, data } = await postJson(fetchImpl, `${baseUrl}${VOICE_ENDPOINT}`, {
        command: 'set_voice_mode',
        payload: { mode },
        requestedBy,
      });

      const message = response.ok
        ? `Voice mode set to ${mode}.`
        : `Failed to set voice mode.`;

      logger('Voice command executed: set voice mode', { status: response.status, mode });

      return {
        success: response.ok,
        message,
        canonicalCommand: 'set_voice_mode',
        details: data,
        telemetry: { status: response.status, mode },
      };
    },
  },
  {
    name: 'scale-up',
    matcher: (input) => /(scale|add|increase).*(workers?|capacity|power|throughput)/.test(input) && /up|more|increase/.test(input),
    execute: async (_input, { baseUrl, fetchImpl, logger, requestedBy }) => {
      const { response, data } = await postJson(fetchImpl, `${baseUrl}${SCALE_ENDPOINT}`, {
        direction: 'up',
        requestedBy
      });
      const message = `Scaling up orchestration queue to target ${data?.desired ?? 'N/A'} workers.`;
      logger('Voice command executed: scale up', { status: response.status });
      return {
        success: response.ok,
        message,
        canonicalCommand: 'scale_up',
        details: data,
        telemetry: { status: response.status }
      };
    }
  },
  {
    name: 'scale-down',
    matcher: (input) => /(scale|decrease|reduce|drop).*(workers?|capacity|power)/.test(input) && /(down|less)/.test(input),
    execute: async (_input, { baseUrl, fetchImpl, logger, requestedBy }) => {
      const { response, data } = await postJson(fetchImpl, `${baseUrl}${SCALE_ENDPOINT}`, {
        direction: 'down',
        requestedBy
      });
      const message = `Scaling down orchestration queue to target ${data?.desired ?? 'N/A'} workers.`;
      logger('Voice command executed: scale down', { status: response.status });
      return {
        success: response.ok,
        message,
        canonicalCommand: 'scale_down',
        details: data,
        telemetry: { status: response.status }
      };
    }
  },
  {
    name: 'set-workers',
    matcher: (input) => input.match(/(?:set|target|allocate|fix)\s+(?:the\s+)?(?:workers?|concurrency|slots)\s+(?:to|at)\s+(\d{1,2})/i),
    execute: async (input, { baseUrl, fetchImpl, logger, requestedBy }) => {
      const match = input.match(/(\d{1,2})/);
      const desired = match ? parseInt(match[1], 10) : undefined;
      if (!desired || Number.isNaN(desired)) {
        return {
          success: false,
          message: 'I could not determine the desired worker count.',
          canonicalCommand: 'set_workers_invalid'
        };
      }
      const { response, data } = await postJson(fetchImpl, `${baseUrl}${SCALE_ENDPOINT}`, {
        target: desired,
        requestedBy
      });
      const message = response.ok
        ? `Auto-scaler target set to ${data?.desired ?? desired} workers.`
        : 'Failed to set worker target for orchestration.';
      logger('Voice command executed: set workers', { status: response.status, desired });
      return {
        success: response.ok,
        message,
        canonicalCommand: 'set_workers',
        details: data,
        telemetry: { status: response.status, desired }
      };
    }
  },
  {
    name: 'restart-agent',
    matcher: (input) => input.match(/restart(?:\s+the)?\s+(planner|planning|research|artifact|execmon|qa|voice|integration|agent\s+\w+)/i),
    execute: async (input, { baseUrl, fetchImpl, logger, requestedBy }) => {
      const match = input.match(/restart(?:\s+the)?\s+(planner|planning|research|artifact|execmon|qa|voice|integration|agent\s+(\w+))/i);
      const rawAgent = match?.[2] || match?.[1] || '';
      const agentName = rawAgent
        .toLowerCase()
        .replace(/agent\s+/g, '')
        .replace(/\s+/g, '_');

      if (!agentName) {
        return {
          success: false,
          message: 'Agent name not recognized; please specify which agent to restart.',
          canonicalCommand: 'restart_agent_invalid'
        };
      }

      const { response, data } = await postJson(fetchImpl, `${baseUrl}${RESTART_ENDPOINT(agentName)}`, {
        requestedBy
      });

      const message = response.ok
        ? `Restart signal sent to ${agentName} agent.`
        : `Failed to restart ${agentName}.`;

      logger('Voice command executed: restart agent', { status: response.status, agentName });

      return {
        success: response.ok,
        message,
        canonicalCommand: 'restart_agent',
        details: data,
        telemetry: { status: response.status, agentName }
      };
    }
  }
];

export async function handleOrchestrationCommand(commandText: string, options: OrchestrationCommandOptions = {}): Promise<OrchestrationCommandResult> {
  const normalized = normalize(commandText);
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/?$/, '');
  const logger = options.logger ?? (() => undefined);
  const requestedBy = options.requestedBy ?? 'voice-service';

  const fullOptions = { baseUrl, fetchImpl, logger, requestedBy };
  const log = createLogger({ logger });

  for (const handler of commandHandlers) {
    const match = handler.matcher(normalized);
    if (match) {
      const result = await handler.execute(normalized, fullOptions);
      await postJson(fetchImpl, `${baseUrl}${VOICE_ENDPOINT}`, {
        command: normalized,
        status: result.success ? 'accepted' : 'failed',
        response: result.message,
        requestedBy
      }).catch(() => undefined);
      return result;
    }
  }

  log('Voice command not recognized for orchestration dashboard', { command: normalized });

  await postJson(fetchImpl, `${baseUrl}${VOICE_ENDPOINT}`, {
    command: normalized,
    status: 'rejected',
    response: 'Command not recognized for orchestration control.',
    requestedBy
  }).catch(() => undefined);

  return {
    success: false,
    message: 'Command not recognized for orchestration control. Please ask for status or scaling actions.',
    canonicalCommand: 'unrecognized'
  };
}
