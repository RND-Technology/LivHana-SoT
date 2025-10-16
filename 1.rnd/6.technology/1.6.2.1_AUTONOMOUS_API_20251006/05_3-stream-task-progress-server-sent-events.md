### 3. Stream Task Progress (Server-Sent Events)

Real-time streaming of task progress using SSE.

**Endpoint:** `GET /api/autonomous/stream/:taskId`

**Response:** `200 OK` (text/event-stream)

```
data: {"id":"550e8400...","status":"analyzing","progress":10,"currentStep":"Analyzing task requirements"}

data: {"id":"550e8400...","status":"planning","progress":25,"currentStep":"Creating execution plan"}

data: {"id":"550e8400...","status":"executing","progress":40,"currentStep":"Step 1/5: read_file"}

data: {"id":"550e8400...","status":"executing","progress":52,"currentStep":"Step 2/5: write_file"}

: heartbeat

data: {"id":"550e8400...","status":"completed","progress":100}
```

**Example JavaScript:**

```javascript
const eventSource = new EventSource(
  'http://localhost:4002/api/autonomous/stream/550e8400-e29b-41d4-a716-446655440000',
  {
    headers: {
      'Authorization': 'Bearer ' + adminToken
    }
  }
);

eventSource.onmessage = (event) => {
  const task = JSON.parse(event.data);
  console.log(`Progress: ${task.progress}% - ${task.currentStep}`);

  if (task.status === 'completed') {
    console.log('Task completed:', task.result);
    eventSource.close();
  }
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};
```

**Example cURL:**

```bash
curl -N http://localhost:4002/api/autonomous/stream/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---
