import React from 'react';
import { VideoCommerce } from './components/VideoCommerce.tsx';
import { mockProducts, mockTimestamps, Product } from './data/mockData.ts';
import './App.css';

function App() {
  const handleProductSelect = (product: Product) => {
    console.log('Product selected:', product);
  };

  const handleAddToCart = (product: Product) => {
    console.log('Added to cart:', product);
  };

  const handleShare = (product: Product) => {
    console.log('Shared:', product);
  };

  const handleFavorite = (product: Product) => {
    console.log('Favorited:', product);
  };

  return (
    <div className="App">
      <VideoCommerce
        videoUrl="https://example.com/video.mp4"
        products={mockProducts}
        timestamps={mockTimestamps}
        onProductSelect={handleProductSelect}
        onAddToCart={handleAddToCart}
        onShare={handleShare}
        onFavorite={handleFavorite}
      />
    </div>
  );
}

export default App;
