### Usage Example

```javascript
import { autonomousAPI } from '@/utils/autonomousApi';

// Execute a task
const result = await autonomousAPI.executeTask(
  "Generate a sales report for Q4 2024",
  { customerId: "CUST-123", priority: "high" },
  true  // requireApproval
);

console.log('Task ID:', result.taskId);
console.log('Status endpoint:', result.statusEndpoint);
console.log('Stream endpoint:', result.streamEndpoint);

// Poll for updates
const task = await autonomousAPI.getTask(result.taskId);
console.log('Task status:', task.status);
console.log('Progress:', task.progress);
```

---
