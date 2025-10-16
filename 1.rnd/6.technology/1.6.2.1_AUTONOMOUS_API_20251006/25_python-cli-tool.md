### Python CLI Tool

```python
import requests
import json
import time

class AutonomousAgentClient:
    def __init__(self, base_url, auth_token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {auth_token}',
            'Content-Type': 'application/json'
        }

    def execute_task(self, task, context=None, require_approval=True):
        response = requests.post(
            f'{self.base_url}/api/autonomous/execute',
            headers=self.headers,
            json={
                'task': task,
                'context': context or {},
                'requireApproval': require_approval
            }
        )
        return response.json()

    def get_status(self, task_id):
        response = requests.get(
            f'{self.base_url}/api/autonomous/tasks/{task_id}',
            headers=self.headers
        )
        return response.json()

    def wait_for_completion(self, task_id, poll_interval=5):
        while True:
            status = self.get_status(task_id)
            print(f"Progress: {status['progress']}% - {status['currentStep']}")

            if status['status'] in ['completed', 'failed', 'pending_approval']:
                return status

            time.sleep(poll_interval)

# Usage
client = AutonomousAgentClient('http://localhost:4002', 'your-admin-token')
result = client.execute_task('Fix the login bug')
task_id = result['taskId']
final_status = client.wait_for_completion(task_id)
print(f"Task completed: {final_status}")
```

---
