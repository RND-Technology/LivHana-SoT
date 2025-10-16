import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock fetch for tests
globalThis.fetch = async (url: string | URL | Request, _init?: RequestInit) => {
  const urlString = typeof url === 'string' ? url : url.toString()

  // Mock recommendations endpoint
  if (urlString.includes('/recommendations/')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        recommendations: [
          { product_id: 'product-1', reason: 'Best seller', confidence: 0.95 },
          { product_id: 'product-2', reason: 'Popular choice', confidence: 0.87 },
          { product_id: 'product-3', reason: 'New arrival', confidence: 0.78 },
        ],
      }),
    } as Response
  }

  // Mock purchase endpoint
  if (urlString.includes('/purchase')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, orderId: 'order-123' }),
    } as Response
  }

  // Default 404 response
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' }),
  } as Response
}

// Mock HTMLMediaElement methods
window.HTMLMediaElement.prototype.load = () => {}
window.HTMLMediaElement.prototype.play = () => Promise.resolve()
window.HTMLMediaElement.prototype.pause = () => {}
