### Current System Architecture

```
FRONTEND (Vibe Cockpit)
├── React + Vite
├── Voice UI (ElevenLabs integration)
├── Dashboard (health metrics, voice mode)
└── Authentication (JWT-based)

BACKEND SERVICES (7 Total)
├── voice-service (Port 4001)
│   ├── ElevenLabs proxy
│   ├── JWT authentication
│   └── BullMQ job queues
│
├── reasoning-gateway (Port 4002)
│   ├── DeepSeek AI integration
│   ├── Guardrails (compliance, profanity)
│   └── Memory store (Redis)
│
├── integration-service (Port 3005)
│   ├── LightSpeed + KAJA
│   ├── Square API (legacy)
│   └── BigQuery live queries
│
├── payment-service (Port 3003)
│   ├── Square → KAJA migration
│   └── Transaction processing
│
├── product-service (Port 3004)
│   └── Catalog management
│
├── cannabis-service (Port 3006)
│   ├── COA validation
│   └── Compliance checks
│
└── common (Library)
    ├── Auth middleware (JWT)
    ├── Security (XSS, rate limiting)
    ├── Logging (structured)
    └── Queue management (BullMQ)

DATA LAYER
├── BigQuery (11,348 customers, 33,317 transactions)
├── Redis (job queues, memory store)
└── Cloud Storage (COA documents)

AUTOMATION LAYER
├── Fallacy scanner (pre-commit hook)
├── Data validator (BigQuery sync)
└── Dependency scanner (code quality)
```
