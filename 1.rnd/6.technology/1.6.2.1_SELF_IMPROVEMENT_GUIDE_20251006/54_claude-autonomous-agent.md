### Claude Autonomous Agent

```javascript
import { createClaudeAgent } from './claude-autonomous-agent.js';

const agent = createClaudeAgent({ logger });
await agent.executeTask('Implement improvement proposal', { proposalId });
// Agent can execute approved proposals
```
