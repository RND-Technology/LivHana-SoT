### API Client Utility

**File**: `frontend/vibe-cockpit/src/utils/autonomousApi.js`

Provides typed API methods:

- `autonomousAPI.executeTask(task, context, requireApproval)`
- `autonomousAPI.getTask(taskId)`
- `autonomousAPI.getTasks(params)`
- `autonomousAPI.cancelTask(taskId)`
- `autonomousAPI.approveTask(taskId, reason)`
- `autonomousAPI.rejectTask(taskId, reason)`
- `autonomousAPI.rollbackTask(taskId, reason)`
- `autonomousAPI.getCapabilities()`
- `autonomousAPI.getLearnings(params)`
- `autonomousAPI.getHealth()`
- `autonomousAPI.createEventSource(taskId)`
