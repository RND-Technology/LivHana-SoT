// API SERVICES - PROTOTYPE 4
// API integration for video commerce functionality
// Implements RESTful endpoints with error handling

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// TypeScript strict mode - no 'any' types allowed
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  thc_content?: number;
  cbd_content?: number;
  effects?: string[];
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface VideoTimestamp {
  time: number;
  productId: string;
  description: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class VideoCommerceAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Products API
  async getProducts(): Promise<Product[]> {
    try {
      const response: AxiosResponse<ApiResponse<Product[]>> = await this.client.get('/products');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response: AxiosResponse<ApiResponse<Product>> = await this.client.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  async searchProducts(query: string, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
  }): Promise<Product[]> {
    try {
      const params = new URLSearchParams({ q: query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response: AxiosResponse<ApiResponse<Product[]>> = await this.client.get(
        `/products/search?${params.toString()}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw new Error('Failed to search products');
    }
  }

  // Video Timestamps API
  async getVideoTimestamps(videoId: string): Promise<VideoTimestamp[]> {
    try {
      const response: AxiosResponse<ApiResponse<VideoTimestamp[]>> = await this.client.get(
        `/videos/${videoId}/timestamps`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch video timestamps:', error);
      throw new Error('Failed to fetch video timestamps');
    }
  }

  async createVideoTimestamp(videoId: string, timestamp: Omit<VideoTimestamp, 'time'>): Promise<VideoTimestamp> {
    try {
      const response: AxiosResponse<ApiResponse<VideoTimestamp>> = await this.client.post(
        `/videos/${videoId}/timestamps`,
        timestamp
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create video timestamp:', error);
      throw new Error('Failed to create video timestamp');
    }
  }

  // Cart API
  async getCart(): Promise<CartItem[]> {
    try {
      const response: AxiosResponse<ApiResponse<CartItem[]>> = await this.client.get('/cart');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw new Error('Failed to fetch cart');
    }
  }

  async addToCart(productId: string, quantity: number = 1): Promise<CartItem> {
    try {
      const response: AxiosResponse<ApiResponse<CartItem>> = await this.client.post('/cart/items', {
        product_id: productId,
        quantity,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw new Error('Failed to add to cart');
    }
  }

  async updateCartItem(productId: string, quantity: number): Promise<CartItem> {
    try {
      const response: AxiosResponse<ApiResponse<CartItem>> = await this.client.put(
        `/cart/items/${productId}`,
        { quantity }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw new Error('Failed to update cart item');
    }
  }

  async removeFromCart(productId: string): Promise<void> {
    try {
      await this.client.delete(`/cart/items/${productId}`);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw new Error('Failed to remove from cart');
    }
  }

  async clearCart(): Promise<void> {
    try {
      await this.client.delete('/cart');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw new Error('Failed to clear cart');
    }
  }

  // Orders API
  async createOrder(items: CartItem[]): Promise<Order> {
    try {
      const response: AxiosResponse<ApiResponse<Order>> = await this.client.post('/orders', {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw new Error('Failed to create order');
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const response: AxiosResponse<ApiResponse<Order[]>> = await this.client.get('/orders');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  async getOrder(id: string): Promise<Order> {
    try {
      const response: AxiosResponse<ApiResponse<Order>> = await this.client.get(`/orders/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Recommendations API
  async getRecommendations(productId: string): Promise<Product[]> {
    try {
      const response: AxiosResponse<ApiResponse<Product[]>> = await this.client.get(
        `/recommendations/${productId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      throw new Error('Failed to fetch recommendations');
    }
  }

  async getPersonalizedRecommendations(customerId: string): Promise<Product[]> {
    try {
      const response: AxiosResponse<ApiResponse<Product[]>> = await this.client.get(
        `/recommendations/personalized/${customerId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch personalized recommendations:', error);
      throw new Error('Failed to fetch personalized recommendations');
    }
  }

  // Analytics API
  async trackEvent(eventName: string, properties?: Record<string, unknown>): Promise<void> {
    try {
      await this.client.post('/analytics/events', {
        event_name: eventName,
        properties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
      // Don't throw error for analytics failures
    }
  }

  async getAnalytics(timePeriod: 'day' | 'week' | 'month' = 'week'): Promise<{
    total_views: number;
    total_purchases: number;
    conversion_rate: number;
    average_order_value: number;
    top_products: Product[];
  }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.client.get(
        `/analytics?period=${timePeriod}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }

  // Favorites API
  async getFavorites(): Promise<string[]> {
    try {
      const response: AxiosResponse<ApiResponse<string[]>> = await this.client.get('/favorites');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      throw new Error('Failed to fetch favorites');
    }
  }

  async addToFavorites(productId: string): Promise<void> {
    try {
      await this.client.post('/favorites', { product_id: productId });
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw new Error('Failed to add to favorites');
    }
  }

  async removeFromFavorites(productId: string): Promise<void> {
    try {
      await this.client.delete(`/favorites/${productId}`);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw new Error('Failed to remove from favorites');
    }
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
  }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.client.get('/health');
      return response.data.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: 'unknown',
      };
    }
  }
}

// Export singleton instance
export const api = new VideoCommerceAPI();

// Export types
export type {
  Product,
  VideoTimestamp,
  CartItem,
  Order,
  ApiResponse,
};
