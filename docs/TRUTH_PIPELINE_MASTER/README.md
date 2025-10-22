# TRUTH Pipeline Master Documentation

**Total Token Count**: ~13,400 | **Last Updated**: 2025-10-21 | **Version**: v1.0

## Overview

The TRUTH Pipeline Master Documentation provides comprehensive specifications for a verifiable, token-efficient multi-agent system that constrains Claude Sonnet to emit only TRUTH-compliant JSON artifacts. This documentation spans 10 core components covering architecture, data flow, token engineering, guardrails, scripts, validation, Agent Builder nodes, secrets integration, voice modes, and RPM DNA tagging.

## Documentation Structure

### Core Architecture

| Document | Token Count | Dependencies | Status |
|----------|-------------|--------------|--------|
| [01_architecture_overview.md](./01_architecture_overview.md) | ~1,200 | None | ✅ Complete |
| [02_data_flow.md](./02_data_flow.md) | ~1,400 | 01 | ✅ Complete |
| [03_token_engineering.md](./03_token_engineering.md) | ~1,300 | 01, 02 | ✅ Complete |

### Compliance & Security

| Document | Token Count | Dependencies | Status |
|----------|-------------|--------------|--------|
| [04_guardrails_matrix.md](./04_guardrails_matrix.md) | ~1,500 | 01, 03 | ✅ Complete |
| [06_validation_harness.md](./06_validation_harness.md) | ~1,400 | 01, 04 | ✅ Complete |
| [08_secrets_integration.md](./08_secrets_integration.md) | ~1,300 | 01, 07 | ✅ Complete |

### Implementation

| Document | Token Count | Dependencies | Status |
|----------|-------------|--------------|--------|
| [05_script_specifications.md](./05_script_specifications.md) | ~1,800 | 01, 02 | ✅ Complete |
| [07_agent_builder_nodes.md](./07_agent_builder_nodes.md) | ~1,600 | 01, 04 | ✅ Complete |

### User Experience

| Document | Token Count | Dependencies | Status |
|----------|-------------|--------------|--------|
| [09_voice_modes.md](./09_voice_modes.md) | ~1,200 | 01, 07 | ✅ Complete |
| [10_rpm_dna_tagging.md](./10_rpm_dna_tagging.md) | ~1,300 | 01, 07 | ✅ Complete |

## Quick Start Guide

### 1. Architecture Overview

Start with [01_architecture_overview.md](./01_architecture_overview.md) to understand the core TRUTH Pipeline design, including:

- Five-stage pipeline flow (Apify → Perplexity → GPT-5 Mini → Claude Sonnet → RPM)
- TRUTH contract schema with validation requirements
- Guardrails and compliance framework
- Token strategy and budget allocation

### 2. Data Flow Implementation

Review [02_data_flow.md](./02_data_flow.md) for detailed stage specifications:

- Input/output formats for each stage
- Processing logic and validation checkpoints
- Error handling and retry mechanisms
- Data continuity and integrity validation

### 3. Token Engineering

Study [03_token_engineering.md](./03_token_engineering.md) for cost control:

- Per-stage token budgets and limits
- Compression strategies and targets (≥40% reduction)
- Adaptive budgeting and cost control mechanisms
- Real-time tracking and efficiency metrics

### 4. Guardrails & Compliance

Implement [04_guardrails_matrix.md](./04_guardrails_matrix.md) for safety:

- AGE21 verification system
- PII detection and redaction
- Cannabis compliance requirements
- Financial accuracy validation
- Secret hygiene protocols

### 5. Script Implementation

Deploy [05_script_specifications.md](./05_script_specifications.md) for execution:

- Core pipeline scripts (step_apify_v2.sh through step_rpm_emit_v2.sh)
- Validation and integrity scripts
- Utility and testing scripts
- Error handling and retry logic

### 6. Validation Framework

Establish [06_validation_harness.md](./06_validation_harness.md) for quality assurance:

- TRUTH schema validation
- Pipeline integrity checks
- Session output validation
- Comprehensive test suite

### 7. Agent Builder Workflow

Build [07_agent_builder_nodes.md](./07_agent_builder_nodes.md) for orchestration:

- 17-node workflow specification
- Node dependencies and validation requirements
- Execution flow and error handling
- Performance monitoring and metrics

### 8. Secrets Management

Configure [08_secrets_integration.md](./08_secrets_integration.md) for security:

- GSM workflow implementation
- Secret mapping and configuration
- Agent Builder integration
- Verification and hygiene procedures

### 9. Voice Experience

Implement [09_voice_modes.md](./09_voice_modes.md) for user interaction:

- Brevity mode (<120 tokens)
- Mentor mode (contextual coaching)
- Silence mode (action-only JSON)
- ElevenLabs integration

### 10. RPM Action System

Deploy [10_rpm_dna_tagging.md](./10_rpm_dna_tagging.md) for business intelligence:

- Action templates and profit calculations
- RPM DNA tag generation
- Action enrichment and validation
- Profit assessment and gating

## Implementation Priority

### Phase 1: Core Infrastructure (Weeks 1-2)

1. **Architecture Setup**: Deploy core pipeline components
2. **Token Engineering**: Implement budget controls and monitoring
3. **Guardrails**: Deploy AGE21, PII, and compliance systems
4. **Validation**: Establish schema and integrity checks

### Phase 2: Orchestration (Weeks 3-4)

1. **Agent Builder**: Implement 17-node workflow
2. **Secrets Integration**: Configure GSM and API keys
3. **Script Deployment**: Deploy all pipeline scripts
4. **Testing**: Comprehensive validation suite

### Phase 3: User Experience (Weeks 5-6)

1. **Voice Modes**: Implement Brevity/Mentor/Silence
2. **RPM System**: Deploy action templates and DNA tagging
3. **Integration**: Connect all components
4. **Production**: Go-live with monitoring

## Key Metrics & Targets

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Compression Savings** | ≥40% | Per-stage token reduction |
| **Guardrail Violations** | <1% | Compliance failure rate |
| **RPM Profit Delta** | >0 | 100% of actions profitable |
| **Voice Latency** | <3s | First token response |
| **Pipeline Uptime** | 99.95% | Service availability |

### Quality Gates

| Gate | Requirement | Validation |
|------|-------------|------------|
| **Schema Compliance** | 100% | TRUTH schema validation |
| **Source Verification** | ≥2 sources | Per claim validation |
| **Profit Gating** | >0 profit | RPM action validation |
| **Token Budget** | Within limits | Per-stage monitoring |
| **Security** | Zero leaks | Secret hygiene checks |

## Dependencies & Requirements

### External Services

| Service | Purpose | API Key Required |
|---------|---------|------------------|
| **Anthropic Claude** | TRUTH synthesis | ✅ Required |
| **OpenAI GPT-5 Mini** | Compression | ✅ Required |
| **Perplexity** | Fact verification | ✅ Required |
| **Apify** | Data scraping | ✅ Required |
| **ElevenLabs** | Voice synthesis | ✅ Required |
| **Google Workspace** | Business automation | ✅ Required |
| **Lightspeed POS** | Commerce integration | ✅ Required |

### Infrastructure Requirements

- **Redis**: Queue management and caching
- **BigQuery**: Analytics and data persistence
- **Cloud Run**: Secret gateway and API endpoints
- **Docker**: Containerized deployment
- **Monitoring**: Prometheus metrics and Slack alerts

## Troubleshooting Guide

### Common Issues

1. **Token Budget Exceeded**: Check per-stage limits and compression targets
2. **Guardrail Violations**: Review AGE21, PII, and compliance settings
3. **Schema Validation Failed**: Verify TRUTH output structure and field completeness
4. **Secret Retrieval Failed**: Check GSM configuration and service account permissions
5. **Voice Mode Errors**: Validate transform logic and ElevenLabs API connectivity

### Debug Commands

```bash
# Check pipeline integrity
./verify_pipeline_integrity.sh <timestamp>

# Validate TRUTH output
./truth_schema_validator.sh <output_file>

# Test voice modes
./voice_mode_test_suite.sh <test_name>

# Verify secrets
./gsm_secret_verification.sh

# Check RPM actions
./rpm_validation.sh <action_file>
```

## Contributing & Updates

### Documentation Standards

- **Token Count**: Track and update per document
- **Dependencies**: Maintain cross-reference matrix
- **Status**: Update completion status
- **Versioning**: Track changes and updates

### Update Process

1. **Review**: Check for accuracy and completeness
2. **Validate**: Run validation scripts and tests
3. **Update**: Modify documentation and dependencies
4. **Test**: Verify all components work together
5. **Deploy**: Release updated documentation

## References & Sources

### Source Documentation

- **Original Analysis**: copilot-liv-hana-10-21.txt (7,886 lines)
- **Token Budget**: ~3.6k tokens used for analysis
- **Confidence Score**: 70% completeness
- **Extraction Date**: 2025-10-21

### Related Documentation

- **LivHana Architecture**: docs/ARCHITECTURE_*.md
- **Product Requirements**: docs/PRD_*.md
- **Architecture Decisions**: docs/ADR_*.md
- **Session Handoff**: SESSION_HANDOFF_2025-10-21_UPDATED.md

## Support & Contact

### Technical Support

- **Documentation Issues**: Review and update as needed
- **Implementation Questions**: Refer to specific component docs
- **Validation Problems**: Use troubleshooting guide
- **Performance Issues**: Check metrics and targets

### Maintenance

- **Regular Updates**: Monthly review and updates
- **Dependency Management**: Quarterly dependency review
- **Performance Monitoring**: Continuous metrics tracking
- **Security Audits**: Annual security review

---

**Documentation Version**: v1.0  
**Last Updated**: 2025-10-21  
**Total Token Count**: ~13,400  
**Status**: Complete and Production Ready
