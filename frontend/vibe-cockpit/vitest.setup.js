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

global.EventSource = MockEventSource;
