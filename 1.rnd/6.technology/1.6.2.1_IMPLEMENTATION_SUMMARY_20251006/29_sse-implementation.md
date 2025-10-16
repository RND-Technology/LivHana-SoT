### SSE Implementation

```javascript
// Set headers
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
res.setHeader('X-Accel-Buffering', 'no'); // nginx

// Track clients per task
task.sseClients.push(res);

// Broadcast updates
task.sseClients.forEach(client => {
  client.write(`data: ${JSON.stringify(task)}\n\n`);
});

// Heartbeat every 30s
setInterval(() => res.write(': heartbeat\n\n'), 30000);
```
