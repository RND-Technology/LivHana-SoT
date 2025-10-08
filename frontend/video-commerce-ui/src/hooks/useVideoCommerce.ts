// VIDEO COMMERCE HOOKS - PROTOTYPE 4
// Custom hooks for video commerce functionality
// Implements state management and API integration

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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

interface VideoCommerceState {
  products: Product[];
  timestamps: VideoTimestamp[];
  cart: CartItem[];
  favorites: string[];
  isLoading: boolean;
  error: string | null;
}

interface VideoCommerceActions {
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  toggleFavorite: (productId: string) => void;
  clearCart: () => void;
  refreshProducts: () => Promise<void>;
}

export const useVideoCommerce = (): VideoCommerceState & VideoCommerceActions => {
  const [state, setState] = useState<VideoCommerceState>({
    products: [],
    timestamps: [],
    cart: [],
    favorites: [],
    isLoading: true,
    error: null,
  });

  // Load products and timestamps from API
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [productsResponse, timestampsResponse] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/video-timestamps'),
      ]);

      setState(prev => ({
        ...prev,
        products: productsResponse.data,
        timestamps: timestampsResponse.data,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false,
      }));
    }
  }, []);

  // Add product to cart
  const addToCart = useCallback((product: Product) => {
    setState(prev => {
      const existingItem = prev.cart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return {
          ...prev,
          cart: prev.cart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        return {
          ...prev,
          cart: [...prev.cart, { product, quantity: 1 }],
        };
      }
    });
  }, []);

  // Remove product from cart
  const removeFromCart = useCallback((productId: string) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.product.id !== productId),
    }));
  }, []);

  // Update cart quantity
  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setState(prev => ({
      ...prev,
      cart: prev.cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ),
    }));
  }, [removeFromCart]);

  // Toggle favorite
  const toggleFavorite = useCallback((productId: string) => {
    setState(prev => {
      const isFavorite = prev.favorites.includes(productId);
      return {
        ...prev,
        favorites: isFavorite
          ? prev.favorites.filter(id => id !== productId)
          : [...prev.favorites, productId],
      };
    });
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setState(prev => ({ ...prev, cart: [] }));
  }, []);

  // Refresh products
  const refreshProducts = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist cart and favorites to localStorage
  useEffect(() => {
    localStorage.setItem('video-commerce-cart', JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    localStorage.setItem('video-commerce-favorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  // Load cart and favorites from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('video-commerce-cart');
    const savedFavorites = localStorage.getItem('video-commerce-favorites');
    
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        setState(prev => ({ ...prev, cart }));
      } catch (error) {
        console.warn('Failed to load cart from localStorage:', error);
      }
    }
    
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        setState(prev => ({ ...prev, favorites }));
      } catch (error) {
        console.warn('Failed to load favorites from localStorage:', error);
      }
    }
  }, []);

  return {
    ...state,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleFavorite,
    clearCart,
    refreshProducts,
  };
};

// Hook for video player controls
export const useVideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const seek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const setVolumeLevel = useCallback((level: number) => {
    setVolume(level);
    setIsMuted(level === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const onProgress = useCallback((progress: { playedSeconds: number }) => {
    setCurrentTime(progress.playedSeconds);
  }, []);

  const onDuration = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolumeLevel,
    toggleMute,
    onProgress,
    onDuration,
  };
};

// Hook for product recommendations
export const useProductRecommendations = (currentProductId?: string) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (productId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/recommendations/${productId}`);
      setRecommendations(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentProductId) {
      fetchRecommendations(currentProductId);
    }
  }, [currentProductId, fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
  };
};

// Hook for analytics tracking
export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    // Implement analytics tracking
    console.log('Analytics Event:', eventName, properties);
    
    // In production, this would send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
  }, []);

  const trackProductView = useCallback((product: Product) => {
    trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      product_category: product.category,
      product_price: product.price,
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback((product: Product, quantity: number = 1) => {
    trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      product_category: product.category,
      product_price: product.price,
      quantity,
    });
  }, [trackEvent]);

  const trackPurchase = useCallback((products: Product[], total: number) => {
    trackEvent('purchase', {
      product_count: products.length,
      total_value: total,
      product_ids: products.map(p => p.id),
    });
  }, [trackEvent]);

  const trackVideoEngagement = useCallback((action: string, timestamp: number) => {
    trackEvent('video_engagement', {
      action,
      timestamp,
      video_time: timestamp,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackProductView,
    trackAddToCart,
    trackPurchase,
    trackVideoEngagement,
  };
};
