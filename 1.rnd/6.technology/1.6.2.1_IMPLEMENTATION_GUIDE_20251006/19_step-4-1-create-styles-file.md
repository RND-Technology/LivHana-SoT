### Step 4.1: Create Styles File

**File:** `src/theme/styles.js`

```javascript
/**
 * Centralized Style Constants
 * Single source of truth for all component styling
 */

// Card Styles
export const cardStyles = {
  glass: {
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 2,
  },

  glassHover: {
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
  },

  metric: {
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 3,
  },
};

// Button Styles
export const buttonStyles = {
  primary: {
    backgroundColor: '#16A34A',
    color: 'white',
    '&:hover': { backgroundColor: '#15803D' },
    fontWeight: 600,
  },

  secondary: {
    backgroundColor: '#F59E0B',
    color: 'white',
    '&:hover': { backgroundColor: '#D97706' },
    fontWeight: 600,
  },

  danger: {
    backgroundColor: '#EF4444',
    color: 'white',
    '&:hover': { backgroundColor: '#DC2626' },
    fontWeight: 600,
  },

  outline: {
    borderColor: '#374151',
    color: '#E5E7EB',
    '&:hover': { borderColor: '#4B5563' },
  },
};

// Layout Styles
export const layoutStyles = {
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },

  fullHeight: {
    minHeight: '100vh',
  },

  container: {
    maxWidth: 'xl',
    mt: 2,
  },
};

// Typography Styles
export const textStyles = {
  gradient: (from, to) => ({
    background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 800,
  }),

  greenGradient: {
    background: 'linear-gradient(135deg, #16A34A 0%, #F59E0B 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 800,
  },
};

// Icon Button Styles
export const iconButtonStyles = {
  primary: {
    backgroundColor: '#16A34A',
    color: 'white',
    '&:hover': { backgroundColor: '#15803D' },
  },

  danger: {
    backgroundColor: '#EF4444',
    color: 'white',
    '&:hover': { backgroundColor: '#DC2626' },
  },

  warning: {
    backgroundColor: '#F59E0B',
    color: 'white',
    '&:hover': { backgroundColor: '#D97706' },
  },

  neutral: {
    backgroundColor: '#374151',
    color: 'white',
    '&:hover': { backgroundColor: '#4B5563' },
  },
};

// Chip Styles
export const chipStyles = {
  success: {
    bgcolor: '#10B98120',
    color: '#10B981',
    fontWeight: 'bold',
  },

  warning: {
    bgcolor: '#F59E0B20',
    color: '#F59E0B',
    fontWeight: 'bold',
  },

  error: {
    bgcolor: '#EF444420',
    color: '#EF4444',
    fontWeight: 'bold',
  },

  info: {
    bgcolor: '#3B82F620',
    color: '#3B82F6',
    fontWeight: 'bold',
  },
};

// Paper/Container Styles
export const containerStyles = {
  dark: {
    backgroundColor: '#374151',
    p: 2,
    borderRadius: 1,
  },

  darker: {
    backgroundColor: '#1E293B',
    p: 3,
    borderRadius: 2,
  },
};

// Color Palette (for non-MUI components)
export const colors = {
  primary: '#16A34A',
  secondary: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6',
  cyan: '#06B6D4',

  // Grays
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
};

export default {
  cardStyles,
  buttonStyles,
  layoutStyles,
  textStyles,
  iconButtonStyles,
  chipStyles,
  containerStyles,
  colors,
};
```
