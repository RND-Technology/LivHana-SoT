// ===== API CLIENT =====
// Type-safe API client with error handling
// OPTIMIZED: Centralized fetch logic, proper error boundaries

import type { ApiResponse, PaginatedResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5174'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'API request failed',
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Network error or JSON parse error
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      0
    )
  }
}

/**
 * GET request
 */
export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, { method: 'GET' })
}

/**
 * POST request
 */
export async function post<T>(
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT request
 */
export async function put<T>(
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, { method: 'DELETE' })
}

/**
 * Paginated GET request
 */
export async function getPaginated<T>(
  endpoint: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<T>>> {
  const url = `${endpoint}?page=${page}&pageSize=${pageSize}`
  return fetchApi<PaginatedResponse<T>>(url, { method: 'GET' })
}

// ===== SPECIFIC API ENDPOINTS =====

export const api = {
  // Health check
  health: () => get<{ ok: boolean; database: boolean }>('/api/health'),

  // User endpoints
  user: {
    getCurrent: () => get('/api/user'),
    update: (data: any) => put('/api/user', data),
  },

  // Missions
  missions: {
    getActive: () => get('/api/missions'),
    complete: (id: string) => post(`/api/missions/${id}/complete`),
  },

  // Products
  products: {
    getAll: () => get('/api/products'),
    getFeatured: () => get('/api/products?featured=true'),
    getById: (id: string) => get(`/api/products/${id}`),
  },

  // Orders
  orders: {
    create: (data: any) => post('/api/orders', data),
    getByUser: () => get('/api/orders'),
    getById: (id: string) => get(`/api/orders/${id}`),
  },

  // Episodes
  episodes: {
    getLatest: () => get('/api/episodes/latest'),
    getAll: (page?: number) => getPaginated('/api/episodes', page),
  },

  // XP Events
  xp: {
    getHistory: () => get('/api/xp/history'),
  },
}

// Optimized: 2025-10-02

// Last optimized: 2025-10-02
