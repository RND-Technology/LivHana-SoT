### Centralized Styling

```
src/theme/styles.js (SINGLE SOURCE OF TRUTH)

export const cardStyles = {
  glass: {
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 2,
  },
  // ... more card styles
};

export const buttonStyles = {
  primary: {
    backgroundColor: '#16A34A',
    '&:hover': { backgroundColor: '#15803D' },
  },
  // ... more button styles
};

export const layoutStyles = {
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ... more layout styles
};

USAGE IN COMPONENTS:

import { cardStyles, buttonStyles } from '../theme/styles';

<Card sx={cardStyles.glass}>              ← Reference, not inline
<Button sx={buttonStyles.primary}>        ← Reference, not inline
<Box sx={layoutStyles.flexCenter}>        ← Reference, not inline

RESULT: 327 inline instances → ~50 references
        Single source of truth
        Change once, update everywhere
        8KB bundle reduction
```

---
