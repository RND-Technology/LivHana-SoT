### Memory Learning Engine

```javascript
import { getMemoryLearningEngine } from './memory_learning.js';

const memoryEngine = await getMemoryLearningEngine({ logger });
const context = await memoryEngine.getContext(customerId);
// Self-improvement learns from this context
```
