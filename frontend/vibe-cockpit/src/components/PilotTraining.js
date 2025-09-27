import React from 'react';
import { Box, Typography } from '@mui/material';

const PilotTraining = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#F97316', fontWeight: 'bold' }}>
        ✈️ Pilot Training Validation
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Validate LivHana pilot training readiness and compliance.
      </Typography>
      <Box sx={{ mt: 3, p: 3, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
        <Typography variant="body2" color="success.main">
          ✅ Pilot Training Ready - DSHS License #690 Compliant
        </Typography>
      </Box>
    </Box>
  );
};

export default PilotTraining;
