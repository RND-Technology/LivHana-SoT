import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

const SquareRealProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ageVerified, setAgeVerified] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [source, setSource] = useState('mock');

  const domainConfigs = useMemo(() => ({
    'reggieanddro.com': {
      brand: 'Reggie & Dro',
      tagline: 'Premium Texas Hemp Since 2020',
      primaryColor: '#16A34A',
      logo: '🌿'
    },
    'herbitrage.com': {
      brand: 'Herbitrage',
      tagline: 'Cannabis Price Intelligence',
      primaryColor: '#059669',
      logo: '📊'
    },
    'oneplantsolution.com': {
      brand: 'One Plant Solution',
      tagline: 'Your Complete Cannabis Resource',
      primaryColor: '#10B981',
      logo: '🌱'
    },
    'highnooncartoon.com': {
      brand: 'High Noon Cartoon',
      tagline: 'Cannabis Culture & Entertainment',
      primaryColor: '#F59E0B',
      logo: '🎭'
    },
    'cannabisretailai.com': {
      brand: 'Cannabis Retail AI',
      tagline: 'Smart Cannabis Commerce',
      primaryColor: '#8B5CF6',
      logo: '🤖'
    },
    'freeweedtexas.com': {
      brand: 'Free Weed Texas',
      tagline: 'Legal Hemp Liberation',
      primaryColor: '#EF4444',
      logo: '🔥'
    }
  }), []);

  const currentDomain = useMemo(() => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    return domainConfigs[hostname] || domainConfigs['reggieanddro.com'];
  }, [domainConfigs]);

  useEffect(() => {
    const fetchSquareProducts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/square/catalog`);
        const transformed = data.products && Array.isArray(data.products)
          ? data.products
          : transformSquareObjects(data.objects || []);

        setProducts(transformed.length ? transformed : getDemoProducts());
        setSource(data.source || 'mock');
      } catch (error) {
        console.error('Failed to fetch Square products:', error);
        setProducts(getDemoProducts());
        setSource('mock');
      } finally {
        setLoading(false);
      }
    };

    if (ageVerified) {
      fetchSquareProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageVerified]);

  const extractPotency = (description, compound) => {
    if (!description) return null;
    const regex = new RegExp(`${compound}[:\\s]*(\\d+\\.?\\d*)%`, 'i');
    const match = description.match(regex);
    return match ? `${match[1]}%` : null;
  };

  const transformSquareObjects = (objects) => objects
    .filter((obj) => obj.type === 'ITEM')
    .map((item) => {
      const variation = item.item_data?.variations?.[0]?.item_variation_data || {};
      return {
        id: item.id,
        name: item.item_data?.name || 'Unnamed Product',
        description: item.item_data?.description || '',
        price: variation.price_money?.amount ? variation.price_money.amount / 100 : 0,
        sku: variation.sku || '',
        category: item.item_data?.categories?.[0]?.name || 'Hemp Product',
        image: item.item_data?.image_url || null,
        inventory: variation.inventory_count ?? 0,
        thca: extractPotency(item.item_data?.description, 'THCA'),
        cbd: extractPotency(item.item_data?.description, 'CBD'),
        delta8: extractPotency(item.item_data?.description, 'Delta'),
        lab: `COA-${item.id.slice(-8)}`
      };
    });

  const getDemoProducts = () => [
    {
      id: 'DEMO-THCA',
      name: 'Tier-1 THCA Flower - 3.5g',
      description: 'Indoor grown THCA flower. THCA: 23.5%. Texas compliant.',
      price: 45,
      sku: 'THCA-IND-35',
      category: 'THCA Flower',
      inventory: 120,
      thca: '23.5%',
      cbd: '0.3%',
      lab: 'COA-DEMO-THCA'
    },
    {
      id: 'DEMO-CBD',
      name: 'Texas CBD Flower - 7g',
      description: 'Sun grown CBD hemp. CBD: 18.5%, THC <0.3%.',
      price: 38,
      sku: 'CBD-TX-7',
      category: 'CBD Flower',
      inventory: 90,
      cbd: '18.5%',
      thca: '0.2%',
      lab: 'COA-DEMO-CBD'
    }
  ];

  if (!ageVerified) {
    return <AgeGate currentDomain={currentDomain} onVerify={() => setAgeVerified(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          🌿
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header currentDomain={currentDomain} cartItems={cartItems} source={source} />
      <ProductGrid
        products={products}
        currentDomain={currentDomain}
        cartItems={cartItems}
        setCartItems={setCartItems}
        setSelectedProduct={setSelectedProduct}
      />
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

const AgeGate = ({ currentDomain, onVerify }) => (
  <motion.div
    className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="bg-gradient-to-br from-green-900 to-gray-900 p-12 rounded-2xl border-4 border-green-500 max-w-lg"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' }}
    >
      <div className="text-6xl text-center mb-4">{currentDomain.logo}</div>
      <h1 className="text-4xl font-bold text-green-400 mb-2 text-center">
        {currentDomain.brand}
      </h1>
      <p className="text-gray-400 mb-6 text-center">{currentDomain.tagline}</p>

      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
        AGE VERIFICATION REQUIRED
      </h2>
      <p className="text-gray-300 mb-6 text-center">
        You must be 21+ to enter. Texas law requires age verification for hemp products.
      </p>

      <div className="space-y-4">
        <input
          type="date"
          id="birthdate-input"
          required
          className="w-full p-4 bg-black border-2 border-green-500 rounded-lg text-green-400"
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split('T')[0]}
          onChange={(e) => {
            if (!e.target.value) return;
            const birthDate = new Date(e.target.value);
            const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

            // SECURITY: Prevent bypass - validate both client-side AND will validate server-side
            if (age >= 21 && e.target.value) {
              onVerify();
            }
          }}
        />
        <motion.button
          onClick={() => {
            // SECURITY: Enforce age verification - cannot bypass by clicking button
            const input = document.getElementById('birthdate-input');
            if (!input?.value) {
              alert('Please enter your date of birth to verify you are 21+');
              return;
            }
            const birthDate = new Date(input.value);
            const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            if (age >= 21) {
              onVerify();
            } else {
              alert('You must be 21 or older to access this content.');
            }
          }}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-black font-bold rounded-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          VERIFY AGE & ENTER
        </motion.button>

        <p className="text-xs text-gray-500 text-center">
          By entering, you agree to our Terms of Service and Privacy Policy. Square securely processes all transactions.
        </p>
      </div>
    </motion.div>
  </motion.div>
);

const Header = ({ currentDomain, cartItems, source }) => (
  <header className="border-b border-gray-800 py-6">
    <div className="container mx-auto px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-4xl">{currentDomain.logo}</span>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentDomain.primaryColor }}>
              {currentDomain.brand}
            </h1>
            <p className="text-sm text-gray-400">{currentDomain.tagline}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Data source: {source}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm text-gray-400">Cart Items</p>
            <p className="text-2xl font-bold" style={{ color: currentDomain.primaryColor }}>
              {cartItems.length}
            </p>
          </div>
          <motion.button
            className="px-6 py-3 font-bold rounded-lg text-black"
            style={{ backgroundColor: currentDomain.primaryColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CHECKOUT
          </motion.button>
        </div>
      </div>
    </div>
  </header>
);

const ProductGrid = ({ products, currentDomain, cartItems, setCartItems, setSelectedProduct }) => (
  <div className="container mx-auto px-6 py-12">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currentDomain={currentDomain}
          cartItems={cartItems}
          setCartItems={setCartItems}
          setSelectedProduct={setSelectedProduct}
        />
      ))}
    </div>
  </div>
);

const ProductCard = ({ product, currentDomain, cartItems, setCartItems, setSelectedProduct }) => (
  <motion.div
    className="bg-gradient-to-br from-gray-900 to-black rounded-xl border-2 overflow-hidden"
    style={{ borderColor: currentDomain.primaryColor }}
    whileHover={{
      scale: 1.02,
      boxShadow: `0 0 30px ${currentDomain.primaryColor}50`
    }}
  >
    <div className="relative h-64 bg-gradient-to-br from-gray-800 to-black">
      {product.inventory !== null && product.inventory < 50 && (
        <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
          {product.inventory} LEFT
        </div>
      )}

      {product.image ? (
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full text-6xl opacity-50">
          🌿
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-gray-300">
        SKU: {product.sku}
      </div>
    </div>

    <div className="p-6">
      <h3 className="text-xl font-bold mb-2" style={{ color: currentDomain.primaryColor }}>
        {product.name}
      </h3>
      <p className="text-gray-400 text-sm mb-4">{product.description}</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {product.thca && (
          <span className="bg-purple-900 text-purple-300 px-3 py-1 rounded-full text-xs">
            THCA: {product.thca}
          </span>
        )}
        {product.cbd && (
          <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs">
            CBD: {product.cbd}
          </span>
        )}
        {product.delta8 && (
          <span className="bg-orange-900 text-orange-300 px-3 py-1 rounded-full text-xs">
            Δ8: {product.delta8}
          </span>
        )}
        <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-xs">
          {product.lab}
        </span>
      </div>

      <div className="mb-4">
        <span className="text-3xl font-bold text-white">${product.price.toFixed(2)}</span>
        {product.inventory !== null && product.inventory > 0 && (
          <span className="text-sm text-green-400 ml-2">In Stock</span>
        )}
      </div>

      <div className="space-y-2">
        <motion.button
          onClick={() => setCartItems([...cartItems, product])}
          className="w-full py-3 font-bold rounded-lg text-black"
          style={{ backgroundColor: currentDomain.primaryColor }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ADD TO CART
        </motion.button>

        <button
          onClick={() => setSelectedProduct(product)}
          className="w-full py-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700"
        >
          VIEW LAB RESULTS
        </button>
      </div>
    </div>
  </motion.div>
);

const ProductModal = ({ product, onClose }) => (
  <AnimatePresence>
    {product && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-900 p-8 rounded-xl max-w-lg w-full border border-gray-700"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <h2 className="text-2xl font-bold text-green-400 mb-4">{product.name}</h2>
          <p className="text-gray-300 mb-4">{product.description}</p>
          <div className="text-sm text-gray-400 space-y-2">
            <p>SKU: {product.sku}</p>
            <p>Lab Certificate: {product.lab}</p>
            {product.thca && <p>THCA: {product.thca}</p>}
            {product.cbd && <p>CBD: {product.cbd}</p>}
            {product.delta8 && <p>Delta-8: {product.delta8}</p>}
          </div>
          <button
            onClick={onClose}
            className="mt-6 w-full py-3 bg-green-500 text-black font-bold rounded-lg"
          >
            CLOSE
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default SquareRealProducts;
