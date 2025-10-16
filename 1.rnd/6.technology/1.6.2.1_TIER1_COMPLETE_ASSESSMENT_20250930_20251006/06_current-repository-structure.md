### Current Repository Structure

```
/Users/jesseniesen/LivHana-Trinity-Local/
├── LivHana-SoT/                    # PRIMARY ACTIVE REPO (GitHub synced)
│   ├── backend/                     # 7 microservices
│   │   ├── voice-service/          # ⚠️ AUTH DISABLED
│   │   ├── reasoning-gateway/      # ⚠️ AUTH DISABLED
│   │   ├── integration-service/    # ✅ Active (Square/BigQuery)
│   │   ├── payment-service/        # Cannabis compliance
│   │   ├── product-service/        # Product catalog
│   │   ├── cannabis-service/       # Regulatory
│   │   └── common/                 # Shared auth middleware
│   ├── frontend/
│   │   └── vibe-cockpit/          # React dashboard
│   ├── automation/                 # Data pipelines (Square, LightSpeed)
│   ├── empire/                     # Content engines
│   │   ├── txcoa-engine/          # Texas COA analysis
│   │   ├── compliance-engine/     # Regulatory
│   │   ├── content-engine/        # Marketing
│   │   └── crisis-engine/         # Crisis response
│   ├── infra/                      # Docker configs
│   ├── docs/                       # Extensive ADRs
│   └── legacy/                     # ⚠️ PROBLEM: nested inside SoT
│       ├── kinetic/
│       ├── potential/
│       └── entropic/
├── LivHana-Kinetic/                # Trinity: Workflows/Capabilities
├── LivHana-Potential/              # Trinity: Laws/Forms/Intel
├── LivHana-Entropic/               # Trinity: Products/Logs
└── ocr/                            # OCR processing utilities
```
