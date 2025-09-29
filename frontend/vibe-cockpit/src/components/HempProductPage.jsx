import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HempProductPage = () => {
  const [ageVerified, setAgeVerified] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [membershipTier, setMembershipTier] = useState('guest');
  const [rewardPoints, setRewardPoints] = useState(0);

  // Premium Texas Hemp Products
  const products = [
    {
      id: 'tx-001',
      name: 'Texas Thunder THCA',
      strain: 'Sativa Dominant',
      thca: '24.7%',
      price: 49.99,
      memberPrice: 39.99,
      image: '/products/texas-thunder.jpg',
      lab: 'COA-2025-TX001',
      effects: ['Energizing', 'Creative', 'Uplifting'],
      terpenes: ['Limonene', 'Pinene', 'Myrcene'],
      description: 'Premium Texas-grown THCA flower. Farm to table excellence.',
      inventory: 147,
      rating: 4.9,
      reviews: 342
    },
    {
      id: 'tx-002',
      name: 'Lone Star Sunset CBD',
      strain: 'Indica Dominant',
      cbd: '18.5%',
      price: 39.99,
      memberPrice: 29.99,
      image: '/products/lone-star-sunset.jpg',
      lab: 'COA-2025-TX002',
      effects: ['Relaxing', 'Calming', 'Sleep'],
      terpenes: ['Linalool', 'Caryophyllene', 'Humulene'],
      description: 'Smooth Texas CBD flower for ultimate relaxation.',
      inventory: 89,
      rating: 4.8,
      reviews: 256
    },
    {
      id: 'tx-003',
      name: 'Alamo Fire THCA',
      strain: 'Hybrid',
      thca: '22.3%',
      price: 44.99,
      memberPrice: 34.99,
      image: '/products/alamo-fire.jpg',
      lab: 'COA-2025-TX003',
      effects: ['Balanced', 'Focus', 'Mood'],
      terpenes: ['Terpinolene', 'Ocimene', 'Nerolidol'],
      description: 'Perfect hybrid balance. Texas heritage meets modern cultivation.',
      inventory: 203,
      rating: 4.9,
      reviews: 428
    }
  ];

  // Age Gate Component
  const AgeGate = () => (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="bg-gradient-to-br from-green-900 to-gray-900 p-12 rounded-2xl border-4 border-green-500 max-w-lg"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
      >
        <h1 className="text-4xl font-bold text-green-400 mb-6 text-center">
          🌿 AGE VERIFICATION REQUIRED
        </h1>
        <p className="text-gray-300 mb-8 text-center">
          You must be 21+ to enter this site and purchase hemp products in Texas.
        </p>
        
        <div className="space-y-4">
          <input 
            type="date" 
            className="w-full p-4 bg-black border-2 border-green-500 rounded-lg text-green-400"
            placeholder="Date of Birth"
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split('T')[0]}
          />
          
          <motion.button
            onClick={() => setAgeVerified(true)}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-black font-bold rounded-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            VERIFY AGE & ENTER
          </motion.button>
        </div>
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          By entering, you agree to our Terms of Service and Privacy Policy.
          We use biometric verification at checkout for compliance.
        </p>
      </motion.div>
    </motion.div>
  );

  // Product Card Component
  const ProductCard = ({ product }) => {
    const discount = membershipTier !== 'guest' ? 
      Math.round(((product.price - product.memberPrice) / product.price) * 100) : 0;

    return (
      <motion.div 
        className="bg-gradient-to-br from-gray-900 to-black rounded-xl border-2 border-green-500 overflow-hidden"
        whileHover={{ 
          scale: 1.02,
          borderColor: '#00ff00',
          boxShadow: '0 0 30px rgba(0, 255, 0, 0.5)'
        }}
      >
        {/* Product Image */}
        <div className="relative h-64 bg-gradient-to-br from-green-900 to-black">
          <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            {product.inventory < 100 ? `${product.inventory} LEFT` : 'IN STOCK'}
          </div>
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold">
              -{discount}% MEMBER
            </div>
          )}
          <div className="flex items-center justify-center h-full text-6xl">
            🌿
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-green-400 mb-2">{product.name}</h3>
          <p className="text-gray-400 mb-4">{product.strain}</p>
          
          {/* Potency Badge */}
          <div className="flex gap-2 mb-4">
            {product.thca && (
              <span className="bg-purple-900 text-purple-300 px-3 py-1 rounded-full text-sm">
                THCA: {product.thca}
              </span>
            )}
            {product.cbd && (
              <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm">
                CBD: {product.cbd}
              </span>
            )}
          </div>

          {/* Effects */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.effects.map(effect => (
              <span key={effect} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                {effect}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="text-yellow-400">
              {'★'.repeat(Math.floor(product.rating))}
            </div>
            <span className="text-gray-400 ml-2">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-4">
            {membershipTier !== 'guest' ? (
              <div>
                <span className="text-gray-500 line-through">${product.price}</span>
                <span className="text-3xl font-bold text-green-400 ml-2">
                  ${product.memberPrice}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-3xl font-bold text-white">${product.price}</span>
                <span className="text-sm text-yellow-400 block">
                  Save ${product.price - product.memberPrice} with membership!
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <motion.button
              onClick={() => {
                setCartItems([...cartItems, product]);
                setRewardPoints(prev => prev + Math.floor(product.memberPrice));
              }}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-black font-bold rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ADD TO CART 🛒
            </motion.button>
            
            <motion.button
              onClick={() => setSelectedProduct(product)}
              className="w-full py-3 bg-gray-800 text-green-400 font-semibold rounded-lg border border-green-500"
              whileHover={{ backgroundColor: '#1a1a1a' }}
            >
              VIEW DETAILS & LAB RESULTS
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Membership Benefits Section
  const MembershipBenefits = () => (
    <motion.div 
      className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-2xl p-8 mb-12 border-2 border-yellow-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-3xl font-bold text-yellow-400 mb-6">
        🏆 VIP MEMBERSHIP - UNFUCKWITHABLE BENEFITS
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black bg-opacity-50 rounded-lg p-4">
          <h3 className="text-xl font-bold text-yellow-300 mb-2">BRONZE</h3>
          <ul className="text-gray-300 space-y-2">
            <li>✅ 10% off all products</li>
            <li>✅ Earn 1 point per $1</li>
            <li>✅ Birthday bonus</li>
            <li>✅ Early access sales</li>
          </ul>
          <button className="mt-4 w-full py-2 bg-yellow-600 text-black font-bold rounded">
            $9.99/month
          </button>
        </div>
        
        <div className="bg-black bg-opacity-50 rounded-lg p-4 border-2 border-yellow-400">
          <h3 className="text-xl font-bold text-yellow-300 mb-2">GOLD</h3>
          <ul className="text-gray-300 space-y-2">
            <li>✅ 20% off all products</li>
            <li>✅ Earn 2 points per $1</li>
            <li>✅ Free shipping always</li>
            <li>✅ Exclusive strains</li>
          </ul>
          <button className="mt-4 w-full py-2 bg-yellow-500 text-black font-bold rounded">
            $19.99/month
          </button>
        </div>
        
        <div className="bg-black bg-opacity-50 rounded-lg p-4">
          <h3 className="text-xl font-bold text-yellow-300 mb-2">PLATINUM</h3>
          <ul className="text-gray-300 space-y-2">
            <li>✅ 30% off everything</li>
            <li>✅ Earn 3 points per $1</li>
            <li>✅ Personal budtender</li>
            <li>✅ First harvest access</li>
          </ul>
          <button className="mt-4 w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded">
            $49.99/month
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 mt-6 text-center">
        Membership auto-renews. Cancel anytime. Points never expire. 
        Legal protection included for all members.
      </p>
    </motion.div>
  );

  // Trust Signals
  const TrustSignals = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {[
        { icon: '🔬', label: 'Lab Tested', value: '3rd Party COA' },
        { icon: '🚚', label: 'Fast Shipping', value: 'Same Day' },
        { icon: '🔒', label: 'Secure', value: 'SSL + Biometric' },
        { icon: '🏆', label: 'Guarantee', value: '100% Satisfaction' }
      ].map(signal => (
        <motion.div 
          key={signal.label}
          className="bg-gray-900 rounded-lg p-4 text-center border border-green-500"
          whileHover={{ borderColor: '#00ff00', scale: 1.05 }}
        >
          <div className="text-3xl mb-2">{signal.icon}</div>
          <div className="text-green-400 font-semibold">{signal.label}</div>
          <div className="text-gray-400 text-sm">{signal.value}</div>
        </motion.div>
      ))}
    </div>
  );

  if (!ageVerified) {
    return <AgeGate />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.div 
        className="bg-gradient-to-br from-green-900 via-black to-green-900 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto px-6">
          <motion.h1 
            className="text-6xl font-bold text-center mb-4"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
          >
            <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
              TEXAS PREMIUM HEMP FLOWER
            </span>
          </motion.h1>
          <p className="text-2xl text-center text-gray-300 mb-8">
            100% Legal THCA & CBD | Farm to Table | Lab Tested
          </p>
          
          {/* Urgency Banner */}
          <motion.div 
            className="bg-red-900 bg-opacity-50 border-2 border-red-500 rounded-lg p-4 text-center"
            animate={{ 
              borderColor: ['#ef4444', '#fbbf24', '#ef4444'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-xl font-bold text-yellow-400">
              🔥 FLASH SALE: 30% OFF FOR NEXT 2 HOURS! CODE: TEXAS420
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-12">
        {/* Cart & Rewards Status */}
        <div className="flex justify-between items-center mb-8 bg-gray-900 rounded-lg p-4">
          <div>
            <span className="text-gray-400">Cart Items:</span>
            <span className="text-2xl font-bold text-green-400 ml-2">{cartItems.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Reward Points:</span>
            <span className="text-2xl font-bold text-yellow-400 ml-2">{rewardPoints}</span>
          </div>
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-black font-bold rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CHECKOUT WITH BIOMETRIC ID →
          </motion.button>
        </div>

        {/* Trust Signals */}
        <TrustSignals />

        {/* Membership Benefits */}
        <MembershipBenefits />

        {/* Product Grid */}
        <h2 className="text-3xl font-bold text-green-400 mb-8">🌿 PREMIUM SELECTION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* SEO Content Section */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-green-500">
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            Why Choose Texas Hemp Flower?
          </h2>
          <div className="prose prose-invert max-w-none text-gray-300">
            <p>
              Experience the finest Texas-grown hemp flower, cultivated with pride in the Lone Star State. 
              Our THCA and CBD products are 100% federally legal under the 2018 Farm Bill, containing less 
              than 0.3% Delta-9 THC. Each batch is third-party lab tested for purity, potency, and compliance.
            </p>
            <p className="mt-4">
              From our family farm to your door, we guarantee freshness, quality, and the true Texas spirit 
              in every package. Join thousands of satisfied Texans who trust Reggie & Dro for their premium 
              hemp needs.
            </p>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div 
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-4xl w-full border-2 border-green-500"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-green-400 mb-6">
                {selectedProduct.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4">Lab Results</h3>
                  <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400">
                    <p>Certificate: {selectedProduct.lab}</p>
                    <p>Test Date: {new Date().toLocaleDateString()}</p>
                    <p>Status: PASSED ✅</p>
                    <p>Pesticides: NOT DETECTED</p>
                    <p>Heavy Metals: NOT DETECTED</p>
                    <p>Microbials: NOT DETECTED</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4">Terpene Profile</h3>
                  <div className="space-y-2">
                    {selectedProduct.terpenes.map(terpene => (
                      <div key={terpene} className="bg-gray-800 rounded-lg p-3">
                        <span className="text-green-400">{terpene}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedProduct(null)}
                className="mt-8 w-full py-3 bg-red-600 text-white font-bold rounded-lg"
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HempProductPage;
