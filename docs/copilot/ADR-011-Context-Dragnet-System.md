---
status: Active
source: Chat History - MCP Final Prep & Implementation Sessions
last_updated: 2025-09-28T15:30:00Z
verification_hooks:
  - automation/scripts/validate_context_dragnet.sh
  - automation/scripts/check_trinity_status.sh
maintainer: Liv Hana AI EA
decision_date: 2025-09-28
---

# ADR-011: Context Dragnet System Implementation

## Status
**ACTIVE** - Critical component for Single Source of Truth architecture

## Context

The Context Dragnet System represents a comprehensive solution for capturing, preserving, and versioning all AI assistant behaviors, chat histories, and architectural knowledge across multiple platforms. This decision emerges from extensive experience with context loss and the critical need for durable knowledge preservation.

### Business Driver
- **Zero-loss context preservation**: Ensure no critical architectural lessons or business decisions are lost in chat sessions
- **Cross-platform integration**: Unify knowledge from ChatGPT5, Claude, Gemini, and Perplexity into single source of truth
- **Version-controlled AI behavior**: Enable systematic evolution and rollback of AI assistant configurations
- **Single Source of Truth enforcement**: Prevent fragmentation of critical business knowledge

## Decision

### Core Architecture: Context Dragnet + Version Control Process

#### 1. Canonical Source of Truth (SoT) Structure
```
Meta Canon = gpt_master_canvas_updated.md
Glue Layer = glue_index.pdf (manages cross-file references)
Policy Canon = digital-sovereignty-complete.md
Compliance Canon = THCASOP.pdf + R&D THCa SOP
Ops Canon = ops_policy_glossary.pdf + OPS context propagation
Training Canon = Liv Hana Pilot Training.pdf
```

#### 2. File Ingest & Diff (Dragnet) Process
- **Pull Sources**: local Mac cockpit, GCP storage, GitHub, Notion, WhatsApp exports, YouTube pipelines
- **Ingest Format**: markdown for prompts, YAML/JSON for config, PDF → text extraction
- **Diff Protocol**: git diff against Replit repo; if mismatch → commit with semantic changelog
- **Version Tags**:
  - `canon-vX.Y` = canonical prompt changes
  - `ops-vX.Y` = policy/compliance updates
  - `rd-vX.Y` = THCa SOP changes
  - `hnc-vX.Y` = High Noon creative context

#### 3. Replit Integration (v0 Cockpit)
- **Repository**: `livhana-cockpit`
- **Branching Model**:
  - `main` = production canonical stack
  - `dev` = live experiment/test
  - `feature/*` = per-agent or per-workflow modules
- **CI/CD**: GitHub Actions → Cloud Build → GCP (Cloud Run + AlloyDB)
- **Secrets Management**: GitHub → Replit (sync nightly)

#### 4. Behavioral Version Control (AI Assistant)
- **Context Packets**:
  - `identity.yaml` → Liv's north star, modes, guardrails
  - `ops.yaml` → TTSA + ACFA policy rules
  - `content.yaml` → HNC satire rules, SEO anchors, dog whistles
  - `commerce.yaml` → raffle, POS, subscriptions
- **Change Discipline**: Every assistant behavior update = PR with what changed, why, cross-refs to canon
- **Audit Trail**: immutable log in GCP (Cloud Audit Logs + Secret Manager)

#### 5. Dragnet Automation
- **Daily Cron** (Cloud Scheduler):
  - Scrape all project sources (files, transcripts, WhatsApp, YouTube)
  - Normalize + hash
  - Compare vs Replit repo
  - If diff → auto-PR with labels: policy, ops, creative, infra
- **Weekly Checkpoint**: RPM dashboard auto-built from latest merged context

## Directory Structure Implementation

```bash
liv-hana-e2e-pipeline/
├── context_dragnet/                    # Primary data collection
│   ├── transcripts/                    # Raw conversation exports
│   │   ├── claude/                     # Claude conversations
│   │   ├── chatgpt/                    # ChatGPT conversations  
│   │   ├── gemini/                     # Gemini conversations
│   │   └── perplexity/                 # Perplexity conversations
│   ├── files/                          # Attached and referenced files
│   ├── canvases/                       # Canvas exports with versions
│   ├── memory/                         # Memory system snapshots
│   └── intelligence/                   # Processed intelligence
├── agent-swarm/                        # Agent coordination system
├── deployment/                         # Infrastructure and deployment
├── search-index/                       # Search and retrieval system
└── api/                               # API endpoints for agent access
```

## Automated Session Harvest System

### Master Export Script (All Platforms)
```bash
#!/bin/bash
# liv-hana-session-harvest.sh
# Complete context dragnet across all AI platforms

set -e

DATE=$(date +%Y-%m-%d_%H-%M-%S)
EXPORT_DIR="liv-hana-e2e-pipeline/context_dragnet"
LOG_FILE="$EXPORT_DIR/logs/harvest_${DATE}.log"

# Create directory structure if not exists
mkdir -p "$EXPORT_DIR"/{transcripts,files,canvases,memory,intelligence,logs}
mkdir -p "$EXPORT_DIR/transcripts"/{claude,chatgpt,gemini,perplexity}

echo "🧠 Starting Liv Hana E2E Context Dragnet - $DATE" | tee "$LOG_FILE"
```

## GitHub Actions Integration

### Hourly Context Sync Workflow
```yaml
name: Sync Context Files

on:
  workflow_dispatch:
  schedule:
    - cron: "0 * * * *"   # hourly

jobs:
  sync-context:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_JSON }}
          export_default_credentials: true
      - name: Sync context files from GCS
        run: |
          mkdir -p docs/context
          gsutil -m rsync -r gs://$GCS_BUCKET/docs/context docs/context
      - name: Commit and push if changes
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add docs/context
          if ! git diff --cached --quiet; then
            git commit -m "Hourly auto-sync docs/context from GCS"
            git push origin main
          else
            echo "No changes to commit."
          fi
```

## Guardrails Enforcement

Always enforce:
- 21+ age-gate; no medical claims
- Reggie & Dro = brands, not characters
- Deschedule Cannabis sativa L (abolish hemp/marijuana split)
- Split lanes: OPS (advocacy), HNC (satire media), R&D (commerce/compliance), HERB (Herbitrage VIP portal)
- Firewall: Issue advocacy only; express advocacy isolated in IE wrapper

## Consequences

### Positive
- **Zero Context Loss**: All architectural decisions and business knowledge preserved in version control
- **Cross-Platform Unification**: Single source of truth spanning multiple AI platforms
- **Automated Compliance**: Built-in guardrails enforcement and audit trails
- **Efficient Knowledge Retrieval**: Semantic search across all historical contexts
- **Systematic AI Evolution**: Version-controlled assistant behavior development

### Negative
- **Storage Costs**: Comprehensive data retention requires significant cloud storage
- **Processing Overhead**: Hourly sync operations consume compute resources
- **Complexity**: Multi-platform integration introduces operational complexity
- **Privacy Considerations**: Comprehensive logging requires careful security controls

## Implementation Priority

1. **Immediate**: Setup basic directory structure and GitHub Actions workflow
2. **Week 1**: Implement automated export scripts for major platforms
3. **Week 2**: Deploy GCS sync integration and monitoring
4. **Week 3**: Enable semantic search and intelligence processing
5. **Month 1**: Full agent swarm coordination system

## Verification Commands

```bash
# Validate context dragnet structure
./automation/scripts/validate_context_dragnet.sh

# Check trinity repository status
./automation/scripts/check_trinity_status.sh

# Verify sync operations
./automation/scripts/validate_gcs_sync.sh
```

## References

- [Context Dragnet Implementation Guide](../Liv_Hana_E2E_Capture_Layer_Implementation.md)
- [MCP Final Prep Session Transcript](../mcp-final-prep)
- [GitHub Actions Context Sync Workflow](../../.github/workflows/sync-context.yml)
- [Copilot Organizational Instructions](./ADR-copilot-organizational-instructions.md)

## Next Actions

1. Execute Replit setup with one-shot script
2. Configure GitHub repository secrets (GCP_PROJECT_ID, GCP_SA_JSON, GCS_BUCKET)
3. Deploy context sync workflows
4. Begin systematic migration of existing chat history to structured format
5. Implement verification hooks and monitoring dashboards

---

**Architect**: Jesse Niesen (CEO), Liv Hana AI EA (System Architect)  
**Stakeholders**: R&D, OPS, HNC, HERB development teams  
**Implementation Status**: Ready for immediate deployment