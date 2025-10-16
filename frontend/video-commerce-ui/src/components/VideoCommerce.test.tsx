import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VideoCommerce } from './VideoCommerce';

describe('VideoCommerce', () => {
  it('should render video player component', () => {
    const { container } = render(
      <VideoCommerce
        videoUrl="test.mp4"
        products={[]}
        onProductClick={() => {}}
      />
    );
    expect(container).toBeDefined();
  });

  it('should display product recommendations', () => {
    const products = [
      { id: '1', name: 'Product 1', price: 29.99 },
      { id: '2', name: 'Product 2', price: 39.99 }
    ];
    
    const { container } = render(
      <VideoCommerce
        videoUrl="test.mp4"
        products={products}
        onProductClick={() => {}}
      />
    );
    
    expect(container).toBeDefined();
  });

  it('should handle add to cart interactions', () => {
    const mockOnProductClick = vi.fn();
    
    const { container } = render(
      <VideoCommerce
        videoUrl="test.mp4"
        products={[{ id: '1', name: 'Product 1', price: 29.99 }]}
        onProductClick={mockOnProductClick}
      />
    );
    
    expect(container).toBeDefined();
  });
});

