# Extracted Decisions Index

**Status:** Active  
**Source:** Current Chat Session Only  
**Last Updated:** 2025-09-28T12:00:00Z  
**Maintainer:** Liv Hana (AI EA)

---

## Decision Cluster Enumeration

This table enumerates each major architectural and operational decision cluster extracted from the current chat session, along with status and source references.

| Decision Cluster | Status | Existing ADR | New ADR Candidate | Source Citation | Summary |
|------------------|--------|--------------|-------------------|-----------------|---------|
| **Dashboard Command Center** | Implemented | ADR-002 | N/A | Chat Session (Current) | Herbitrage monitoring dashboard with 3-column grid mixing system and business tiles |
| **Deterministic CI Pipeline** | Planned | ADR-003 (Referenced) | N/A | Chat Session (Current) | Playwright MCP pipeline with test taxonomy and mocking strategy |
| **Multi-Model Router Baseline** | Design Phase | None | ADR-004 (Proposed) | Chat Session (Current) | AI model routing with scoring formula, p95 targets, and fallback ladder |
| **Verification Suite Structure** | Active | None | ADR-005 (Proposed) | Chat Session (Current) | Comprehensive check scripts catalog with fail conditions and CI gating |
| **Scheduler Operations** | Implemented | None | ADR-006 (Proposed) | Chat Session (Current) | T-90/T-30/High-Noon orchestration with environment vars and exit codes |
| **Snapshot Specification** | Design Phase | None | ADR-007 (Proposed) | Chat Session (Current) | Memory governance schema with freshness SLA and failure escalation |
| **Knowledge Pipeline Architecture** | Draft | None | ADR-008 (Draft) | Chat Session (Current) | Transcript ingestion: raw → normalized → distilled → ADR promotion |
| **Triumvirate Deprecation** | Decision Made | None | ADR-009 (Proposed) | Chat Session (Current) | Consolidation rationale eliminating Potential/Kinetic/Entropic fragmentation |
| **Copilot Organizational Instructions** | Accepted | docs/copilot/ADR-copilot-organizational-instructions.md | N/A | Historical | Custom instructions for verification-over-generation principle |
| **E2E Mission Critical Lessons** | Documented | docs/copilot/adr-chat-20250928.md | N/A | Chat Session (Sept 28) | GitHub Enterprise troubleshooting and durable knowledge practices |
| **System Charter Consolidation** | In Progress | None | ADR-010 (Proposed) | Chat Session (Current) | Prime directives and Single Source of Truth enforcement |
| **Metric Taxonomy** | Implemented | ADR-002 | N/A | Chat Session (Current) | Custom GCP metrics for herbitrage monitoring with tile grouping |

## Status Definitions

- **Implemented:** Decision is active and deployed in production
- **Design Phase:** Architecture defined, implementation pending
- **Planned:** Roadmap item with clear requirements
- **Draft:** Initial proposal requiring review and approval
- **Decision Made:** Conceptual agreement, documentation pending
- **In Progress:** Active development or documentation work
- **Documented:** Complete ADR exists and is accepted

## ADR Numbering

- **ADR-001:** E2E Mission (Historical)
- **ADR-002:** Dashboard Command Center (Root level)
- **ADR-003:** Deterministic CI Playwright (Referenced, location TBD)
- **ADR-004:** Multi-Model Router (Proposed)
- **ADR-005:** Verification Suite (Proposed)
- **ADR-006:** Scheduler Operations (Proposed)
- **ADR-007:** Snapshot Specification (Proposed)
- **ADR-008:** Knowledge Pipeline (Draft - this document)
- **ADR-009:** Triumvirate Deprecation (Proposed)
- **ADR-010:** System Charter Consolidation (Proposed)

## Source Citation Disclaimer

**Current Session Only:** All decisions listed above are extracted from the current GitHub Copilot chat session context. No historical chat conversations beyond the current session are accessible or enumerated by this process.

## Verification Hooks

This index is validated by:
- `automation/scripts/validate_context_integrity.sh` - Cross-reference verification
- Manual review of decision completeness during knowledge promotion sessions

## Next Actions

1. **Immediate:** Complete summaries for each decision cluster (files in this directory)
2. **Short-term:** Draft formal ADRs for items marked as "Proposed"  
3. **Medium-term:** Implement verification script for automated consistency checking
4. **Long-term:** Establish automated decision extraction pipeline

---

**Note:** This index serves as the master catalog for all architectural decisions surfaced in the current knowledge extraction session.