import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Slider, Typography } from '@mui/material';
import axios from 'axios';
import { useSoundCue } from '../hooks/useSoundCue.js';

const metricMarks = [
  { value: 1, label: '1' },
  { value: 5, label: '5' },
];

const createInitialMetrics = () => ({ look: 3, smell: 3, taste: 3, effect: 3 });

export const ReviewModal = ({ open, onClose, productId, memberId }) => {
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [metrics, setMetrics] = useState(createInitialMetrics);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { playSoftCue, playAttentionCue } = useSoundCue();

  const handleMetricChange = (name) => (_event, value) => {
    setMetrics((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await axios.post(`/api/product/${productId}/reviews`, {
        memberId,
        payload: {
          headline,
          body,
          metrics,
        },
      });
      await playSoftCue();
      setHeadline('');
      setBody('');
      setMetrics(createInitialMetrics());
      onClose();
    } catch (submissionError) {
      setError(submissionError.response?.data?.error ?? submissionError.message);
      await playAttentionCue();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" data-testid="review-modal">
      <DialogTitle>Share Your Experience</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Headline"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
          />
          <TextField
            label="Tell us about it"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            multiline
            minRows={3}
          />
          {Object.entries(metrics).map(([name, value]) => (
            <Stack key={name} spacing={1}>
              <Typography variant="subtitle2">{name.toUpperCase()}</Typography>
              <Slider
                value={value}
                onChange={handleMetricChange(name)}
                step={0.5}
                marks={metricMarks}
                min={1}
                max={5}
                valueLabelDisplay="auto"
              />
            </Stack>
          ))}
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting} variant="contained" color="primary">
          {submitting ? 'Submitting…' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
