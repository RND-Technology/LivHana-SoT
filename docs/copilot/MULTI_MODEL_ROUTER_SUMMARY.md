# Multi-Model Router Summary

**Status:** Design Phase  
**Source:** Current Chat Session Only  
**Last Updated:** 2025-09-28T12:00:00Z  
**ADR Candidate:** ADR-004 (Proposed)

---

## Overview

The Multi-Model AI Router provides intelligent request routing across different AI providers (DeepSeek, OpenAI, Anthropic, etc.) with automated fallback strategies, performance scoring, and cost optimization.

## Architecture Design

### Core Components

1. **Router Engine**
   - Request classification and routing logic
   - Model capability matching
   - Load balancing and health monitoring

2. **Scoring System**
   - Performance metrics collection
   - Cost-per-token tracking
   - Quality scoring based on response evaluation

3. **Fallback Ladder**
   - Primary → Secondary → Tertiary provider cascade
   - Circuit breaker pattern for failed providers
   - Graceful degradation strategies

## Scoring Formula

```
Router Score = (Quality Weight × Quality Score) + 
               (Performance Weight × Latency Score) + 
               (Cost Weight × Cost Efficiency Score) + 
               (Availability Weight × Uptime Score)

Default Weights:
- Quality: 0.4
- Performance: 0.3  
- Cost: 0.2
- Availability: 0.1
```

### Quality Scoring Metrics
- Response coherence (0-1)
- Task completion rate (0-1)
- Factual accuracy (0-1)
- Context adherence (0-1)

### Performance Scoring Metrics
- p50 response latency (ms)
- p95 response latency (ms)
- Throughput (requests/second)
- Time-to-first-token (ms)

## Performance Targets

| Metric | p95 Target | p99 Target | SLA |
|--------|------------|------------|-----|
| **Response Latency** | < 400ms | < 800ms | 99.5% |
| **Time-to-First-Token** | < 200ms | < 500ms | 99.0% |
| **Router Decision Time** | < 10ms | < 25ms | 99.9% |
| **Fallback Trigger Time** | < 5s | < 10s | 99.5% |

## Fallback Ladder Strategy

### Tier 1: Primary Providers
- DeepSeek R1 (Local/Self-hosted)
- OpenAI GPT-4 (API)

### Tier 2: Secondary Providers  
- Anthropic Claude (API)
- Google Gemini (API)

### Tier 3: Emergency Fallback
- OpenAI GPT-3.5-turbo (Cost-optimized)
- Local/Cached responses for common queries

### Cascade Logic
```
1. Check primary provider health & capacity
2. If primary unavailable → Route to secondary  
3. If secondary fails → Route to tertiary
4. If all fail → Return cached response or error with retry-after header
5. Monitor recovery and restore to higher tiers when available
```

## Metrics to Push

### Custom GCP Metrics
- `custom.googleapis.com/herbitrage/router_requests_total` (Counter)
- `custom.googleapis.com/herbitrage/router_latency_ms` (Histogram)
- `custom.googleapis.com/herbitrage/router_fallback_triggers` (Counter)  
- `custom.googleapis.com/herbitrage/model_provider_availability` (Gauge)
- `custom.googleapis.com/herbitrage/cost_per_thousand_tokens` (Gauge)
- `custom.googleapis.com/herbitrage/quality_score_average` (Gauge)

### Dashboard Tiles
- Router health overview
- Provider availability status
- Cost trends and optimization opportunities
- Quality score trends by provider
- Fallback frequency analysis

## Verification Hooks

- `automation/scripts/check_router_health.sh` - (To be created) Validates router availability and response times
- `automation/scripts/verify_fallback_ladder.sh` - (To be created) Tests cascade behavior
- `automation/scripts/validate_scoring_system.sh` - (To be created) Ensures scoring accuracy

## Implementation Phases

### Phase 1: Basic Routing
- Simple round-robin between providers
- Basic health checks
- Manual failover

### Phase 2: Smart Routing  
- Scoring system implementation
- Automated fallback ladder
- Performance monitoring

### Phase 3: Optimization
- Machine learning for routing decisions
- Predictive scaling
- Advanced cost optimization

## Configuration Schema

```yaml
router:
  providers:
    - name: "deepseek-r1"
      endpoint: "${DEEPSEEK_ENDPOINT}"
      api_key: "${DEEPSEEK_API_KEY}"
      weight: 10
      tier: 1
    - name: "openai-gpt4"
      endpoint: "https://api.openai.com/v1"
      api_key: "${OPENAI_API_KEY}"  
      weight: 8
      tier: 1
  fallback:
    max_retries: 3
    circuit_breaker_threshold: 5
    recovery_timeout: 300s
  scoring:
    quality_weight: 0.4
    performance_weight: 0.3
    cost_weight: 0.2
    availability_weight: 0.1
```

## Security Considerations

- API key rotation and secure storage
- Request/response logging with PII redaction
- Rate limiting per provider and overall
- Audit trail for routing decisions

## Integration Points

- **Frontend:** Cockpit AI chat interface
- **Backend:** Express.js routing middleware  
- **Monitoring:** GCP Cloud Monitoring integration
- **Alerting:** PagerDuty for critical failures

---

**Next Steps:**
1. Create formal ADR-004 for Multi-Model Router
2. Implement basic routing prototype
3. Design and implement verification scripts
4. Establish monitoring and alerting

**Verification Commands:**
```bash
# Health check (future)
./automation/scripts/check_router_health.sh

# Fallback testing (future)  
./automation/scripts/verify_fallback_ladder.sh
```