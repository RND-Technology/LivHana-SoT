import { describe, expect, it, vi } from 'vitest';
import { streamJobEvents, formatSSEEvent } from './stream.js';

const createMockResponse = () => {
  const res = {
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key] = value;
    },
    flushHeaders: vi.fn(),
    write: vi.fn(function (chunk) {
      this.body += chunk;
    }),
    end: vi.fn(),
  };
  return res;
};

const createMockQueueEvents = () => {
  const listeners = {
    completed: [],
    failed: [],
    progress: [],
  };
  return {
    on: vi.fn((event, handler) => {
      listeners[event].push(handler);
    }),
    removeListener: vi.fn((event, handler) => {
      listeners[event] = listeners[event].filter((listener) => listener !== handler);
    }),
    emit(event, payload) {
      for (const handler of listeners[event]) {
        handler(payload);
      }
    },
  };
};

const createLogger = () => ({
  child: vi.fn(() => createLogger()),
  info: vi.fn(),
  error: vi.fn(),
});

describe('streamJobEvents', () => {
  it('streams completed events and ends response', () => {
    const queueEvents = createMockQueueEvents();
    const res = createMockResponse();
    const cleanup = streamJobEvents({
      res,
      queueEvents,
      jobId: 'job-123',
      logger: createLogger(),
      requestId: 'req-1',
    });

    queueEvents.emit('completed', { jobId: 'job-123', returnvalue: { result: 'ok' } });

    expect(res.write).toHaveBeenCalledWith(formatSSEEvent('completed', { result: 'ok' }));
    expect(res.end).toHaveBeenCalled();
    cleanup();
  });

  it('streams failed events and ends response', () => {
    const queueEvents = createMockQueueEvents();
    const res = createMockResponse();

    streamJobEvents({
      res,
      queueEvents,
      jobId: 'job-123',
      logger: createLogger(),
      requestId: 'req-1',
    });

    queueEvents.emit('failed', { jobId: 'job-123', failedReason: 'boom' });

    expect(res.write).toHaveBeenCalledWith(formatSSEEvent('failed', { error: 'boom' }));
    expect(res.end).toHaveBeenCalled();
  });

  it('streams progress events without ending response', () => {
    const queueEvents = createMockQueueEvents();
    const res = createMockResponse();

    streamJobEvents({
      res,
      queueEvents,
      jobId: 'job-123',
      logger: createLogger(),
      requestId: 'req-1',
    });

    queueEvents.emit('progress', { jobId: 'job-123', data: { delta: 'chunk' } });

    expect(res.write).toHaveBeenCalledWith(formatSSEEvent('progress', { delta: 'chunk' }));
    expect(res.end).not.toHaveBeenCalled();
  });
});

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
