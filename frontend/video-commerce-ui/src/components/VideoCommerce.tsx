// VIDEO COMMERCE UI - PROTOTYPE 4
// Interactive video commerce interface for cannabis retail
// Implements product showcases with real-time purchasing

import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ShoppingCart, Heart, Share2, Volume2, VolumeX } from 'lucide-react';

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

interface VideoCommerceProps {
  videoUrl: string;
  products: Product[];
  timestamps: VideoTimestamp[];
  onProductSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onShare: (product: Product) => void;
  onFavorite: (product: Product) => void;
}

export const VideoCommerce: React.FC<VideoCommerceProps> = ({
  videoUrl,
  products,
  timestamps,
  onProductSelect,
  onAddToCart,
  onShare,
  onFavorite,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  
  const playerRef = useRef<ReactPlayer>(null);

  // Find product at current timestamp
  useEffect(() => {
    const activeTimestamp = timestamps.find(
      ts => currentTime >= ts.time && currentTime < ts.time + 10
    );
    
    if (activeTimestamp) {
      const product = products.find(p => p.id === activeTimestamp.productId);
      if (product) {
        setCurrentProduct(product);
        setShowProducts(true);
      }
    } else {
      setShowProducts(false);
      setCurrentProduct(null);
    }
  }, [currentTime, timestamps, products]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleAddToCart = (product: Product) => {
    const currentQuantity = cart.get(product.id) || 0;
    setCart(new Map(cart.set(product.id, currentQuantity + 1)));
    onAddToCart(product);
  };

  const handleFavorite = (product: Product) => {
    const newFavorites = new Set(favorites);
    if (favorites.has(product.id)) {
      newFavorites.delete(product.id);
    } else {
      newFavorites.add(product.id);
    }
    setFavorites(newFavorites);
    onFavorite(product);
  };

  const handleShare = (product: Product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    onShare(product);
  };

  const getCartTotal = () => {
    return Array.from(cart.entries()).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Array.from(cart.values()).reduce((total, quantity) => total + quantity, 0);
  };

  return (
    <div className="video-commerce-container">
      {/* Video Player */}
      <div className="relative w-full h-screen bg-black">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={isPlaying}
          volume={isMuted ? 0 : volume}
          onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
          width="100%"
          height="100%"
          controls={false}
        />

        {/* Video Overlay Controls */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlayPause}
            className="bg-white/20 backdrop-blur-sm rounded-full p-4 text-white hover:bg-white/30 transition-colors"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </motion.button>
        </div>

        {/* Volume Control */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <button
            onClick={handleMute}
            className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Timestamp Navigation */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {timestamps.map((timestamp, index) => (
            <motion.button
              key={timestamp.productId}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSeek(timestamp.time)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                currentTime >= timestamp.time && currentTime < timestamp.time + 10
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {index + 1}
            </motion.button>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
          <div className="flex items-center space-x-2">
            <ShoppingCart size={20} />
            <span className="font-medium">{getCartItemCount()} items</span>
            <span className="text-sm">${getCartTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Product Showcase Overlay */}
      <AnimatePresence>
        {showProducts && currentProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-20 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {currentProduct.name}
                </h3>
                <p className="text-gray-600 mb-3">{currentProduct.description}</p>
                
                {/* Product Specs */}
                <div className="flex items-center space-x-4 mb-3">
                  {currentProduct.thc_content && (
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      THC: {currentProduct.thc_content}%
                    </span>
                  )}
                  {currentProduct.cbd_content && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      CBD: {currentProduct.cbd_content}%
                    </span>
                  )}
                  <span className={`text-sm px-2 py-1 rounded ${
                    currentProduct.availability === 'in_stock'
                      ? 'bg-green-100 text-green-800'
                      : currentProduct.availability === 'low_stock'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentProduct.availability.replace('_', ' ')}
                  </span>
                </div>

                {/* Effects */}
                {currentProduct.effects && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">Effects: </span>
                    {currentProduct.effects.map((effect, index) => (
                      <span key={effect} className="text-sm text-gray-700">
                        {effect}{index < currentProduct.effects!.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ${currentProduct.price.toFixed(2)}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFavorite(currentProduct)}
                      className={`p-2 rounded-full transition-colors ${
                        favorites.has(currentProduct.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Heart size={20} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShare(currentProduct)}
                      className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      <Share2 size={20} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(currentProduct)}
                      disabled={currentProduct.availability === 'out_of_stock'}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      <div className="bg-gray-50 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
              onClick={() => onProductSelect(product)}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(product);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      favorites.has(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <Heart size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={product.availability === 'out_of_stock'}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoCommerce;
