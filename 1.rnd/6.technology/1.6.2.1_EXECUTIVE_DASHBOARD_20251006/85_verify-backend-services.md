## Verify Backend Services

Ensure all services are running:

```bash
# Integration Service (Port 3005)
curl http://localhost:3005/health

# Cannabis Service (Port 3003)
curl http://localhost:3003/health

# Payment Service (Port 3004)
curl http://localhost:3004/health

# Voice Service (Port 4001)
curl http://localhost:4001/health

# Reasoning Gateway (Port 4002)
curl http://localhost:4002/health

# Product Service (Port 3002)
curl http://localhost:3002/health
```

---
