import React, { useState } from 'react';
import { Grid, Box, CircularProgress, Typography, Stack } from '@mui/material';
import { ProductHero } from './ProductHero.jsx';
import { ComplianceBanner } from './ComplianceBanner.jsx';
import { ReviewStream } from './ReviewStream.jsx';
import { LoyaltyPanel } from './LoyaltyPanel.jsx';
import { useProductData } from '../hooks/useProductData.jsx';
import { ReviewModal } from './ReviewModal.jsx';

export const ProductPage = ({ productId, memberId }) => {
  const { data, loading, error } = useProductData(productId, { memberId });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  return (
    <Box sx={{ px: 4, py: 3 }} data-testid="product-page">
      {loading && (
        <Stack alignItems="center" sx={{ mb: 2 }}>
          <CircularProgress size={24} />
        </Stack>
      )}
      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error.message ?? 'Failed to load product data'}
        </Typography>
      )}

      <ComplianceBanner note={data.product?.complianceNote} />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <ProductHero
            product={data.product}
            onAddToCart={() => setReviewModalOpen(true)}
          />
          <ReviewStream
            metrics={data.metrics}
            reviews={data.reviews}
            onOpenReviewModal={() => setReviewModalOpen(true)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LoyaltyPanel loyalty={data.loyalty} />
        </Grid>
      </Grid>

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        productId={productId}
        memberId={memberId}
      />
    </Box>
  );
};
