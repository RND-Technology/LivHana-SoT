## 🔧 API Endpoints

All endpoints at `/api/improvements`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/metrics` | GET | Metrics dashboard |
| `/proposals` | GET | All proposals |
| `/proposals/:id` | GET | Single proposal |
| `/proposals/:id/approve` | POST | Approve proposal |
| `/proposals/:id/reject` | POST | Reject proposal |
| `/proposals/:id/execute` | POST | Execute approved |
| `/analyze` | POST | Trigger manual analysis |
| `/health` | GET | Health check |
