import React from 'react';
import { Alert, AlertTitle, Box, Chip, Stack } from '@mui/material';

const statusColor = (status) => {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'down':
      return 'error';
    default:
      return 'info';
  }
};

export const HealthBanner = ({ voiceStatus, reasoningStatus, queueDepth }) => (
  <Alert severity={statusColor(reasoningStatus)} sx={{ backgroundColor: '#111827', color: '#E5E7EB' }} data-testid="health-banner">
    <AlertTitle>Voice Mode Service Health</AlertTitle>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box>
        <Chip label={`Voice Service: ${voiceStatus}`} color={statusColor(voiceStatus)} variant="outlined" />
      </Box>
      <Box>
        <Chip label={`Reasoning Gateway: ${reasoningStatus}`} color={statusColor(reasoningStatus)} variant="outlined" />
      </Box>
      <Box>
        <Chip label={`Queue Depth: ${queueDepth ?? 'unknown'}`} color="info" variant="outlined" />
      </Box>
    </Stack>
  </Alert>
);

// Optimized: 2025-10-02
