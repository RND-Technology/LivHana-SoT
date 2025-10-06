import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Rating,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Star, ThumbUp, Verified } from '@mui/icons-material';

const INTEGRATION_SERVICE_URL = import.meta.env.VITE_INTEGRATION_SERVICE_URL || 'https://integration-service-980910443251.us-central1.run.app';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    name: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fetch from BigQuery via integration-service
      const response = await axios.get(`${INTEGRATION_SERVICE_URL}/api/reviews/${productId}`);
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      // Fallback to demo reviews
      setReviews(getDemoReviews());
    } finally {
      setLoading(false);
    }
  };

  const getDemoReviews = () => [
    {
      id: '1',
      productId,
      rating: 5,
      title: 'Amazing quality!',
      comment: 'Best product I\'ve tried. Effects are exactly as described.',
      name: 'Sarah M.',
      verified: true,
      helpful: 12,
      created: new Date().toISOString()
    },
    {
      id: '2',
      productId,
      rating: 4,
      title: 'Great for relaxation',
      comment: 'Works well for evening use. Helps with sleep.',
      name: 'Mike D.',
      verified: true,
      helpful: 8,
      created: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Submit to BigQuery via integration-service
      await axios.post(`${INTEGRATION_SERVICE_URL}/api/reviews`, {
        productId,
        ...newReview,
        created: new Date().toISOString()
      });

      setSuccess(true);
      setNewReview({ rating: 5, title: '', comment: '', name: '' });
      fetchReviews(); // Refresh reviews

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ReviewCard = ({ review }) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2 }}>{review.name[0]}</Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">
              {review.name}
              {review.verified && (
                <Chip
                  icon={<Verified />}
                  label="Verified Purchase"
                  size="small"
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={review.rating} size="small" readOnly />
              <Typography variant="caption" color="text.secondary">
                {new Date(review.created).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          {review.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {review.comment}
        </Typography>

        <Button
          size="small"
          startIcon={<ThumbUp />}
          variant="outlined"
        >
          Helpful ({review.helpful})
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Customer Reviews
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Review submitted successfully! It will appear shortly.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Write a Review */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Write a Review
          </Typography>
          <form onSubmit={handleSubmitReview}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Rating
              </Typography>
              <Rating
                value={newReview.rating}
                onChange={(e, value) => setNewReview({ ...newReview, rating: value })}
              />
            </Box>

            <TextField
              fullWidth
              label="Name"
              value={newReview.name}
              onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Review Title"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Your Review"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              multiline
              rows={4}
              required
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <Star />}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Reviews */}
      <Typography variant="h6" gutterBottom>
        Reviews ({reviews.length})
      </Typography>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {reviews.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No reviews yet. Be the first to review this product!
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// Optimized: 2025-10-03
// BigQuery Integration: Review data stored and retrieved via integration-service
