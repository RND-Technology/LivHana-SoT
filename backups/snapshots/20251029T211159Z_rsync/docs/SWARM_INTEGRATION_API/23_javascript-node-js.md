### JavaScript/Node.js

```javascript
const SWARM_API = 'http://localhost:8080/api/swarm';
const API_KEY = 'test';
const AGENT_ID = 'orchestrator';

async function submitTask(type, description, capabilities = []) {
  const response = await fetch(`${SWARM_API}/tasks`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'X-Agent-Id': AGENT_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type,
      description,
      requiredCapabilities: capabilities,
      priority: 'high'
    })
  });

  return response.json();
}

async function getTaskStatus(taskId) {
  const response = await fetch(`${SWARM_API}/status/${taskId}`, {
    headers: { 'X-API-Key': API_KEY }
  });

  return response.json();
}

// Usage
const task = await submitTask('deployment', 'Deploy service', ['deployment']);
console.log('Task submitted:', task.task.id);

const status = await getTaskStatus(task.task.id);
console.log('Task status:', status.status.status);
```
