### Layer 3: Data Layer (BigQuery + Cloud SQL + Memorystore)

```
┌─────────────────────────────────────────────────────────────┐
│ DATA LAYER - Databases + Cache + Warehouse                 │
├─────────────────────────────────────────────────────────────┤
│ BigQuery (Data Warehouse)                                   │
│ ├── cannabis_data dataset                                  │
│ │   ├── lightspeed_menu                                    │
│ │   ├── leafly_menu                                        │
│ │   ├── leafly_deals                                       │
│ │   ├── leafly_products                                    │
│ │   └── square_catalog                                     │
│ └── compliance_data dataset                                │
│     ├── transactions                                        │
│     ├── age_verifications                                  │
│     └── audit_logs                                         │
│                                                             │
│ Cloud SQL (PostgreSQL)                                      │
│ ├── users                                                   │
│ ├── orders                                                  │
│ ├── inventory                                              │
│ └── sessions                                               │
│                                                             │
│ Memorystore (Redis)                                         │
│ ├── Rate limiting                                          │
│ ├── Session cache                                          │
│ └── API response cache                                     │
└─────────────────────────────────────────────────────────────┘
```
