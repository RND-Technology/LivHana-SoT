---
status: Active
source: Stack_Canonical_UNF.md & Herbitrage Cloud Cockpit E2E Architecture
last_updated: 2025-09-28T17:00:00Z
verification_hooks:
  - automation/scripts/validate_canonical_stack.sh
  - automation/scripts/verify_gcp_migration.sh
maintainer: Liv Hana AI EA
decision_date: 2025-09-13
---

# ADR-014: Canonical Stack Architecture (UNF-2 Hardened)

## Status
**ACTIVE** - Production-ready single-cloud architecture for all Liv Hana business divisions

## Context

The Canonical Stack represents a comprehensive architectural decision to standardize on Google Cloud Platform (GCP) as the single source of truth for all four business layers: R&D (Reggie & Dro), HNC (High Noon Cartoon), OPS (One Plant Solution), and HERB (Herbitrage). This decision emerges from operational complexity challenges with multi-provider architectures and the need for unified compliance and monitoring.

### Business Driver
- **Single Source of Truth**: Eliminate architectural fragmentation across business divisions
- **Production Readiness**: Ensure 99.9% uptime with comprehensive monitoring and alerting
- **Compliance Integration**: Built-in 21+ guardrails and NIST-validated cannabinoid tracking
- **Cost Optimization**: Consolidated cloud infrastructure with predictable scaling

## Decision

### Keep/Kill/Adopt Matrix (Single Source of Truth)

#### KEEP (Canonical)
- **Cloud Run** — API + Cockpit (Next.js)
- **AlloyDB (Postgres 15)** — **sole OLTP** (replaces Supabase)
- **BigQuery** — analytics tiles (ROI, funnel, policy KPIs)
- **Cloud Storage (GCS)** — assets/COAs/brand packs
- **Secret Manager** — all keys, rotated quarterly
- **Cloud Scheduler** — daily kickoff & ops jobs
- **Pub/Sub (optional)** — event fan-out; use when multi-consumer appears
- **Monitoring & Logging** — SLOs, alerts, budgets
- **Identity Platform** — 21+ age-gate; OIDC for cockpit

#### ADOPT
- **Lightspeed** — POS/e-com target (migrate from Square)
- **Vertex AI (eval/tooling)** — embeddings/evals as needed
- **M4 MCP Orchestrator** — multi-agent planning/execution brain

#### PHASE-OUT / CANCEL
- **Supabase** — **CANCEL** (OLTP → AlloyDB, Auth → Identity, Storage → GCS)
- **Render** — **PHASE-OUT** (use Cloud Run)
- **Zapier/Make/IFTTT** — **PHASE-OUT** (Cloud Workflows + Pub/Sub)
- **Square** — **TRANSITION** to Lightspeed with 30-day dual-write max

## Data Flow Architecture

### Text DAG Structure
```
Synthesia(input: script JSON) → render → Webhook → API → AlloyDB(videos) + GCS(url)
Claude/OpenAI/Gemini → API → scripts/metadata → AlloyDB
POS (Square→Lightspeed) → API → BigQuery (facts) → Cockpit tiles
COAs/Compliance → GCS (versioned) → Cockpit validator (NIST-only flagging)
Identity Platform(21+) → Cockpit auth → API OIDC → policy & store CTAs
```

### Four-Layer Business Empire Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         JESSE NIESEN CEO PROJECT                            │
│                    Four-Layer Cannabis Business Empire                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   LIV HANA AI   │
                              │ Executive Asst  │
                              │   "Live/Faithful" │
                              └─────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
        ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
        │       R&D       │  │       HNC       │  │       OPS       │
        │  Reggie & Dro   │  │ High Noon Comic │  │ One Plant Sol.  │
        │ TX Retail/Mfg   │  │ Satirical Engine│  │  PAC/Advocacy   │
        │  DSHS #690      │  │ 84-Ep Series    │  │  Policy Hub     │
        └─────────────────┘  └─────────────────┘  └─────────────────┘
                    │                  │                  │
                    └──────────────────┼──────────────────┘
                                       │
                                       ▼
                            ┌─────────────────┐
                            │      HERB       │
                            │   Herbitrage    │
                            │ Commerce/Funnels│
                            │  POS/Memberships│
                            └─────────────────┘
```

## Minimal API Contracts

### Core Service Interfaces
- **Authentication**: Identity Platform OIDC for all 21+ gated services
- **Data Storage**: AlloyDB for transactional data, BigQuery for analytics
- **Asset Management**: GCS for COAs, brand packs, and compliance documentation
- **Integration Layer**: Cloud Run services for external API connectivity

## Cost & Reliability Strategy

### Budget Management
- **Budget Thresholds**: 50% / 80% / 100% alert levels
- **SLO Targets**: API p95 < 400ms; availability 99.9%; error rate <1%
- **Backup Strategy**: AlloyDB PITR + nightly dump to multi-region GCS; BQ table snapshots
- **Cold-path Disable**: Feature flags to disable Synthesia enqueue during incidents

### Monitoring & Alerting
- **Custom Metrics**: Herbitrage-specific tiles for business intelligence
- **Performance Tracking**: SLO monitoring across all service endpoints
- **Cost Monitoring**: Real-time budget alerts with automatic scaling controls

## Compliance Overlay

### 21+ Guardrails Integration
- **Age Gate**: Identity Platform enforcement across cockpit & store
- **Session Blocking**: Automatic termination of underage user sessions
- **Compliance Footer**: Auto-injected across all interfaces: "21+ • No medical claims • Natural cannabinoids; NIST-validated methods"

### Content & Brand Guidelines
- **Brand vs Character Distinction**: Reggie & Dro are brands, not characters
- **Satirical Content Scope**: Satire reserved for public figures only
- **COA Validation**: Versioned uploads with validator flagging non-NIST novel cannabinoid claims

## Mission Architecture Integration

### North Star Mission
**Deschedule Cannabis sativa L entirely** — abolish artificial hemp/marijuana split, with Texas leading as global model of freedom, safety, and prosperity.

### Rally Cries
- **"Grow baby grow and sell baby sell"**
- **"Grow, Sell, Heal"**

### Target Demographics
- **Primary**: Ages 30-60, conservative-leaning, faith-forward, persuadable
- **Secondary**: MAGA base, cannabis-curious conservatives
- **Tertiary**: Trump skeptics (via meta-humor engagement)

## Migration Strategy

### Phase 1: Infrastructure Foundation (Weeks 1-2)
1. Deploy AlloyDB cluster with high availability configuration
2. Set up Cloud Storage buckets with proper IAM and versioning
3. Configure Identity Platform with 21+ age verification
4. Implement monitoring and alerting systems

### Phase 2: Application Migration (Weeks 3-4)
1. Migrate APIs from existing providers to Cloud Run
2. Transition data from Supabase to AlloyDB
3. Configure BigQuery analytics pipelines
4. Test all service integrations

### Phase 3: POS Integration (Weeks 5-6)
1. Begin Lightspeed integration development
2. Maintain dual-write capability with Square (maximum 30 days)
3. Migrate payment processing and inventory management
4. Validate financial reporting accuracy

### Phase 4: Final Cutover (Week 7)
1. Complete Square phase-out
2. Decommission legacy Supabase and Render services
3. Full production traffic on canonical stack
4. Performance and cost optimization

## Consequences

### Positive
- **Architectural Coherence**: Single cloud provider eliminates integration complexity
- **Enhanced Security**: Unified identity and access management through Identity Platform
- **Improved Performance**: Optimized data flows within single cloud environment
- **Cost Predictability**: Consolidated billing and resource management
- **Compliance Simplification**: Built-in 21+ guardrails across all services

### Negative
- **Vendor Lock-in**: High dependency on Google Cloud Platform ecosystem
- **Migration Risk**: Complex transition from multi-provider to single-provider architecture
- **Learning Curve**: Team must gain expertise in GCP-specific services and tooling
- **Single Point of Failure**: Cloud provider outages affect entire business operation

## Verification Commands

```bash
# Validate canonical stack deployment
./automation/scripts/validate_canonical_stack.sh

# Check GCP migration progress
./automation/scripts/verify_gcp_migration.sh

# Test 21+ compliance integration
./automation/scripts/test_age_gate_compliance.sh

# Validate SLO monitoring
./automation/scripts/check_slo_compliance.sh
```

## References

- [Stack Canonical UNF Documentation](../Stack_Canonical_UNF.md)
- [Herbitrage Cloud Cockpit E2E Architecture](../Herbitrage_Cloud_Cockpit_E2E_Architecture.md)
- [Context Dragnet System](./ADR-011-Context-Dragnet-System.md)
- [RPM Visioneering Cascade Framework](./ADR-013-RPM-Visioneering-Cascade.md)

## Next Actions

1. Begin AlloyDB cluster deployment with high availability configuration
2. Set up comprehensive monitoring and alerting systems
3. Start Lightspeed POS integration development
4. Plan staged migration from Supabase to AlloyDB
5. Implement 21+ compliance validation across all services

---

**Owner**: Jesse Niesen  
**Maintainer**: Liv Hana AI EA  
**Scope**: HNC / OPS / R&D / Herbitrage unified architecture  
**Implementation Status**: Production-ready, migration in progress