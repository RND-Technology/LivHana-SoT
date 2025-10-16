### Service Inventory

| Service | Port | Queue | Cache | DB | Status |
|---------|------|-------|-------|-----|--------|
| **reasoning-gateway** | 4002 | BullMQ (Redis) | Redis | BigQuery (memory) | Production Ready |
| **integration-service** | 3005 | Bull (Redis) | In-Memory (30s) | BigQuery | Production Ready |
| **voice-service** | N/A | Redis | Redis | N/A | Production Ready |
| **product-service** | N/A | N/A | N/A | N/A | Dormant |
| **payment-service** | N/A | N/A | N/A | N/A | Dormant |
| **cannabis-service** | N/A | N/A | N/A | N/A | Dormant |
