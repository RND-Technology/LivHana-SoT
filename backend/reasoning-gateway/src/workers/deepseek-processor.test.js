/* eslint-env jest */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { createDeepSeekWorkerProcessor } from './deepseek-processor.js';

vi.mock('../../../common/guardrails/index.js', () => ({
  evaluateGuardrails: vi.fn(() => Promise.resolve({ allowed: true })),
}));

vi.mock('../../../common/memory/store.js', () => ({
  createMemoryStore: vi.fn(async () => ({
    set: vi.fn(),
    get: vi.fn(async () => null),
    appendHistory: vi.fn(),
    isRedisBacked: false,
  })),
}));

vi.mock('../../../common/feedback/index.js', () => ({
  recordFeedback: vi.fn(async () => undefined),
}));

vi.mock('openai', () => ({
  default: class MockOpenAI {
    constructor(opts) {
      this.opts = opts;
      this.chat = {
        completions: {
          create: async function* () {
            yield { choices: [{ delta: { content: 'Chunk 1' } }] };
            yield { choices: [{ delta: { content: 'Chunk 2' } }] };
            yield { choices: [{ finish_reason: 'stop' }] };
          }
        }
      };
    }
  },
}));

const { evaluateGuardrails } = await import('../../../common/guardrails/index.js');
const { recordFeedback } = await import('../../../common/feedback/index.js');

beforeAll(() => {
  process.env.DEEPSEEK_API_KEY = 'test-key';
});

const createMockLogger = () => {
  const logger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };
  logger.child = vi.fn(() => logger);
  return logger;
};

const createJob = (overrides = {}) => ({
  id: 'job-123',
  data: {
    prompt: 'Tell me something useful',
    sessionId: 'session-1',
    metadata: { source: 'test' },
  },
  updateProgress: vi.fn(),
  ...overrides,
});

describe('createDeepSeekWorkerProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('streams deltas and returns aggregated payload', async () => {
    const processor = createDeepSeekWorkerProcessor({ logger: createMockLogger() });
    const job = createJob();

    const result = await processor(job);

    expect(evaluateGuardrails).toHaveBeenCalled();
    expect(job.updateProgress).toHaveBeenCalledWith({ delta: 'Chunk 1' });
    expect(job.updateProgress).toHaveBeenCalledWith({ delta: 'Chunk 2' });
    expect(result.output).toBe('Chunk 1Chunk 2');
    expect(recordFeedback).toHaveBeenCalledWith(expect.objectContaining({ jobId: 'job-123' }));
  });

  it('throws when guardrails block job', async () => {
    evaluateGuardrails.mockResolvedValueOnce({ allowed: false, reason: 'BANNED', details: {} });
    const processor = createDeepSeekWorkerProcessor({ logger: createMockLogger() });
    const job = createJob();

    await expect(processor(job)).rejects.toThrow('Guardrail blocked reasoning job: BANNED');
  });
});
