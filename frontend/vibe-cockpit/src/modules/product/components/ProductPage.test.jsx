import { expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductPage } from './ProductPage.jsx';

vi.mock('../hooks/useProductData.js', () => ({
  useProductData: () => ({
    data: {
      product: {
        id: 'prod-1',
        name: 'Grape Gas',
        complianceNote: '21+ only • <0.3% Δ9 THC',
        pricing: [{ sku: '1g', price: 18 }],
        inventory: { status: 'Almost gone', available: 16 },
      },
      reviews: [{
        id: 'rev-1',
        author: 'Lina',
        date: '2024-01-06',
        body: 'Great strain',
        metrics: { look: 4, smell: 4, taste: 4, effect: 4 },
      }],
      metrics: { look: 4, smell: 4, taste: 4, effect: 4 },
      loyalty: {
        tier: 'Member',
        points: 150,
        freeGramCredits: 3,
        rewards: [{ id: 'reward-free-gram', label: 'Free Gram available' }],
        waysToEarn: [{ id: 'review', label: '+100 Write a Review' }],
      },
    },
    loading: false,
    error: null,
  }),
}));

vi.mock('../hooks/useSoundCue.js', () => ({
  useSoundCue: () => ({
    playSoftCue: vi.fn(),
    playAttentionCue: vi.fn(),
  }),
}));

describe('ProductPage', () => {
  it('renders product hero, reviews, and loyalty panel', () => {
    render(<ProductPage productId="prod-1" memberId="member-1" />);

    expect(screen.getByTestId('product-hero')).toBeInTheDocument();
    expect(screen.getByTestId('review-stream')).toBeInTheDocument();
    expect(screen.getByTestId('loyalty-panel')).toBeInTheDocument();
    expect(screen.getByText(/Free Gram available/)).toBeInTheDocument();
  });

  it('opens review modal when CTA clicked', () => {
    render(<ProductPage productId="prod-1" memberId="member-1" />);

    const reviewButtons = screen.getAllByTestId('open-review-modal');
    fireEvent.click(reviewButtons[0]);

    expect(screen.getByTestId('review-modal')).toBeInTheDocument();
  });
});
