// VIDEO PLAYER WITH COMMERCE - PROTOTYPE 4
// Content-commerce bridge with embedded product purchase
// Implements time-based product placements during video playback

import React, { useState, useEffect, useRef } from 'react';

// TypeScript strict mode - no 'any' types allowed
interface Recommendation {
  product_id: string;
  reason: string;
  confidence: number;
}

interface VideoPlayerProps {
  episodeId: string;
  customerId: string;
  apiBaseUrl?: string;
}

interface ProductPlacement {
  time: number;
  product: Recommendation;
}

/**
 * Video Player with Commerce Integration
 * Shows personalized product recommendations during video playback
 */
export function VideoPlayerWithCommerce({
  episodeId,
  customerId,
  apiBaseUrl = '/api'
}: VideoPlayerProps): JSX.Element {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showProduct, setShowProduct] = useState<Recommendation | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Fetch recommendations on mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/recommendations/${customerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError('Failed to load recommendations');
      }
    };

    fetchRecommendations();
  }, [customerId, apiBaseUrl]);

  // Define product placements at specific video times
  const placements: ProductPlacement[] = recommendations.length >= 3 ? [
    { time: 30, product: recommendations[0]! },  // 30 seconds in
    { time: 90, product: recommendations[1]! },  // 90 seconds in
    { time: 150, product: recommendations[2]! }, // 150 seconds in
  ] : [];

  // Handle video time updates
  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const time = event.currentTarget.currentTime;
    setCurrentTime(time);

    // Check if we should show a product placement
    const placement = placements.find(p =>
      Math.abs(time - p.time) < 0.5 && !showProduct
    );

    if (placement) {
      setShowProduct(placement.product);
    }
  };

  // Handle product purchase
  const handlePurchase = async (product: Recommendation) => {
    setIsPurchasing(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          productId: product.product_id,
          episodeId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Purchase failed');
      }

      const result = await response.json();
      setPurchaseSuccess(`Purchased ${product.product_id}!`);
      setShowProduct(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setPurchaseSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Purchase failed:', err);
      setError('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Handle product dismiss
  const handleDismiss = () => {
    setShowProduct(null);
    setError(null);
  };

  return (
    <div className="video-container" style={styles.container}>
      {/* Video Player */}
      <div style={styles.videoWrapper}>
        <video
          ref={videoRef}
          src={`/episodes/${episodeId}.mp4`}
          controls
          onTimeUpdate={handleTimeUpdate}
          style={styles.video}
        />

        {/* Product Overlay */}
        {showProduct && (
          <div style={styles.productOverlay}>
            <div style={styles.overlayContent}>
              <h3 style={styles.overlayTitle}>{showProduct.product_id}</h3>
              <p style={styles.overlayReason}>{showProduct.reason}</p>
              <p style={styles.overlayConfidence}>
                Match: {Math.round(showProduct.confidence * 100)}%
              </p>

              <div style={styles.overlayButtons}>
                <button
                  onClick={() => handlePurchase(showProduct)}
                  disabled={isPurchasing}
                  style={{
                    ...styles.button,
                    ...styles.buyButton,
                    ...(isPurchasing ? styles.buttonDisabled : {}),
                  }}
                >
                  {isPurchasing ? 'Processing...' : 'Buy Now'}
                </button>
                <button
                  onClick={handleDismiss}
                  disabled={isPurchasing}
                  style={{
                    ...styles.button,
                    ...styles.laterButton,
                    ...(isPurchasing ? styles.buttonDisabled : {}),
                  }}
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Success Message */}
        {purchaseSuccess && (
          <div style={styles.successMessage}>
            {purchaseSuccess}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}
      </div>

      {/* Recommendations Sidebar */}
      <div style={styles.sidebar}>
        <h4 style={styles.sidebarTitle}>Featured Products</h4>
        <div style={styles.recommendationsList}>
          {recommendations.length === 0 && (
            <p style={styles.emptyMessage}>Loading recommendations...</p>
          )}
          {recommendations.map((rec) => (
            <div
              key={rec.product_id}
              onClick={() => setShowProduct(rec)}
              style={styles.recommendationItem}
            >
              <div style={styles.productId}>{rec.product_id}</div>
              <div style={styles.confidence}>
                {Math.round(rec.confidence * 100)}% match
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inline styles (in production, use CSS modules or styled-components)
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  videoWrapper: {
    position: 'relative' as const,
    flex: 1,
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  productOverlay: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '400px',
    zIndex: 10,
    border: '2px solid #4CAF50',
  },
  overlayContent: {
    color: '#fff',
    textAlign: 'center' as const,
  },
  overlayTitle: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    marginBottom: '10px',
  },
  overlayReason: {
    fontSize: '14px',
    color: '#ccc',
    marginBottom: '10px',
  },
  overlayConfidence: {
    fontSize: '16px',
    color: '#4CAF50',
    fontWeight: 'bold' as const,
    marginBottom: '20px',
  },
  overlayButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  laterButton: {
    backgroundColor: '#666',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  successMessage: {
    position: 'absolute' as const,
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    zIndex: 11,
  },
  errorMessage: {
    position: 'absolute' as const,
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#f44336',
    color: '#fff',
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    zIndex: 11,
  },
  sidebar: {
    width: '300px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '20px',
    overflowY: 'auto' as const,
    maxHeight: '600px',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    marginBottom: '15px',
    color: '#333',
  },
  recommendationsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  recommendationItem: {
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid #ddd',
  },
  productId: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: '5px',
  },
  confidence: {
    fontSize: '12px',
    color: '#666',
  },
  emptyMessage: {
    fontSize: '14px',
    color: '#999',
    textAlign: 'center' as const,
    padding: '20px',
  },
};

export default VideoPlayerWithCommerce;
