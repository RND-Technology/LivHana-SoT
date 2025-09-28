# Knowledge Base Pipeline ADR (Draft)

**Status:** Draft  
**Proposed ADR Number:** ADR-008  
**Source:** Current Chat Session  
**Last Updated:** 2025-09-28T12:00:00Z  
**Authors:** Jesse Niesen, Liv Hana (AI EA)

---

## Status
**DRAFT** - Requires review and approval before implementation

## Context

The Liv Hana project requires a systematic approach to capturing, processing, and promoting architectural knowledge from various sources (chat sessions, documentation updates, troubleshooting sessions) into durable, version-controlled documentation. This addresses the Single Source of Truth doctrine and ensures critical insights aren't lost in ephemeral communications.

### Current Challenges
- Critical architectural decisions buried in chat transcripts
- Inconsistent documentation practices across team members
- Manual knowledge promotion creates bottlenecks and delays
- No systematic way to extract and validate decision content
- Risk of knowledge loss when key personnel change

### Success Criteria for Pipeline
- Automated ingestion of chat transcripts and conversation logs
- Systematic extraction of architectural decisions and action items
- Consistent formatting and cross-referencing of knowledge artifacts
- Verification-first approach ensuring all references are valid
- Seamless integration with existing ADR and issue management processes

## Decision

Implement a four-stage Knowledge Base Pipeline: **Raw → Normalized → Distilled → Promoted**

### Stage 1: Raw Ingestion
**Purpose:** Capture and store raw conversation data from multiple sources  
**Input:** Chat transcripts, meeting recordings, documentation updates  
**Output:** Structured raw data with metadata  
**Automation Level:** Fully automated

#### Data Sources
- GitHub Copilot chat sessions (via export/API when available)
- Team meeting transcripts
- Slack conversation exports
- Email thread captures
- Troubleshooting session logs

#### Raw Data Schema v1.0
```json
{
  "ingestion_id": "ing_20250928_120000_copilot_001",
  "timestamp": "2025-09-28T12:00:00Z",
  "source_type": "copilot_chat|meeting|slack|email|troubleshooting",
  "source_metadata": {
    "session_id": "copilot_session_abc123",
    "participants": ["jesse_niesen", "liv_hana_ai"],
    "duration_minutes": 240,
    "message_count": 156
  },
  "raw_content": {
    "format": "markdown|json|plain_text",
    "content": "# Architectural Decision Record...",
    "encoding": "utf-8",
    "size_bytes": 45632
  },
  "security_scan": {
    "pii_detected": false,
    "secrets_detected": false,
    "compliance_flags": []
  }
}
```

#### Security & Privacy
- **PII Redaction:** Automatic detection and redaction of personally identifiable information
- **Secret Scanning:** Detection and removal of API keys, tokens, or credentials
- **Compliance Filtering:** 21+ content validation and medical claim detection

### Stage 2: Normalization
**Purpose:** Clean, structure, and standardize raw data into consistent format  
**Input:** Raw ingestion data  
**Output:** Structured conversations with semantic markup  
**Automation Level:** Semi-automated with human review

#### Normalization Process
1. **Content Cleaning**
   - Remove noise (typing indicators, system messages)
   - Fix formatting inconsistencies
   - Normalize timestamps and speaker identification

2. **Semantic Markup**
   - Identify decision points and action items
   - Tag architectural discussions vs operational content  
   - Mark compliance-related conversations
   - Classify urgency and impact levels

3. **Cross-Reference Resolution**
   - Link to existing ADRs, issues, and documentation
   - Resolve file paths and script references
   - Validate external links and dependencies

#### Normalized Data Schema v1.0
```json
{
  "normalized_id": "norm_20250928_120000_001",
  "source_ingestion_id": "ing_20250928_120000_copilot_001",
  "timestamp": "2025-09-28T12:00:00Z",
  "conversation_structure": {
    "total_turns": 78,
    "decision_points": 12,
    "action_items": 8,
    "code_blocks": 15,
    "file_references": 23
  },
  "semantic_markup": {
    "topics": ["knowledge_base", "adr_creation", "verification_scripts"],
    "decisions": [
      {
        "id": "dec_001",
        "summary": "Create docs/copilot/ knowledge base directory",
        "impact": "high",
        "status": "decided",
        "references": ["ADR-002", "verification_suite"]
      }
    ],
    "action_items": [
      {
        "id": "act_001", 
        "description": "Create 12 knowledge base documentation files",
        "assignee": "liv_hana_ai",
        "priority": "high",
        "due_date": "2025-09-28"
      }
    ]
  },
  "quality_metrics": {
    "completeness_score": 0.85,
    "coherence_score": 0.92,
    "actionability_score": 0.78
  }
}
```

### Stage 3: Distillation  
**Purpose:** Extract actionable insights and create draft documentation  
**Input:** Normalized conversation data  
**Output:** Draft ADRs, issues, and documentation updates  
**Automation Level:** AI-assisted with human oversight

#### Distillation Algorithms
1. **Decision Extraction**
   - Pattern matching for architectural decision language
   - Context analysis for decision rationale and consequences
   - Impact assessment based on system component references

2. **Documentation Generation**
   - Auto-generate draft ADR structure with decision content
   - Create issue templates for action items
   - Generate cross-reference maps between decisions

3. **Verification Requirements**  
   - Identify referenced scripts, files, and dependencies
   - Generate verification checklist for each decision
   - Flag missing or inconsistent references

#### Distilled Output Schema v1.0
```json
{
  "distilled_id": "dist_20250928_120000_001",
  "source_normalized_id": "norm_20250928_120000_001", 
  "timestamp": "2025-09-28T12:00:00Z",
  "extracted_artifacts": {
    "draft_adrs": [
      {
        "proposed_number": "ADR-008",
        "title": "Knowledge Base Pipeline Architecture",
        "status": "draft",
        "content": "# ADR-008: Knowledge Base Pipeline...",
        "confidence_score": 0.88
      }
    ],
    "github_issues": [
      {
        "title": "Implement knowledge base ingestion scripts",
        "labels": ["enhancement", "automation", "documentation"],
        "assignee": "engineering_team",
        "content": "## Summary\nCreate automated scripts...",
        "confidence_score": 0.91
      }
    ],
    "verification_requirements": [
      {
        "type": "script_exists",
        "path": "automation/scripts/verify_knowledge_base.sh",
        "status": "missing",
        "priority": "high"
      }
    ]
  },
  "quality_assessment": {
    "completeness": 0.87,
    "accuracy": 0.82,
    "actionability": 0.89,
    "verification_coverage": 0.76
  }
}
```

### Stage 4: Promotion
**Purpose:** Review, approve, and integrate distilled content into official documentation  
**Input:** Distilled artifacts and verification results  
**Output:** Merged ADRs, created issues, updated documentation  
**Automation Level:** Manual approval with automated integration

#### Promotion Workflow
1. **Human Review**
   - Technical accuracy validation
   - Business impact assessment
   - Compliance and security review
   - Stakeholder approval process

2. **Integration Automation**
   - ADR numbering and file placement
   - GitHub issue creation with proper labels/assignments
   - Cross-reference updates across documentation
   - Verification script execution and validation

3. **Post-Promotion Validation**
   - Ensure all links are functional
   - Verify referenced scripts exist or are created
   - Confirm integration with existing processes
   - Update knowledge base index and catalogs

## Implementation Architecture

### Pipeline Components

#### 1. Ingestion Service (`ingest_chat.sh`)
```bash
#!/usr/bin/env bash
# Chat ingestion service
set -euo pipefail

source "$(dirname "$0")/common.sh"

INGESTION_DIR="${INGESTION_DIR:-ingestion/raw}"
ensure_dir "$INGESTION_DIR"

ingest_copilot_chat() {
    local chat_file="$1"
    local ingestion_id="ing_$(date +%Y%m%d_%H%M%S)_copilot_$(basename "$chat_file")"
    
    log_info "Ingesting chat file: $chat_file"
    
    # Security scan
    if scan_for_secrets "$chat_file"; then
        log_error "Secrets detected in $chat_file - ingestion blocked"
        return 1
    fi
    
    # Create ingestion record
    create_ingestion_record "$ingestion_id" "$chat_file"
    
    log_info "Chat ingested successfully: $ingestion_id"
}
```

#### 2. Normalization Engine (`normalize_chat.py`)
```python
#!/usr/bin/env python3
"""
Chat normalization engine
Processes raw ingestion data into structured format
"""
import json
import re
from datetime import datetime
from typing import Dict, List, Any

class ChatNormalizer:
    def __init__(self, config_file: str = "normalization_config.json"):
        self.config = self._load_config(config_file)
        
    def normalize_chat(self, raw_ingestion_path: str) -> Dict[str, Any]:
        """Normalize raw chat data into structured format"""
        raw_data = self._load_raw_data(raw_ingestion_path)
        
        return {
            "normalized_id": self._generate_id("norm"),
            "source_ingestion_id": raw_data["ingestion_id"],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "conversation_structure": self._analyze_structure(raw_data),
            "semantic_markup": self._extract_semantics(raw_data),
            "quality_metrics": self._assess_quality(raw_data)
        }
        
    def _extract_decisions(self, content: str) -> List[Dict[str, Any]]:
        """Extract architectural decisions from conversation"""
        decision_patterns = [
            r"(?i)decision:?\s*(.+)",
            r"(?i)we (?:will|should|must)\s+(.+)",
            r"(?i)adr[- ]?\d+:?\s*(.+)"
        ]
        # Decision extraction logic...
```

#### 3. Decision Extractor (`extract_decisions.py`)
```python
#!/usr/bin/env python3
"""
Decision extraction and ADR generation
"""
from typing import Dict, List, Any
import openai  # For AI-assisted extraction

class DecisionExtractor:
    def __init__(self):
        self.adr_template = self._load_adr_template()
        
    def extract_and_generate_adr(self, normalized_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract decisions and generate draft ADR"""
        decisions = self._identify_decisions(normalized_data)
        
        if not decisions:
            return {"status": "no_decisions_found"}
            
        # Generate ADR content
        adr_content = self._generate_adr_content(decisions)
        
        return {
            "distilled_id": self._generate_id("dist"),
            "extracted_artifacts": {
                "draft_adrs": [adr_content],
                "github_issues": self._generate_issues(decisions),
                "verification_requirements": self._extract_verification_needs(decisions)
            }
        }
```

#### 4. Verification Engine (`verify_knowledge_base.sh`)
```bash
#!/usr/bin/env bash
# Knowledge base verification
set -euo pipefail

source "$(dirname "$0")/common.sh"

verify_knowledge_base() {
    local knowledge_dir="${1:-docs/copilot}"
    
    log_info "Verifying knowledge base in: $knowledge_dir"
    
    # Check file completeness
    check_required_files "$knowledge_dir"
    
    # Validate cross-references
    validate_cross_references "$knowledge_dir"
    
    # Verify script references
    verify_script_references "$knowledge_dir"
    
    # Check schema compliance
    validate_document_schemas "$knowledge_dir"
    
    log_info "Knowledge base verification complete"
}
```

## Open Questions & Future Considerations

### Technical Questions
1. **Chat Export Format:** What format will GitHub Copilot chat exports use?
2. **Storage Backend:** File system vs database for pipeline data?
3. **AI Model Selection:** Which models for decision extraction and content generation?
4. **Integration Points:** How to integrate with existing CI/CD pipelines?

### Process Questions  
1. **Review Cadence:** How often should distilled content be reviewed?
2. **Approval Authority:** Who has authority to promote draft ADRs?
3. **Version Control:** How to handle updates to promoted content?
4. **Rollback Procedures:** How to handle errors in promoted content?

### Scalability Considerations
1. **Volume Handling:** Processing large conversation archives
2. **Performance Requirements:** Real-time vs batch processing needs
3. **Storage Requirements:** Long-term archival and retrieval strategy
4. **Multi-tenant Support:** Supporting multiple projects/teams

## Consequences

### Positive Consequences
- **Systematic Knowledge Capture:** No more lost insights from important conversations
- **Consistent Documentation:** Standardized format and quality across all knowledge artifacts
- **Verification-First:** All decisions include verification requirements and scripts
- **Traceability:** Clear audit trail from conversation to official documentation
- **Scalability:** Pipeline can handle increasing volume of conversations and decisions

### Negative Consequences  
- **Initial Overhead:** Significant development effort to implement pipeline
- **Process Dependencies:** Team must adapt to new knowledge promotion workflows  
- **Quality Variations:** AI-generated content may require significant human review
- **Tool Dependencies:** Relies on availability of chat export capabilities
- **Maintenance Burden:** Pipeline components require ongoing maintenance and updates

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
- [ ] Create basic ingestion scripts for manual chat file processing
- [ ] Implement security scanning and PII redaction
- [ ] Develop normalization engine with basic structure analysis
- [ ] Create verification script for knowledge base validation

### Phase 2: Automation (Weeks 3-4)  
- [ ] Implement AI-assisted decision extraction
- [ ] Create draft ADR generation capabilities
- [ ] Develop GitHub issue creation automation
- [ ] Build cross-reference validation system

### Phase 3: Integration (Weeks 5-6)
- [ ] Integrate with existing CI/CD pipelines
- [ ] Create monitoring and alerting for pipeline health
- [ ] Implement automated promotion workflows
- [ ] Develop quality metrics and reporting

### Phase 4: Enhancement (Weeks 7-8)
- [ ] Add support for multiple conversation sources
- [ ] Implement advanced AI models for better extraction
- [ ] Create web interface for pipeline management
- [ ] Add predictive analytics for knowledge gaps

## Verification Scripts

The following scripts must exist and pass for this ADR to be considered complete:

- `automation/scripts/ingest_chat.sh` - Chat ingestion with security validation
- `automation/scripts/normalize_chat.py` - Content normalization and structure
- `automation/scripts/extract_decisions.py` - Decision extraction and ADR generation  
- `automation/scripts/verify_knowledge_base.sh` - Knowledge base validation
- `automation/scripts/promote_knowledge.sh` - Automated promotion workflow

## References

- Single Source of Truth (SSoT) doctrine
- [ADR-001: E2E Mission](../ADR_INDEX.md)
- [docs/copilot/README.md](./README.md) - Knowledge base structure and guidelines
- [docs/copilot/VERIFICATION_SUITE_SUMMARY.md](./VERIFICATION_SUITE_SUMMARY.md) - Verification patterns

---

**Next Actions:**
1. Review and refine this draft ADR with stakeholders
2. Assign official ADR number once approved
3. Begin Phase 1 implementation with basic ingestion capabilities
4. Create detailed technical specifications for each pipeline component
5. Establish success metrics and acceptance criteria for each implementation phase