### React Frontend Component

```typescript
import { useState, useEffect } from 'react';

function AutonomousTaskMonitor({ taskId, authToken }) {
  const [task, setTask] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:4002/api/autonomous/stream/${taskId}`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    eventSource.onmessage = (event) => {
      const updatedTask = JSON.parse(event.data);
      setTask(updatedTask);
    };

    return () => eventSource.close();
  }, [taskId, authToken]);

  if (!task) return <div>Loading...</div>;

  return (
    <div>
      <h2>Task: {task.task}</h2>
      <p>Status: {task.status}</p>
      <progress value={task.progress} max="100" />
      <p>{task.currentStep}</p>

      {task.status === 'pending_approval' && (
        <div>
          <button onClick={() => approveTask(taskId, true)}>Approve</button>
          <button onClick={() => approveTask(taskId, false)}>Reject</button>
        </div>
      )}
    </div>
  );
}
```
