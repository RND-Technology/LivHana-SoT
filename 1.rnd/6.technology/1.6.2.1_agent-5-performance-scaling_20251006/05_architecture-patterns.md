### Architecture Patterns

**File**: `/backend/reasoning-gateway/src/index.js`

```javascript
// GOOD: Graceful shutdown handling
process.on('SIGTERM', async () => {
  await reasoningWorker.close();
  await reasoningQueue.close();
  process.exit(0);
});

// GOOD: Queue configuration
const reasoningQueue = new Queue(queueName, queueOptions);
const reasoningWorker = new Worker(queueName, processor, queueOptions);
```

**File**: `/backend/integration-service/src/index.js`

```javascript
// ISSUE: Auth middleware disabled in non-production
if (process.env.NODE_ENV === 'production') {
  app.use('/api', authMiddleware({ logger }));
}
// RISK: Development bypass creates security debt
```
