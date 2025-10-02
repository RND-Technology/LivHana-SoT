/**
 * Test API Client Helper
 * LivHana Trinity E2E Testing - TIER 1
 */

import { APIRequestContext } from '@playwright/test';
import { getTestToken } from '../fixtures/auth-tokens';

export class TestAPIClient {
  constructor(
    private request: APIRequestContext,
    private baseURL: string,
    private token?: string
  ) {}

  private getHeaders(additionalHeaders: Record<string, string> = {}) {
    return {
      'Authorization': `Bearer ${this.token || getTestToken()}`,
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };
  }

  async get(endpoint: string, options: { headers?: Record<string, string>, timeout?: number } = {}) {
    return this.request.get(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(options.headers),
      timeout: options.timeout || 30000,
    });
  }

  async post(endpoint: string, data: any, options: { headers?: Record<string, string>, timeout?: number } = {}) {
    return this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.getHeaders(options.headers),
      timeout: options.timeout || 30000,
    });
  }

  async put(endpoint: string, data: any, options: { headers?: Record<string, string>, timeout?: number } = {}) {
    return this.request.put(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.getHeaders(options.headers),
      timeout: options.timeout || 30000,
    });
  }

  async delete(endpoint: string, options: { headers?: Record<string, string>, timeout?: number } = {}) {
    return this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(options.headers),
      timeout: options.timeout || 30000,
    });
  }

  async patch(endpoint: string, data: any, options: { headers?: Record<string, string>, timeout?: number } = {}) {
    return this.request.patch(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.getHeaders(options.headers),
      timeout: options.timeout || 30000,
    });
  }
}

// Pre-configured API clients for different services
export function createIntegrationAPIClient(request: APIRequestContext, token?: string) {
  return new TestAPIClient(request, 'http://localhost:3005', token);
}

export function createReasoningAPIClient(request: APIRequestContext, token?: string) {
  return new TestAPIClient(request, 'http://localhost:4002', token);
}

export function createVoiceAPIClient(request: APIRequestContext, token?: string) {
  return new TestAPIClient(request, 'http://localhost:4001', token);
}

// Helper function to wait for async operations with retry
export async function waitForCondition(
  condition: () => Promise<boolean>,
  options: { timeout?: number; interval?: number; description?: string } = {}
): Promise<void> {
  const timeout = options.timeout || 30000;
  const interval = options.interval || 1000;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(
    `Timeout waiting for condition${options.description ? ': ' + options.description : ''} after ${timeout}ms`
  );
}
