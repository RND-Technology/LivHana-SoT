### Step 4.2: Update Components to Use Centralized Styles

**Example: ExecutiveDashboard.jsx**

**Before:**

```javascript
<Card
  sx={{
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 2,
  }}
>
```

**After:**

```javascript
import { cardStyles } from '../theme/styles';

<Card sx={cardStyles.glass}>
```

**Before:**

```javascript
<Button
  variant="contained"
  sx={{
    backgroundColor: '#16A34A',
    '&:hover': { backgroundColor: '#15803D' }
  }}
>
```

**After:**

```javascript
import { buttonStyles } from '../theme/styles';

<Button variant="contained" sx={buttonStyles.primary}>
```
