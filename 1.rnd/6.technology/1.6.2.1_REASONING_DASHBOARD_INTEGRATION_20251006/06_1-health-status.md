### 1. Health & Status

- **GET** `/health` - Service health check (no auth)

  ```bash
  curl http://localhost:4002/health
  # Response: {"status":"healthy","service":"reasoning-gateway","queue":"voice-mode-reasoning-jobs"}
  ```
