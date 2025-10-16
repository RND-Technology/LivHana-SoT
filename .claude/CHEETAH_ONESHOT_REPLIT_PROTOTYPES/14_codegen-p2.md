### Codegen (P2)
```tsx
// frontend/herbitrage-voice/src/components/VideoPlayer.tsx

import React, { useState, useEffect } from 'react';

interface Recommendation {
  product_id: string;
  reason: string;
  confidence: number;
}

interface VideoPlayerProps {
  episodeId: string;
  customerId: string;
}

export function VideoPlayerWithCommerce({ episodeId, customerId }: VideoPlayerProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showProduct, setShowProduct] = useState<Recommendation | null>(null);

  useEffect(() => {
    fetch(`/api/recommendations/${customerId}`)
      .then(r => r.json())
      .then(setRecommendations);
  }, [customerId]);

  const handleTimeUpdate = (currentTime: number) => {
    const placements: Record<number, Recommendation> = {
      30: recommendations[0]!,
      90: recommendations[1]!,
      150: recommendations[2]!,
    };

    if (placements[Math.floor(currentTime)]) {
      setShowProduct(placements[Math.floor(currentTime)]!);
    }
  };

  const handlePurchase = async (product: Recommendation) => {
    const response = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, productId: product.product_id }),
    });

    if (response.ok) {
      alert(`Purchased ${product.product_id}!`);
      setShowProduct(null);
    }
  };

  return (
    <div className="video-container">
      <video
        src={`/episodes/${episodeId}.mp4`}
        controls
        onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
      />

      {showProduct && (
        <div className="product-overlay">
          <h3>{showProduct.product_id}</h3>
          <p>{showProduct.reason}</p>
          <button onClick={() => handlePurchase(showProduct)}>Buy Now</button>
          <button onClick={() => setShowProduct(null)}>Later</button>
        </div>
      )}

      <div className="recommendations-sidebar">
        <h4>Featured Products</h4>
        {recommendations.map(r => (
          <div key={r.product_id} onClick={() => setShowProduct(r)}>
            {r.product_id}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---
