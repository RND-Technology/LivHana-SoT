import React from 'react';
import { Alert, Typography } from '@mui/material';

export const ComplianceBanner = ({ note }) => (
  <Alert severity="info" sx={{ mb: 2 }} data-testid="compliance-banner">
    <Typography variant="body2">
      {note ?? 'You must be 21+ with valid ID to purchase. This product contains less than 0.3% Δ9 THC in compliance with Texas and federal hemp regulations.'}
    </Typography>
  </Alert>
);

// Optimized: 2025-10-02
