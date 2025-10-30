### Programmatic Usage

```javascript
import VideoProductionPipeline from './video-production-pipeline.mjs';

const pipeline = new VideoProductionPipeline();

// Produce single episode
const result = await pipeline.produceEpisode(1);
console.log('Episode complete:', result.gcsUrl);
console.log('Cost:', result.cost.total);

// Batch production
const results = await pipeline.produceBatch(1, 5);
console.log(`Completed: ${results.filter(r => r.status === 'completed').length}/5`);
```

---
