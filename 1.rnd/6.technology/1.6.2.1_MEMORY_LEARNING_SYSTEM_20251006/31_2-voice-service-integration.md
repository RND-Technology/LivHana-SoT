### 2. Voice Service Integration

To integrate with voice service:

```javascript
import { getMemoryLearningEngine } from '../common/memory/learning-engine.js';

async function handleVoiceInteraction(customerId, transcript, aiResponse) {
  const memoryEngine = await getMemoryLearningEngine({ logger });

  await memoryEngine.learnFromInteraction(customerId, {
    message: transcript,
    response: aiResponse,
    channel: 'voice',
    sessionId: req.sessionId,
    timestamp: new Date().toISOString()
  });
}
```
