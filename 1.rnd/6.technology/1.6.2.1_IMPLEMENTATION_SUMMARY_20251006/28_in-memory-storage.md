### In-Memory Storage

Currently using Map for tasks and array for learnings:

```javascript
const tasks = new Map();      // taskId → task object
const learnings = [];         // learning objects
```

**Production Recommendation:** Migrate to Redis for:

- Persistence across restarts
- Distributed task management
- Shared state across instances
