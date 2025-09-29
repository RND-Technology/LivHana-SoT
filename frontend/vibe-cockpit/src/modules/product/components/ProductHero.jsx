import React from 'react';
import { Card, CardContent, Typography, Button, Stack, Chip, Divider } from '@mui/material';

export const ProductHero = ({ product, onAddToCart }) => {
  if (!product) {
    return null;
  }

  const { name, complianceNote, pricing = [], inventory = {} } = product;

  return (
    <Card data-testid="product-hero" sx={{ mb: 3, backgroundColor: '#1f2937', color: '#f9fafb' }}>
      <CardContent>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        {complianceNote && (
          <Typography variant="body2" sx={{ mt: 1, color: '#9ca3af' }}>
            {complianceNote}
          </Typography>
        )}

        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          {pricing.map((tier) => (
            <Chip key={tier.sku} label={`${tier.sku} • $${tier.price}`} sx={{ backgroundColor: '#374151', color: '#d1d5db' }} />
          ))}
        </Stack>

        <Typography variant="body2" sx={{ mt: 2, color: '#fbbf24' }}>
          {inventory.status ? `${inventory.status} • ${inventory.available ?? '?'} left` : 'Availability updating'}
        </Typography>

        <Divider sx={{ my: 2, borderColor: '#374151' }} />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary" onClick={onAddToCart}>
            Add to Cart
          </Button>
          <Button variant="outlined" color="secondary">
            Check Availability
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
