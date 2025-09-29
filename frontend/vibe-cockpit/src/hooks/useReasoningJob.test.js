import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useReasoningJob } from './useReasoningJob.js';

const mock = new MockAdapter(axios);

const createEventSourceMock = () => {
  const listeners = {};
  return {
    addEventListener: (event, handler) => {
      listeners[event] = handler;
    },
    close: vi.fn(),
    emit(event, data) {
      listeners[event]?.({ data: JSON.stringify(data) });
    },
    error() {
      listeners.error?.();
    },
  };
};

let originalEventSource;

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('useReasoningJob', () => {
  beforeEach(() => {
    mock.reset();
    originalEventSource = globalThis.EventSource;
  });

  afterEach(() => {
    globalThis.EventSource = originalEventSource;
    vi.restoreAllMocks();
  });

  it('submits job and handles completed stream', async () => {
    const eventSource = createEventSourceMock();
    vi.stubGlobal('EventSource', vi.fn(() => eventSource));

    mock.onPost('/api/reasoning/enqueue').reply(202, { jobId: 'job-42' });

    const { result } = renderHook(() => useReasoningJob());

    await act(async () => {
      await result.current.submitJob({ prompt: 'hello', sessionId: 's1' });
    });

    expect(result.current.jobId).toBe('job-42');
    expect(result.current.status).toBe('queued');

    act(() => {
      eventSource.emit('progress', { delta: 'chunk' });
    });

    expect(result.current.status).toBe('progress');
    expect(result.current.result?.partial).toBe('chunk');

    act(() => {
      eventSource.emit('completed', { output: 'final text' });
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.result?.final).toBe('final text');
  });

  it('handles enqueue failure', async () => {
    mock.onPost('/api/reasoning/enqueue').reply(500, { error: 'bad' });

    const { result } = renderHook(() => useReasoningJob());

    await expect(
      result.current.submitJob({ prompt: 'hello', sessionId: 's1' })
    ).rejects.toThrow();

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('bad');
  });
});
