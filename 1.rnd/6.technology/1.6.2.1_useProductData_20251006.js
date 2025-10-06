import { useEffect, useState } from 'react';
import axios from 'axios';

const createFallbackData = (productId) => ({
  product: {
    id: productId,
    name: 'Grape Gas',
    complianceNote: 'Must be 21+ with valid ID. <0.3% Δ9 THC compliant with Texas and federal hemp regulations.',
    inventory: { available: 16, status: 'Almost gone' },
    pricing: [
      { sku: '1g', price: 18 },
      { sku: '1/8 oz', price: 55 },
      { sku: '1/4 oz', price: 99 },
    ],
  },
  reviews: [{
    id: 'rev-fallback-1',
    author: 'Lina',
    date: '2024-01-06',
    headline: 'Purple relaxation',
    body: 'Dense purple nugs with grape candy terps. Perfect for evening wind-down.',
    metrics: { look: 4.5, smell: 4.5, taste: 4.5, effect: 4.5 },
  }],
  metrics: { look: 4.5, smell: 4.5, taste: 4.5, effect: 4.5 },
  loyalty: {
    tier: 'Member',
    points: 150,
    freeGramCredits: 3,
    rewards: [{ id: 'reward-free-gram', label: 'Free Gram available' }],
    waysToEarn: [
      { id: 'review', label: '+100 Write a Review' },
      { id: 'photo', label: '+150 Photo Review' },
      { id: 'monthly', label: '+500 Monthly Bonus' },
    ],
  },
});

export const useProductData = (productId, { memberId = 'member-demo' } = {}) => {
  const [data, setData] = useState(() => createFallbackData(productId));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    let active = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [productResponse, reviewResponse, loyaltyResponse] = await Promise.all([
          axios.get(`/api/product/${productId}`),
          axios.get(`/api/product/${productId}/reviews`),
          axios.get(`/api/member/${memberId}/loyalty`).catch(() => ({ data: {} })),
        ]);

        if (!active) return;

        setData({
          product: productResponse.data,
          reviews: reviewResponse.data.reviews ?? [],
          metrics: reviewResponse.data.metrics ?? {},
          loyalty: loyaltyResponse.data ?? {},
        });
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err);
        setData(createFallbackData(productId));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [productId, memberId]);

  return { data, loading, error };
};

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
