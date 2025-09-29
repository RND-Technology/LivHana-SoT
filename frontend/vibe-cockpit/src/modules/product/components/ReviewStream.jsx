import React from 'react';
import { Card, CardContent, Typography, Button, Divider, Stack, Box, Chip } from '@mui/material';

export const ReviewStream = ({ metrics, reviews = [], onOpenReviewModal }) => (
  <Card data-testid="review-stream">
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Community Reviews</Typography>
        <Button variant="contained" onClick={onOpenReviewModal} data-testid="open-review-modal">
          Write a Review
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Chip label={`Look ${metrics?.look ?? '-'}★`} />
        <Chip label={`Smell ${metrics?.smell ?? '-'}★`} />
        <Chip label={`Taste ${metrics?.taste ?? '-'}★`} />
        <Chip label={`Effect ${metrics?.effect ?? '-'}★`} />
      </Stack>

      <Divider sx={{ my: 2 }} />

      {reviews.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#6b7280' }}>No reviews yet. Be the first to share your experience.</Typography>
      ) : (
        reviews.map((review) => (
          <Box key={review.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle2">{review.author} • {review.date}</Typography>
            {review.headline && (
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{review.headline}</Typography>
            )}
            <Typography variant="body2">{review.body}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip size="small" label={`Look ${review.metrics?.look ?? '-'}`} />
              <Chip size="small" label={`Smell ${review.metrics?.smell ?? '-'}`} />
              <Chip size="small" label={`Taste ${review.metrics?.taste ?? '-'}`} />
              <Chip size="small" label={`Effect ${review.metrics?.effect ?? '-'}`} />
            </Stack>
          </Box>
        ))
      )}
    </CardContent>
  </Card>
);
