### Services Protected

1. **Integration Service** (Port 3005)
   - All `/api/*` routes
   - Health check endpoint `/health`
   - BigQuery, Square, Membership, Raffle APIs

2. **Reasoning Gateway** (Port 4002)
   - All `/api/*` routes
   - Health check endpoints `/health` and `/healthz`
   - Reasoning, Memory, Autonomous APIs
