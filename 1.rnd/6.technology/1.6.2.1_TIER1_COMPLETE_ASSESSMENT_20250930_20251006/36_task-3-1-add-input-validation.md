#### Task 3.1: Add Input Validation

```javascript
// Install Zod
npm install zod

// Add schemas
import { z } from 'zod';
const voiceRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  userId: z.string().uuid()
});
```
