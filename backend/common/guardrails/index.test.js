import { describe, expect, it } from 'vitest';
import { evaluateGuardrails } from './index.js';

describe('evaluateGuardrails', () => {
  it('passes valid prompt payload', async () => {
    const logger = { warn: () => {}, error: () => {} };
    const result = await evaluateGuardrails({
      payload: { prompt: 'Hello world', sessionId: 'abc', metadata: {} },
      logger,
    });
    expect(result.allowed).toBe(true);
  });

  it('blocks empty prompt', async () => {
    const logs = [];
    const logger = {
      warn: (payload) => logs.push(payload),
      error: (payload) => logs.push(payload),
    };
    const result = await evaluateGuardrails({
      payload: { prompt: '', sessionId: 'abc' },
      logger,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('INVALID_PROMPT_SCHEMA');
    expect(logs.length).toBeGreaterThan(0);
  });
});
// Last optimized: 2025-10-02

// Optimized: 2025-10-02
