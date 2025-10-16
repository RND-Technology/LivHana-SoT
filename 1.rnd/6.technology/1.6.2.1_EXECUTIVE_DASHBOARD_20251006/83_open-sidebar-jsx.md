### Open Sidebar.jsx

File: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit/src/components/Sidebar.jsx`

Add a new menu item in the navigation array:

```javascript
import { Assessment } from '@mui/icons-material'; // Add this import

// In the menu items array:
{
  text: 'Executive Dashboard',
  icon: <Assessment />,
  path: '/executive',
  view: 'executive',
},
```

---
