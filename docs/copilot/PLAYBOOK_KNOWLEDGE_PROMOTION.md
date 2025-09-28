# Knowledge Promotion Playbook

**Status:** Active  
**Source:** Current Chat Session + Operational Best Practices  
**Last Updated:** 2025-09-28T12:00:00Z  
**Purpose:** Runbook for manual transcript ingestion and knowledge promotion

---

## Overview

This playbook provides step-by-step procedures for manually ingesting large chat transcripts, extracting architectural decisions and action items, and promoting them to official documentation. It serves as the manual process template until automated pipeline implementation is complete.

## When to Use This Playbook

- **Large Chat Sessions:** >2 hours of architectural discussion
- **Critical Decision Sessions:** Sessions containing multiple ADR-worthy decisions
- **Troubleshooting Sessions:** Sessions with significant operational learnings
- **Strategic Planning:** Sessions defining system direction or major changes
- **Incident Post-mortems:** Sessions with architectural lessons from incidents

## Prerequisites

### Required Tools
- Access to LivHana-SoT-20250926 repository
- Text editor with markdown support (VS Code, vim, etc.)
- Git command line or GitHub Desktop
- Python 3.8+ (for processing scripts)
- Bash shell (for verification scripts)

### Required Permissions
- Write access to `docs/copilot/` directory
- Ability to create GitHub issues
- Permission to create pull requests
- Access to automation scripts directory

### Security Requirements
- VPN connection if working remotely
- Secure workstation with disk encryption
- No storage of transcripts on personal devices
- PII redaction capabilities

## Step-by-Step Process

### Phase 1: Preparation & Security (Duration: 10-15 minutes)

#### 1.1 Secure Workspace Setup
```bash
# Create secure working directory
mkdir -p /tmp/knowledge-promotion/$(date +%Y%m%d_%H%M%S)
cd /tmp/knowledge-promotion/$(date +%Y%m%d_%H%M%S)

# Set secure permissions
chmod 700 .
umask 077

# Initialize session variables
export PROMOTION_SESSION_ID="kp_$(date +%Y%m%d_%H%M%S)"
export SOURCE_TYPE="chat_transcript|meeting|troubleshooting"
export SESSION_DATE="2025-09-28"
```

#### 1.2 Repository Preparation
```bash
# Clone or update repository
git clone https://github.com/RND-Technology/LivHana-SoT-20250926.git
cd LivHana-SoT-20250926

# Create working branch
git checkout -b knowledge-promotion/${PROMOTION_SESSION_ID}

# Verify branch status
git status
```

#### 1.3 Security Validation
```bash
# Run security checks
automation/scripts/validate_compliance.sh
automation/scripts/check_trinity_status.sh

# Verify working environment
echo "Session ID: $PROMOTION_SESSION_ID"
echo "Working Directory: $(pwd)"
echo "Git Branch: $(git branch --show-current)"
```

### Phase 2: Ingestion & Redaction (Duration: 20-30 minutes)

#### 2.1 Transcript Ingestion
```bash
# Copy transcript to secure working directory
cp /path/to/source/transcript.md ./raw_transcript.md

# Create ingestion metadata
cat > ingestion_metadata.json <<EOF
{
  "session_id": "${PROMOTION_SESSION_ID}",
  "source_type": "${SOURCE_TYPE}",
  "ingestion_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source_file": "raw_transcript.md",
  "participants": ["list", "of", "participants"],
  "duration_minutes": 0,
  "message_count": 0
}
EOF
```

#### 2.2 Security Scanning & Redaction
```bash
# Scan for secrets and PII
grep -i "api.key\|token\|password\|secret" raw_transcript.md > secrets_scan.log
grep -E "\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b" raw_transcript.md > email_scan.log

# Manual redaction checklist
echo "REDACTION CHECKLIST:"
echo "□ API keys and tokens replaced with [REDACTED]"
echo "□ Email addresses anonymized or removed"
echo "□ Personal names replaced with roles (CEO, Developer, etc.)"
echo "□ Internal URLs and hostnames generalized"
echo "□ Sensitive business data anonymized"

# Create redacted version
cp raw_transcript.md redacted_transcript.md
# Manual editing required here - automated tools would go in pipeline
```

#### 2.3 Content Validation
```bash
# Validate redacted content
wc -l redacted_transcript.md
grep -c "REDACTED" redacted_transcript.md

# Check for remaining sensitive patterns
grep -i "internal\|private\|confidential" redacted_transcript.md || echo "No sensitive markers found"
```

### Phase 3: Normalization & Structure Analysis (Duration: 30-45 minutes)

#### 3.1 Conversation Structure Analysis
```bash
# Count key content types
echo "CONTENT ANALYSIS:"
echo "Total lines: $(wc -l < redacted_transcript.md)"
echo "Code blocks: $(grep -c '```' redacted_transcript.md)"
echo "Decision markers: $(grep -ic 'decision\|adr\|we will\|we should' redacted_transcript.md)"
echo "Action markers: $(grep -ic 'action\|todo\|task\|create\|implement' redacted_transcript.md)"
echo "File references: $(grep -c '\.sh\|\.py\|\.md\|\.json\|\.yaml' redacted_transcript.md)"
```

#### 3.2 Topic Identification
```bash
# Extract major topics (manual review required)
echo "TOPICS IDENTIFIED:"
grep -i "## \|### \|#### " redacted_transcript.md | head -20

# Create topic summary
cat > topic_analysis.md <<EOF
# Topic Analysis for ${PROMOTION_SESSION_ID}

## Major Topics Discussed
- [ ] Topic 1
- [ ] Topic 2  
- [ ] Topic 3

## Decision Points Identified
- [ ] Decision 1
- [ ] Decision 2

## Action Items Extracted
- [ ] Action 1
- [ ] Action 2
EOF
```

#### 3.3 Cross-Reference Resolution
```bash
# Identify file and script references
grep -n "automation/\|docs/\|scripts/\|\.sh\|\.py" redacted_transcript.md > references.log

# Validate existing references
echo "REFERENCE VALIDATION:"
while IFS= read -r ref; do
    if [[ -f "$ref" ]]; then
        echo "✅ EXISTS: $ref"
    else
        echo "❌ MISSING: $ref"
    fi
done < <(grep -o "automation/[^[:space:]]*\|docs/[^[:space:]]*" redacted_transcript.md | sort -u)
```

### Phase 4: Decision Extraction & ADR Creation (Duration: 45-60 minutes)

#### 4.1 Decision Identification
```bash
# Create decision extraction worksheet
cat > decision_worksheet.md <<EOF
# Decision Extraction Worksheet

## Session: ${PROMOTION_SESSION_ID}
## Date: $(date +%Y-%m-%d)

### Decision 1
- **Summary:** 
- **Context:** 
- **Rationale:**
- **Impact:** High/Medium/Low
- **Status:** Decided/Proposed/Deferred
- **ADR Candidate:** Yes/No
- **Verification Requirements:**

### Decision 2
- **Summary:**
- **Context:**
[Continue for all identified decisions]
EOF
```

#### 4.2 ADR Draft Generation
```bash
# Create ADR drafts for significant decisions
create_adr_draft() {
    local adr_num="$1"
    local title="$2"
    local adr_file="docs/copilot/ADR-${adr_num}-DRAFT-${title// /-}.md"
    
    cat > "$adr_file" <<EOF
# ADR-${adr_num}: ${title}

**Status:** Draft  
**Date:** $(date +%Y-%m-%d)  
**Source:** ${PROMOTION_SESSION_ID}  
**Authors:** [List authors from session]

## Status
DRAFT - Requires review and approval

## Context
[Extract context from transcript]

## Decision
[Extract decision content]

## Consequences
[Identify positive and negative consequences]

## Verification Requirements
- [ ] Script/process 1
- [ ] Script/process 2

## References
- Source session: ${PROMOTION_SESSION_ID}
- Related files: [List file references]

---
**Next Steps:**
1. Technical review by engineering team
2. Business impact assessment
3. Security and compliance review
4. Final approval and ADR number assignment
EOF

    echo "Created draft ADR: $adr_file"
}

# Example usage (replace with actual decisions)
# create_adr_draft "010" "Knowledge Base Pipeline Architecture"
```

#### 4.3 GitHub Issue Creation
```bash
# Create issue templates for action items
create_issue_template() {
    local issue_num="$1"
    local title="$2"
    local priority="$3"
    
    cat > "issue_${issue_num}_${title// /-}.md" <<EOF
# GitHub Issue: ${title}

**Priority:** ${priority}  
**Source Session:** ${PROMOTION_SESSION_ID}  
**Created:** $(date +%Y-%m-%d)

## Summary
[Brief description of the action item]

## Context
[Background from session]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Requirements
[Specific implementation details]

## Verification
- [ ] Script/test to verify completion
- [ ] Documentation updates required

## Labels
- enhancement
- documentation  
- [context-specific labels]

## Assignment
@[team-member] or @[team-name]

---
**Source:** Extracted from knowledge promotion session ${PROMOTION_SESSION_ID}
EOF

    echo "Created issue template: issue_${issue_num}_${title// /-}.md"
}

# Example usage
# create_issue_template "001" "Implement Knowledge Base Verification Scripts" "high"
```

### Phase 5: Verification & Integration (Duration: 20-30 minutes)

#### 5.1 Documentation Cross-Reference Update
```bash
# Update knowledge base index
if [ -f "docs/copilot/EXTRACTED_DECISIONS_INDEX.md" ]; then
    echo "Updating EXTRACTED_DECISIONS_INDEX.md with new decisions..."
    # Manual update required - add new decisions to table
fi

# Update README if needed
if [ -f "docs/copilot/README.md" ]; then
    echo "Checking README.md for updates..."
    # Manual review and update if structure changed
fi
```

#### 5.2 Verification Script Execution
```bash
# Run validation scripts
echo "VERIFICATION RESULTS:"

# Basic repository health
automation/scripts/check_trinity_status.sh && echo "✅ Trinity status OK" || echo "❌ Trinity status FAIL"

# Context integrity
automation/scripts/validate_context_integrity.sh && echo "✅ Context integrity OK" || echo "❌ Context integrity FAIL"

# Compliance validation
automation/scripts/validate_compliance.sh && echo "✅ Compliance OK" || echo "❌ Compliance FAIL"

# Knowledge base specific validation (if exists)
if [ -f "automation/scripts/verify_knowledge_base.sh" ]; then
    automation/scripts/verify_knowledge_base.sh && echo "✅ Knowledge base OK" || echo "❌ Knowledge base FAIL"
fi
```

#### 5.3 Quality Assessment
```bash
# Create quality assessment
cat > quality_assessment.md <<EOF
# Knowledge Promotion Quality Assessment

## Session: ${PROMOTION_SESSION_ID}
## Assessment Date: $(date +%Y-%m-%d)

### Completeness Score: /100
- Decision extraction: /40
- Action item identification: /30  
- Cross-reference validation: /20
- Documentation quality: /10

### Review Checklist
- [ ] All significant decisions captured
- [ ] ADR drafts created for major decisions
- [ ] Action items converted to issue templates
- [ ] Cross-references validated and updated
- [ ] Security and PII redaction complete
- [ ] Verification scripts executed successfully

### Reviewer Sign-off
- [ ] Technical accuracy verified
- [ ] Business impact assessed
- [ ] Compliance requirements met
- [ ] Ready for integration

### Next Steps
1. Submit pull request with changes
2. Request review from stakeholders  
3. Create GitHub issues from templates
4. Schedule follow-up for draft ADR reviews
EOF
```

### Phase 6: Integration & Promotion (Duration: 15-20 minutes)

#### 6.1 Git Integration
```bash
# Stage all changes
git add docs/copilot/
git add -f issue_*.md  # If keeping issue templates in repo temporarily

# Create comprehensive commit message
git commit -m "Knowledge promotion from ${PROMOTION_SESSION_ID}

- Extract decisions and action items from ${SOURCE_TYPE} session
- Create draft ADRs for significant architectural decisions  
- Generate issue templates for action items
- Update knowledge base index and cross-references
- Validate content with verification scripts

Source: ${PROMOTION_SESSION_ID}
Session Date: ${SESSION_DATE}
Participants: [list key participants]"
```

#### 6.2 Pull Request Creation
```bash
# Push branch and create PR
git push -u origin knowledge-promotion/${PROMOTION_SESSION_ID}

# PR description template
cat > pr_description.md <<EOF
# Knowledge Promotion: ${PROMOTION_SESSION_ID}

## Summary
This PR promotes architectural knowledge and decisions from ${SOURCE_TYPE} session held on ${SESSION_DATE}.

## Changes Made
- [ ] X draft ADRs created for architectural decisions
- [ ] Y action items extracted and converted to issue templates  
- [ ] Updated knowledge base index and cross-references
- [ ] All content security-scanned and PII-redacted
- [ ] Verification scripts executed successfully

## Review Requirements
- [ ] Technical accuracy review by engineering team
- [ ] Business impact assessment by product team
- [ ] Security and compliance review
- [ ] Documentation quality review

## Next Steps After Merge
1. Create GitHub issues from templates
2. Schedule reviews for draft ADRs
3. Assign action items to appropriate teams
4. Update project roadmaps with new decisions

---
**Source Session:** ${PROMOTION_SESSION_ID}  
**Quality Score:** [Fill in from assessment]  
**Reviewer:** [Assign primary reviewer]
EOF
```

#### 6.3 Cleanup & Archival
```bash
# Archive working files
mkdir -p /tmp/knowledge-promotion/archive/${PROMOTION_SESSION_ID}
cp *.md *.json *.log /tmp/knowledge-promotion/archive/${PROMOTION_SESSION_ID}/

# Clean up sensitive data
shred -vfz -n 3 raw_transcript.md
rm -f redacted_transcript.md

# Return to main directory
cd ..
rm -rf /tmp/knowledge-promotion/$(date +%Y%m%d_%H%M%S)

echo "Knowledge promotion process complete!"
echo "PR ready for review: knowledge-promotion/${PROMOTION_SESSION_ID}"
```

## Quality Gates & Checkpoints

### Mandatory Quality Gates

#### Gate 1: Security & Privacy (Before Processing)
- [ ] Workspace properly secured and encrypted
- [ ] PII identification and redaction plan in place  
- [ ] Secret scanning tools available and functioning
- [ ] Secure disposal procedures for sensitive data

#### Gate 2: Content Completeness (After Extraction)
- [ ] All significant decisions identified and documented
- [ ] Action items extracted with clear acceptance criteria
- [ ] Cross-references validated and updated
- [ ] Quality assessment score >75/100

#### Gate 3: Technical Validation (Before Integration)
- [ ] All verification scripts pass
- [ ] Referenced files exist or are flagged for creation
- [ ] Documentation follows established patterns and standards
- [ ] Git history is clean and commit messages are descriptive

#### Gate 4: Review Readiness (Before PR)
- [ ] Draft ADRs include all required sections
- [ ] Issue templates are complete and actionable
- [ ] PR description clearly explains changes and requirements
- [ ] Appropriate reviewers identified and available

## Common Pitfalls & Troubleshooting

### Pitfall 1: Incomplete PII Redaction
**Symptoms:** Personal information leaked in documentation  
**Prevention:** Use automated scanning tools, manual double-check  
**Recovery:** Immediately delete sensitive content, re-process transcript

### Pitfall 2: Broken Cross-References
**Symptoms:** Links to non-existent files or scripts  
**Prevention:** Validate all references during extraction phase  
**Recovery:** Create missing scripts or update references to existing ones

### Pitfall 3: Low-Quality Decision Extraction
**Symptoms:** Vague decisions, missing context, unclear action items  
**Prevention:** Use structured templates, include rationale and consequences  
**Recovery:** Return to source transcript, re-extract with more detail

### Pitfall 4: Verification Script Failures
**Symptoms:** Scripts fail during validation phase  
**Prevention:** Test scripts before promotion session  
**Recovery:** Fix script issues or create missing dependencies

## Success Metrics

### Process Metrics
- **Time to Promotion:** <2 hours from transcript to PR
- **Quality Score:** >80/100 on quality assessment
- **Review Cycle Time:** <48 hours for PR approval
- **Action Item Completion:** >90% completion rate within 30 days

### Content Metrics
- **Decision Coverage:** All architectural decisions captured
- **Traceability:** Clear links from decisions to source sessions
- **Actionability:** All action items have clear acceptance criteria
- **Verification:** 100% of references validated or flagged

## Continuous Improvement

### Regular Process Review
- Monthly review of promotion sessions and outcomes
- Quarterly update of playbook based on lessons learned
- Annual assessment of automation opportunities
- Continuous feedback collection from users and reviewers

### Template Updates
- Maintain current ADR and issue templates
- Update cross-reference patterns as repository evolves
- Improve quality assessment criteria based on outcomes
- Enhance security scanning and redaction procedures

---

**Emergency Contacts:**
- Technical Issues: Engineering Team Lead  
- Security Concerns: Security Team  
- Process Questions: Documentation Team Lead  
- Business Impact: Product Team Lead

**Related Documentation:**
- [Knowledge Base Pipeline ADR Draft](./KNOWLEDGE_BASE_PIPELINE_ADR_DRAFT.md)
- [Verification Suite Summary](./VERIFICATION_SUITE_SUMMARY.md)
- [README](./README.md) - Knowledge base structure and guidelines