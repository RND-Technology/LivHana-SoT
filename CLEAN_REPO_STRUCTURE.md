# �� LivHana-SoT – TIER-1 CLEAN REPOSITORY STRUCTURE

## 💯 100% PURE ARCHITECTURE - REGGIE & DRO APPROVED

```
LivHana-SoT/
├── 📄 README.md                     # Project overview & quickstart
├── 📊 CURRENT_STATUS.md             # Live operational status
├── 🎯 E2E_MISSION.md               # End-to-end mission blueprint
├── 🐳 docker-compose.yml           # Unified service orchestration
├── 📦 package.json                 # Monorepo configuration
├── ⚙️ eslint.config.js             # Code quality standards
├── 🔒 LICENSE                      # MIT License
│
├── 🎨 frontend/                    # Client applications
│   ├── vibe-cockpit/              # Voice-first command center
│   │   ├── src/
│   │   │   ├── components/        # React components (VoiceMode, etc.)
│   │   │   ├── hooks/             # Custom hooks (useReasoningJob)
│   │   │   └── services/          # API integrations
│   │   └── package.json
│   └── README.md
│
├── 🔧 backend/                     # Microservices architecture
│   ├── voice-service/             # ElevenLabs v3 voice engine
│   │   ├── src/                  # Service implementation
│   │   ├── Dockerfile            # Container definition
│   │   └── package.json
│   │
│   ├── reasoning-gateway/        # DeepSeek 33B reasoning
│   │   ├── src/                  # Gateway logic
│   │   ├── Dockerfile            # Container definition
│   │   └── package.json
│   │
│   ├── cannabis-service/         # Cannabis compliance & regulations
│   │   ├── src/
│   │   │   ├── api.py           # Main API endpoints
│   │   │   └── compliance.py    # Age-gate & regulations
│   │   ├── tests/               # Service tests
│   │   └── package.json
│   │
│   ├── payment-service/          # Payment processing
│   │   ├── src/
│   │   │   ├── processor.py     # Core payment logic
│   │   │   ├── cannabis_payment.js # Cannabis-specific
│   │   │   └── ecommerce.py     # E-commerce integration
│   │   └── package.json
│   │
│   ├── integration-service/      # External integrations
│   │   ├── src/
│   │   │   ├── lightspeed.py    # Lightspeed POS
│   │   │   └── business_api.js  # Business APIs
│   │   └── package.json
│   │
│   ├── product-service/          # Product management
│   │   ├── src/                  # Product logic
│   │   ├── prisma/               # Database schema
│   │   └── package.json
│   │
│   ├── common/                   # Shared modules
│   │   ├── auth/                 # JWT authentication
│   │   ├── guardrails/           # Safety filters
│   │   ├── logging/              # Centralized logging
│   │   ├── memory/               # Shared memory module
│   │   ├── queue/                # Redis queue management
│   │   └── validation/           # Input validation
│   │
│   └── shared/                   # Shared resources
│       ├── models/               # Database models
│       ├── utils/                # Utility functions
│       └── middleware/           # Express middleware
│
├── 🤖 automation/                  # Automation & DevOps
│   ├── scripts/                   # Operational scripts
│   │   ├── check_housekeeping_queue.sh  # Tier-1 validation
│   │   ├── check_service_health.sh      # Health monitoring
│   │   ├── check_router_health.sh       # Router status
│   │   ├── tier1_repo_restructure.sh    # Cleanup script
│   │   └── lib_common.sh                # Shared utilities
│   │
│   ├── schedulers/                # Cron jobs
│   │   ├── t-90-prep.sh          # 90-min preparation
│   │   ├── t-30-final-check.sh   # 30-min final check
│   │   └── high-noon-sync.sh     # Daily sync
│   │
│   ├── data-pipelines/            # Data ingestion
│   │   ├── alloydb-ingestion.sh  # AlloyDB sync
│   │   ├── square_ingest_all.ts  # Square POS data
│   │   └── lightspeed_ingest.ts  # Lightspeed data
│   │
│   ├── swarm/                     # Swarm orchestration
│   │   └── deepseek-liv-scale-plan.md
│   │
│   └── tests/                     # Test suites
│       └── playwright/            # E2E tests
│           └── voice-mode.spec.ts
│
├── 🏗️ infra/                       # Infrastructure
│   ├── docker/                    # Docker configurations
│   │   ├── docker-compose.voice-mode.yml
│   │   └── deepseek-stub/        # Mock services
│   │
│   ├── cloud-run/                 # GCP deployments
│   │   ├── attribution-ledger.yaml
│   │   ├── creditsmith.yaml
│   │   └── whatsapp-consent.yaml
│   │
│   └── scripts/                   # Infra scripts
│       ├── start_voice_mode_stack.sh
│       └── stop_voice_mode_stack.sh
│
├── 📚 docs/                        # Documentation
│   ├── architecture/              # ADRs & PRDs
│   │   ├── ADR-001_Alert_Policy_Error_Rate_ENHANCED.md
│   │   ├── ADR-002_Dashboard_Command_Center_ENHANCED.md
│   │   ├── ADR-003_Playwright_MCP_Deterministic_CI_Pipeline.md
│   │   ├── ULTIMATE_ADR_U1_Trinity_Governance.md
│   │   ├── ULTIMATE_ADR_U2_Security_Cannabis_Compliance.md
│   │   └── PRD_Cannabis_Payment.md
│   │
│   ├── governance/                # System governance
│   │   ├── SYSTEM_PROMPT.md
│   │   └── ULTIMATE_SYSTEM_PROMPT_Constitutional_Charter.md
│   │
│   ├── voice/                     # Voice service docs
│   │   └── ElevenLabs_v3_upgrade.md
│   │
│   ├── reasoning/                 # Reasoning docs
│   │   └── deepseek_33b_local.md
│   │
│   └── api/                       # API documentation
│       └── README.md
│
├── 📜 scripts/                     # Top-level scripts
│   ├── dev/                       # Development tools
│   ├── prod/                      # Production scripts
│   │   └── deploy_business.sh
│   └── migration/                 # Migration tools
│       └── security_fix.sh
│
├── 🧪 tests/                       # Global test suites
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── e2e/                       # End-to-end tests
│
├── 🗄️ .archive/                    # Archived files
│   └── duplicates/                # Removed duplicates
│       └── production_ready_cannabis_api.py
│
├── 🗂️ legacy/                      # Legacy repositories (READ-ONLY)
│   ├── kinetic/                   # LivHana-Kinetic snapshot
│   ├── potential/                 # LivHana-Potential snapshot
│   ├── entropic/                  # LivHana-Entropic snapshot
│   └── README.md                  # Legacy documentation
│
└── 🔧 .github/                     # GitHub configuration
    └── workflows/                 # CI/CD pipelines
        └── (pending setup)
```

## 🎯 KEY PRINCIPLES

### ✅ **CLEAN ROOT**
- NO scattered Python/JS files in root
- NO random scripts without proper location
- ALL code organized in proper services

### 📦 **SERVICE BOUNDARIES**
- Each service has its own `package.json`
- Each service has its own `Dockerfile`
- Each service has its own test suite
- Shared code in `backend/common/` or `backend/shared/`

### 🐳 **CONTAINERIZED**
- Every service runs in Docker
- Unified `docker-compose.yml` for local development
- Individual Dockerfiles for production deployment

### 📚 **DOCUMENTATION FIRST**
- ADRs in `docs/architecture/`
- Service docs with each service
- System governance in `docs/governance/`
- API docs in `docs/api/`

### 🧪 **TEST EVERYTHING**
- Unit tests with each service
- Integration tests in `tests/integration/`
- E2E tests with Playwright
- CI/CD with GitHub Actions

### 🔒 **SECURITY & COMPLIANCE**
- JWT authentication (backend/common/auth/)
- Guardrails on all services
- Cannabis compliance validated
- No secrets in code (use 1Password)

## 🚀 **QUICK START**

```bash
# Start all services
docker-compose up

# Run housekeeping check
./automation/scripts/check_housekeeping_queue.sh

# Run tests
npm test

# Deploy to production
./scripts/prod/deploy_business.sh
```

## 💯 **STATUS: TIER-1 CLEAN**

Last Updated: September 29, 2025
Status: **FRESH AND SO CLEAN CLEAN!** 🎉

---
*Maintained by Reggie & Dro - 100% Purity Guaranteed*
