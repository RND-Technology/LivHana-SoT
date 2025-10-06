import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Chip,
  Rating,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { ShoppingCart, LocalOffer, Verified } from '@mui/icons-material';

const INTEGRATION_SERVICE_URL = import.meta.env.VITE_INTEGRATION_SERVICE_URL || 'https://integration-service-980910443251.us-central1.run.app';

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch from LightSpeed via integration-service
      const response = await axios.get(`${INTEGRATION_SERVICE_URL}/api/lightspeed/products`);
      setProducts(response.data.products || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Unable to load products from LightSpeed. Please try again.');
      // Fallback to demo products
      setProducts(getDemoProducts());
    } finally {
      setLoading(false);
    }
  };

  const getDemoProducts = () => [
    {
      id: 'demo-1',
      name: 'Premium Flower - Blue Dream',
      description: 'Hybrid strain with balanced effects. Perfect for daytime use.',
      price: 45.00,
      category: 'Flower',
      thc: '22%',
      cbd: '0.5%',
      strain: 'Hybrid',
      image: 'https://via.placeholder.com/300x200?text=Blue+Dream',
      inStock: true,
      rating: 4.8,
      reviews: 127
    },
    {
      id: 'demo-2',
      name: 'Live Resin Cart - Gelato',
      description: 'Full spectrum live resin cartridge. Rich terpene profile.',
      price: 60.00,
      category: 'Vaporizers',
      thc: '85%',
      cbd: '1%',
      strain: 'Indica',
      image: 'https://via.placeholder.com/300x200?text=Gelato+Cart',
      inStock: true,
      rating: 4.9,
      reviews: 89
    },
    {
      id: 'demo-3',
      name: 'CBD Tincture - 1000mg',
      description: 'Full spectrum CBD oil. Lab tested and organic.',
      price: 75.00,
      category: 'Tinctures',
      thc: '0.3%',
      cbd: '1000mg',
      strain: 'CBD',
      image: 'https://via.placeholder.com/300x200?text=CBD+Tincture',
      inStock: true,
      rating: 4.7,
      reviews: 203
    }
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.name} added to cart!`);
  };

  const ProductCard = ({ product }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Typography variant="h6" component="div">
            {product.name}
          </Typography>
          <Chip
            icon={<LocalOffer />}
            label={`$${product.price.toFixed(2)}`}
            color="primary"
            size="small"
          />
        </Box>

        <Box sx={{ mb: 1 }}>
          <Chip label={product.category} size="small" sx={{ mr: 0.5 }} />
          <Chip label={product.strain} size="small" variant="outlined" />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <Typography variant="caption">
            <strong>THC:</strong> {product.thc}
          </Typography>
          <Typography variant="caption">
            <strong>CBD:</strong> {product.cbd}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Rating value={product.rating} precision={0.1} size="small" readOnly />
          <Typography variant="caption">
            ({product.reviews} reviews)
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCart />}
          onClick={() => addToCart(product)}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Premium Cannabis Products
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Powered by LightSpeed POS • Real-time inventory
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {cart.length > 0 && (
        <Alert severity="success" icon={<ShoppingCart />} sx={{ mb: 3 }}>
          {cart.length} item(s) in cart
        </Alert>
      )}

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      {products.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No products available at this time
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// Optimized: 2025-10-03
// LightSpeed Integration: Live product sync via integration-service
