import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [ageVerified, setAgeVerified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock product data
  useEffect(() => {
    const mockProducts = [
      { id: 1, name: "Blue Dream", type: "Sativa", thc: "18-24%", price: 45, img: "🌿" },
      { id: 2, name: "OG Kush", type: "Indica", thc: "20-25%", price: 50, img: "🌿" },
      { id: 3, name: "Girl Scout Cookies", type: "Hybrid", thc: "22-28%", price: 55, img: "🌿" },
      { id: 4, name: "Sour Diesel", type: "Sativa", thc: "19-25%", price: 48, img: "🌿" },
      { id: 5, name: "Purple Haze", type: "Sativa", thc: "16-20%", price: 42, img: "🌿" },
      { id: 6, name: "Northern Lights", type: "Indica", thc: "18-22%", price: 46, img: "🌿" }
    ];
    setProducts(mockProducts);
  }, []);

  const AgeGate = () => (
    <div className="age-gate">
      <div className="age-gate-content">
        <h1>🌿 Liv Hana</h1>
        <h2>Age Verification Required</h2>
        <p>You must be 21 or older to access this site</p>
        <button onClick={() => setAgeVerified(true)}>
          I am 21 or older
        </button>
        <p className="legal">By entering, you agree to our Terms of Service</p>
      </div>
    </div>
  );

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!ageVerified) {
    return <AgeGate />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌿 Liv Hana</h1>
        <p>Premium Cannabis Marketplace</p>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search strains..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-img">{product.img}</div>
            <h3>{product.name}</h3>
            <span className="type-badge">{product.type}</span>
            <p className="thc">THC: {product.thc}</p>
            <p className="price">${product.price}</p>
            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart-popup">
          <h2>Cart ({cart.length})</h2>
          {cart.map((item, i) => (
            <div key={i} className="cart-item">
              <span>{item.name} - ${item.price}</span>
              <button onClick={() => removeFromCart(i)}>×</button>
            </div>
          ))}
          <div className="cart-total">
            <strong>Total: ${cart.reduce((sum, item) => sum + item.price, 0)}</strong>
          </div>
          <button className="checkout-btn">Checkout</button>
        </div>
      )}
    </div>
  );
}

export default App;
