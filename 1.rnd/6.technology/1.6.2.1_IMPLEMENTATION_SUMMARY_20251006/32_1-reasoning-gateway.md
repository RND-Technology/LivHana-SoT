### 1. Reasoning Gateway

```javascript
// src/index.js
import { createAutonomousRouter } from './routes/autonomous.js';

app.use('/api/autonomous',
  authMiddleware({ logger }),
  createAutonomousRouter({ logger, queue: reasoningQueue })
);
```
