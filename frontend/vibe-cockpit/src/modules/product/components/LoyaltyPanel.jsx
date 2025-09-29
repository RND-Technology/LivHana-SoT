import React from 'react';
import { Card, CardContent, Typography, Stack, Chip, Button, Divider } from '@mui/material';

export const LoyaltyPanel = ({ loyalty = {} }) => (
  <Card data-testid="loyalty-panel" sx={{ backgroundColor: '#111827', color: '#f9fafb' }}>
    <CardContent>
      <Typography variant="h6">Loyalty Status</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Tier: {loyalty.tier ?? 'Member'} • Points: {loyalty.points ?? 0}
      </Typography>
      <Typography variant="body2" sx={{ color: '#fbbf24' }}>
        Free Gram Credits: {loyalty.freeGramCredits ?? 0}
      </Typography>

      <Divider sx={{ my: 2, borderColor: '#1f2937' }} />

      <Typography variant="subtitle2">Ways to Earn</Typography>
      <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
        {(loyalty.waysToEarn ?? []).map((item) => (
          <Chip key={item.id} label={item.label} sx={{ backgroundColor: '#1f2937', color: '#d1d5db', width: 'fit-content' }} />
        ))}
      </Stack>

      <Divider sx={{ my: 2, borderColor: '#1f2937' }} />

      <Typography variant="subtitle2">Available Rewards</Typography>
      <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
        {(loyalty.rewards ?? []).map((reward) => (
          <Button key={reward.id} variant="outlined" color="success">
            {reward.label}
          </Button>
        ))}
      </Stack>
    </CardContent>
  </Card>
);
