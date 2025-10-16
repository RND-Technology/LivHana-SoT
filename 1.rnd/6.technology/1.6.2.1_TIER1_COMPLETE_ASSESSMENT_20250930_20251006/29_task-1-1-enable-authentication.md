#### Task 1.1: Enable Authentication

```bash
# Files to modify:
- backend/voice-service/src/index.js
- backend/reasoning-gateway/src/index.js

# Change:
app.use('/api', router);
# To:
app.use('/api', authMiddleware({ logger }), router);
```
