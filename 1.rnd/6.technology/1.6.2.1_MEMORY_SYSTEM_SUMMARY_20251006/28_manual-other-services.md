### Manual (Other Services)

```javascript
import { MemoryLearningEngine } from './common/memory/learning-engine.js';

const engine = await MemoryLearningEngine.create({ logger });

// Learn from interaction
await engine.learnFromInteraction('customer-123', {
  message: "I need something for sleep",
  response: "Try Indica strains",
  sentiment: 0.8
});

// Get recommendations
const recs = await engine.getRecommendations('customer-123');
```
