import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

class MockEventSource {
  constructor() {
    this.listeners = {};
  }

  addEventListener(event, handler) {
    this.listeners[event] = handler;
  }

  dispatch(event, payload) {
    this.listeners[event]?.({ data: JSON.stringify(payload) });
  }

  close() {}
}

globalThis.EventSource = MockEventSource;
// Last optimized: 2025-10-02
