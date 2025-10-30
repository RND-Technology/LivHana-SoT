### Layer 2: Backend Services Layer (Cloud Run + GKE)

```
┌─────────────────────────────────────────────────────────────┐
│ BACKEND SERVICES LAYER - Microservices                     │
├─────────────────────────────────────────────────────────────┤
│ integration-service (Cloud Run)                             │
│ ├── LightSpeed POS sync (every 15 min)                     │
│ ├── Leafly API sync (every 30 min)                         │
│ ├── Square catalog sync                                     │
│ ├── Age verification (Veriff)                              │
│ └── BigQuery data warehouse                                │
│                                                             │
│ payment-service (Cloud Run)                                 │
│ ├── KAJA/Authorize.Net (cannabis-compliant)               │
│ ├── Age verification (21+)                                 │
│ ├── State compliance checks                                │
│ └── PCI DSS compliant                                      │
│                                                             │
│ reasoning-gateway (Cloud Run)                               │
│ ├── Claude Sonnet API gateway                             │
│ ├── Autonomous agent orchestration                         │
│ └── Self-improvement loops                                 │
│                                                             │
│ cannabis-service (Cloud Run)                                │
│ ├── Product catalog                                        │
│ ├── COA validation                                         │
│ └── Compliance reporting                                   │
└─────────────────────────────────────────────────────────────┘
```
