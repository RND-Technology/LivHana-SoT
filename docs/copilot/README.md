# Copilot Knowledge Base

**Status:** Active  
**Source:** Chat Session Extraction (Current Session Only)  
**Last Updated:** 2025-09-28T12:00:00Z  
**Maintainer:** Liv Hana (AI EA)

---

## Purpose

This directory captures durable architectural and operational decisions surfaced during GitHub Copilot chat sessions. It satisfies the directive: "promote durable knowledge to version-controlled docs (ADRs, playbooks, runbooks)" and aligns with the Single Source of Truth + verification-over-generation doctrine.

The knowledge base serves as a curated, traceable set of Markdown documents providing Tier 1 completeness for critical system components and operational procedures.

## Provenance & Scope

**Source Limitation:** Only the current chat context is mined for content. No automatic enumeration of historical Copilot conversations is possible from within the assistant.

**Content Categories:**
- System Charter & Prime Directives consolidation
- End-to-End Mission linkage + North Star metrics
- Multi-Model Router baseline design & fallback strategies
- Verification Suite & Check Scripts structure
- Scheduler jobs (snapshot, orchestration, risk review)
- Snapshot specification & memory governance
- Dashboard (Command Center) decisions with metric taxonomy
- Deterministic Playwright CI pipeline
- Knowledge Base ingestion & transcript extraction pipeline
- Triumvirate repo model deprecation rationale

## Guardrails & Security

- **No Secrets:** No raw token strings or credentials are included. Any discovered secret-like patterns are redacted with `[REDACTED]`
- **Traceability:** Each document references source chat session with disclaimer about current session limitation
- **Verification-First:** Each summary references its governing `check_*` script (existing or to-be-created) to avoid unverified speculative drift
- **Cross-Links:** Internal references use relative paths for maintainability

## File Structure

```
docs/copilot/
├── README.md                              # This file
├── EXTRACTED_DECISIONS_INDEX.md           # Decision enumeration table
├── MULTI_MODEL_ROUTER_SUMMARY.md         # Router design & fallback ladder
├── VERIFICATION_SUITE_SUMMARY.md         # Check scripts catalog
├── SCHEDULERS_SUMMARY.md                 # T-90/T-30/High-Noon operations
├── SNAPSHOT_SPEC_REFERENCE.md            # Snapshot schema & SLA
├── DASHBOARD_COMMAND_CENTER_REF.md       # Metric taxonomy (ADR-002)
├── DETERMINISTIC_CI_PLAYWRIGHT_REF.md    # Test taxonomy (ADR-003)
├── KNOWLEDGE_BASE_PIPELINE_ADR_DRAFT.md  # Ingestion architecture draft
├── TRIUNVIRATE_DEPRECATION_NOTES.md      # Consolidation rationale
├── PLAYBOOK_KNOWLEDGE_PROMOTION.md       # Ingestion runbook
└── METRIC_TAXONOMY_QUICKREF.md           # Metrics reference table
```

## Verification Hooks

All content in this directory is validated by:
- `automation/scripts/validate_context_integrity.sh` - Ensures cross-reference consistency
- `automation/scripts/verify_knowledge_base.sh` - (To be created) Validates document structure and completeness

## Usage Guidelines

1. **For Agents:** Reference these documents for architectural context and operational procedures
2. **For Developers:** Use as authoritative source for system design patterns and verification requirements  
3. **For Operations:** Follow playbooks for consistent knowledge promotion and maintenance
4. **For Audits:** Trace decisions back to source documentation and verification scripts

## Next Steps (Not in this PR)

- Add ingestion + extraction scripts (`ingest_chat.sh`, `normalize_chat.py`, `extract_decisions.py`, `verify_knowledge_base.sh`)
- Assign official ADR number to knowledge pipeline once approved
- Populate decision index with hashes referencing future transcript manifest

---

**Disclaimer:** This knowledge base bootstraps the durable knowledge layer from current chat session content only. Further automated or semi-automated ingestion can proceed without architectural ambiguity.