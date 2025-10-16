### Python

```python
import requests
import time

SWARM_API = 'http://localhost:8080/api/swarm'
API_KEY = 'test'
AGENT_ID = 'orchestrator'

def submit_task(task_type, description, capabilities=None):
    response = requests.post(
        f'{SWARM_API}/tasks',
        headers={
            'X-API-Key': API_KEY,
            'X-Agent-Id': AGENT_ID,
            'Content-Type': 'application/json'
        },
        json={
            'type': task_type,
            'description': description,
            'requiredCapabilities': capabilities or [],
            'priority': 'high'
        }
    )
    return response.json()

def get_task_status(task_id):
    response = requests.get(
        f'{SWARM_API}/status/{task_id}',
        headers={'X-API-Key': API_KEY}
    )
    return response.json()

# Usage
task = submit_task('deployment', 'Deploy service', ['deployment'])
print(f"Task submitted: {task['task']['id']}")

status = get_task_status(task['task']['id'])
print(f"Task status: {status['status']['status']}")
```

---
