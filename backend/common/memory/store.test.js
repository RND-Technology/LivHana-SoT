import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createMemoryStore } from './store.js';

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    isOpen: false,
    connect: vi.fn(async () => {}),
    on: vi.fn(),
    set: vi.fn(async () => {}),
    get: vi.fn(async () => null),
  })),
}));

describe('createMemoryStore', () => {
  let logger;

  beforeEach(() => {
    logger = { error: vi.fn(), warn: vi.fn() };
  });

  it('stores and retrieves values with in-memory fallback', async () => {
    const store = await createMemoryStore({ logger });
    await store.set('job-1', { hello: 'world' });
    const value = await store.get('job-1');
    expect(value).toEqual({ hello: 'world' });
  });

  it('appends history entries', async () => {
    const store = await createMemoryStore({ logger });
    await store.appendHistory('job-2', { type: 'delta', delta: 'chunk' });
    const value = await store.get('job-2');
    expect(value.history).toHaveLength(1);
    expect(value.history[0].delta).toBe('chunk');
  });
});
// Last optimized: 2025-10-02
