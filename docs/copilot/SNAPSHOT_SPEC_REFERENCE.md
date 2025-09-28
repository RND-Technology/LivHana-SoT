# Snapshot Specification Reference

**Status:** Design Phase  
**Source:** Current Chat Session + Legacy Analysis  
**Last Updated:** 2025-09-28T12:00:00Z  
**ADR Candidate:** ADR-007 (Proposed)

---

## Overview

The Snapshot System provides memory continuity and state preservation for the Liv Hana AI agent through structured behavioral, contextual, and preference snapshots. This ensures consistent personality and learned behaviors across sessions while maintaining governance over memory evolution.

## Snapshot Architecture

### Snapshot Categories

#### 1. Behavioral Snapshots
**Purpose:** Preserve agent personality, communication style, and learned behaviors  
**Frequency:** Daily or on significant behavioral changes  
**Retention:** 30 days rolling window + quarterly archives

#### 2. Context Snapshots  
**Purpose:** Full conversational and operational context state captures  
**Frequency:** Every 4 hours or before major operations  
**Retention:** 7 days rolling window + incident preservation

#### 3. Preference Snapshots
**Purpose:** User preference evolution and customization state  
**Frequency:** On preference changes or weekly baseline  
**Retention:** 90 days + permanent user profile updates

## Schema Specification

### Behavioral Snapshot Schema v1.0
```json
{
  "snapshot_type": "behavioral",
  "version": "1.0",
  "timestamp": "2025-09-28T12:00:00Z",
  "agent_id": "liv-hana-main",
  "metadata": {
    "trigger": "scheduled|behavioral_drift|manual",
    "confidence_score": 0.95,
    "validation_status": "verified|pending|failed"
  },
  "behavioral_profile": {
    "communication_style": {
      "formality_level": 0.7,
      "technical_depth": 0.8,
      "enthusiasm_factor": 0.6,
      "explanation_preference": "detailed_with_examples"
    },
    "decision_making": {
      "risk_tolerance": 0.4,
      "verification_preference": "strict",
      "fallback_strategy": "conservative"
    },
    "learning_patterns": {
      "adaptation_rate": 0.3,
      "memory_retention": 0.9,
      "pattern_recognition": 0.8
    }
  },
  "capabilities": {
    "technical_skills": ["architecture", "devops", "compliance"],
    "domain_expertise": ["cannabis_regulation", "ai_orchestration", "system_design"],
    "operational_focus": ["single_source_of_truth", "verification_first"]
  },
  "guardrails": {
    "compliance_level": "21+",
    "safety_constraints": ["no_medical_claims", "natural_cannabinoids_only"],
    "operational_limits": ["nist_validation_required"]
  }
}
```

### Context Snapshot Schema v1.0
```json
{
  "snapshot_type": "context",
  "version": "1.0", 
  "timestamp": "2025-09-28T12:00:00Z",
  "agent_id": "liv-hana-main",
  "metadata": {
    "session_count": 42,
    "total_interactions": 1337,
    "context_window_size": 32000,
    "compression_ratio": 0.6
  },
  "system_state": {
    "active_repositories": ["LivHana-SoT-20250926"],
    "current_branch": "main",
    "working_directory": "/home/runner/work/...",
    "environment_variables": {
      "COMPLIANCE_LEVEL": "21+",
      "SOVEREIGN_TRINITY": "LivHana-SoT,LivHana-Kinetic,LivHana-Potential"
    }
  },
  "conversation_history": {
    "recent_topics": ["knowledge_base_creation", "adr_documentation", "verification_scripts"],
    "decision_context": ["multi_model_router", "scheduler_orchestration"],
    "pending_actions": ["create_remaining_docs", "implement_verification_scripts"]
  },
  "knowledge_state": {
    "learned_patterns": {
      "architecture_preferences": ["single_source_of_truth", "verification_over_generation"],
      "documentation_style": ["structured_markdown", "cross_referenced"],
      "operational_focus": ["compliance_first", "fail_fast_validation"]
    },
    "active_adrs": ["ADR-001", "ADR-002", "ADR-copilot-organizational-instructions"],
    "knowledge_gaps": ["adr_003_location", "historical_chat_context"]
  }
}
```

### Preference Snapshot Schema v1.0
```json
{
  "snapshot_type": "preference",
  "version": "1.0",
  "timestamp": "2025-09-28T12:00:00Z", 
  "user_id": "jesse_niesen",
  "agent_id": "liv-hana-main",
  "preferences": {
    "communication": {
      "detail_level": "comprehensive",
      "technical_depth": "expert",
      "update_frequency": "frequent_progress_reports"
    },
    "workflow": {
      "verification_strictness": "maximum",
      "documentation_completeness": "tier_1",
      "progress_reporting": "incremental_with_checklists"
    },
    "priorities": {
      "compliance_enforcement": 10,
      "documentation_quality": 9,
      "operational_efficiency": 8,
      "cost_optimization": 6
    }
  },
  "customizations": {
    "dashboard_layout": "three_column_grid",
    "metric_preferences": ["compliance", "performance", "cost"],
    "alert_thresholds": {
      "compliance_violation": "immediate",
      "performance_degradation": "p95_gt_400ms",
      "cost_overrun": "80_percent_budget"
    }
  }
}
```

## Freshness SLA & Governance

### Freshness Requirements
| Snapshot Type | Maximum Age | Warning Threshold | Critical Threshold |
|---------------|-------------|-------------------|-------------------|
| **Behavioral** | 24 hours | 18 hours | 24 hours |
| **Context** | 4 hours | 3 hours | 6 hours |
| **Preference** | 7 days | 5 days | 10 days |

### Freshness Validation
```bash
# Check snapshot freshness
check_snapshot_age() {
    local snapshot_file="$1"
    local max_age_hours="$2"
    
    if [ ! -f "$snapshot_file" ]; then
        log_error "Snapshot file not found: $snapshot_file"
        return 1
    fi
    
    local file_age=$(( $(date +%s) - $(stat -c %Y "$snapshot_file") ))
    local max_age_seconds=$(( max_age_hours * 3600 ))
    
    if [ $file_age -gt $max_age_seconds ]; then
        log_warn "Snapshot stale: $snapshot_file (age: ${file_age}s, max: ${max_age_seconds}s)"
        return 1
    fi
    
    log_info "Snapshot fresh: $snapshot_file"
    return 0
}
```

## Storage & Archival Strategy

### File Organization
```
memory/
├── behavioral-snapshots/
│   ├── current/
│   │   ├── liv-hana-behavioral-20250928T120000Z.json
│   │   └── liv-hana-behavioral-latest.json -> liv-hana-behavioral-20250928T120000Z.json
│   ├── archive/
│   │   └── quarterly/
│   └── deprecated/
├── context-snapshots/  
│   ├── current/
│   │   ├── liv-hana-context-20250928T120000Z.json
│   │   └── liv-hana-context-latest.json -> liv-hana-context-20250928T120000Z.json
│   └── archive/
│       └── incidents/
└── preference-snapshots/
    ├── current/
    │   ├── jesse-niesen-prefs-20250928T120000Z.json
    │   └── jesse-niesen-prefs-latest.json -> jesse-niesen-prefs-20250928T120000Z.json
    └── archive/
        └── evolution/
```

### Retention Policies
- **Behavioral:** 30 days rolling + quarterly archives indefinitely
- **Context:** 7 days rolling + incident preservation (1 year)  
- **Preference:** 90 days rolling + permanent profile integration

## Failure Escalation

### Snapshot Creation Failures
1. **Level 1 (Warning):** Log warning, retry in 1 hour
2. **Level 2 (Alert):** Notify operations team, manual intervention required
3. **Level 3 (Critical):** System degradation alert, emergency procedures

### Staleness Escalation  
1. **Warning Threshold:** Automated alert to monitoring system
2. **Critical Threshold:** PagerDuty alert, immediate attention required
3. **Beyond Critical:** System functionality degradation, emergency snapshot creation

### Corruption Detection
1. **Schema Validation Failed:** Quarantine snapshot, create new one
2. **Data Integrity Issues:** Rollback to last known good snapshot
3. **Total Failure:** Emergency recovery from quarterly archive

## Integration Points

### Scheduler Integration
- **High Noon Sync:** Daily behavioral snapshot creation
- **6-Hour Orchestration:** Context snapshot management
- **Weekly Risk Review:** Preference snapshot validation and archival

### Monitoring Integration
```yaml
# Custom metrics for snapshot health
custom.googleapis.com/herbitrage/snapshot_creation_duration_ms
custom.googleapis.com/herbitrage/snapshot_freshness_hours  
custom.googleapis.com/herbitrage/snapshot_validation_success_rate
custom.googleapis.com/herbitrage/snapshot_storage_usage_bytes
```

### API Endpoints (Future)
```
GET  /api/snapshots/{type}/latest     # Get latest snapshot
POST /api/snapshots/{type}/create     # Create new snapshot  
GET  /api/snapshots/{type}/validate   # Validate snapshot freshness
POST /api/snapshots/{type}/restore    # Restore from snapshot
```

## Verification Hooks

### Existing Scripts (Referenced)
- `automation/scripts/validate_context_integrity.sh` - Context snapshot validation
- `automation/scripts/verify_data_integrity.sh` - Data consistency checks

### Required Scripts (To Be Created)
- `automation/scripts/check_snapshot_freshness.sh` - Age validation
- `automation/scripts/verify_memory_governance.sh` - Memory consistency  
- `automation/scripts/validate_snapshot_schema.sh` - Schema compliance
- `automation/scripts/create_behavioral_snapshot.sh` - Behavioral capture
- `automation/scripts/restore_from_snapshot.sh` - Recovery procedures

## Security Considerations

### Data Protection
- All snapshots encrypted at rest using AES-256
- PII redaction for compliance logs
- Access control via IAM roles and service accounts

### Audit Trail
- All snapshot operations logged with timestamps
- User access tracking for preference snapshots
- Integrity checksums for tamper detection

### Backup Strategy
- Local snapshots backed up to GCS multi-region buckets
- Cross-region replication for disaster recovery
- Point-in-time recovery capability

---

**Verification Commands:**
```bash
# Check snapshot freshness (future)
automation/scripts/check_snapshot_freshness.sh --type behavioral --max-age 24h

# Validate snapshot schema (future) 
automation/scripts/validate_snapshot_schema.sh --file memory/behavioral-snapshots/current/latest.json

# Create emergency snapshot (future)
automation/scripts/create_behavioral_snapshot.sh --emergency --reason "system_anomaly"
```

**Next Steps:**
1. Implement snapshot creation and validation scripts
2. Create monitoring dashboard for snapshot health
3. Establish automated cleanup and archival processes
4. Design recovery procedures and test disaster scenarios
5. Create formal ADR-007 for Memory Governance architecture