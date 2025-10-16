### PHASE 4: CENTRALIZE STYLING (MEDIUM PRIORITY)

**Create:** `src/theme/styles.js`

```javascript
// Extract common sx patterns
export const cardStyles = {
  glass: {
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 2,
  },
  hover: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
  },
};

export const buttonStyles = {
  primary: {
    backgroundColor: '#16A34A',
    '&:hover': { backgroundColor: '#15803D' },
  },
  danger: {
    backgroundColor: '#EF4444',
    '&:hover': { backgroundColor: '#DC2626' },
  },
};

export const layoutStyles = {
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullHeight: {
    minHeight: '100vh',
  },
};
```

**Refactor Components:**

- Replace inline `sx={{...}}` with `sx={cardStyles.glass}`
- Reduce 327 inline style instances to ~50 references
- Theme becomes single source of truth

**Impact:**

- Bundle: -8KB (deduplicated style objects)
- Consistency: 100% (same styles everywhere)
- Maintenance: Change once, update everywhere
