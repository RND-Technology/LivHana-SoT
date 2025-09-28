# Metric Taxonomy Quick Reference

**Status:** Active  
**Source:** ADR-002 + Current Chat Session Analysis  
**Last Updated:** 2025-09-28T12:00:00Z  
**Reference:** Dashboard Command Center (ADR-002)

---

## Overview

This reference provides a comprehensive catalog of all `custom.googleapis.com/herbitrage/*` metrics used across the Liv Hana system. Metrics are organized by functional area and include units, frequency, dashboard tile placement, and alert thresholds.

## Metric Namespace Convention

**Base Namespace:** `custom.googleapis.com/herbitrage/`  
**Naming Pattern:** `{namespace}/{functional_area}_{metric_name}_{unit_suffix}`  
**Examples:**
- `custom.googleapis.com/herbitrage/revenue_daily_usd`
- `custom.googleapis.com/herbitrage/router_latency_ms`
- `custom.googleapis.com/herbitrage/age_gate_pass_rate_percent`

## Complete Metric Catalog

### Business & Revenue Metrics

| Metric Name | Type | Unit | Frequency | Tile Group | Alert Threshold | Description |
|-------------|------|------|-----------|------------|----------------|-------------|
| `revenue_daily_usd` | Gauge | USD | 5 min | Revenue | <80% of target | Daily revenue in US dollars |
| `roi_ratio` | Gauge | Ratio | 15 min | Revenue | <2:1 | Revenue to cost ratio |
| `customer_acquisition_rate` | Gauge | Count/Day | 30 min | Revenue | Decline >20% | New customer signups per day |
| `customer_lifetime_value_usd` | Gauge | USD | 1 hour | Revenue | Trend decline | Average customer lifetime value |
| `conversion_rate_percent` | Gauge | Percent | 15 min | Revenue | <industry benchmark | Overall conversion rate |
| `average_order_value_usd` | Gauge | USD | 15 min | Revenue | Trend decline >15% | Average transaction value |

### TPOP (The Power of Plants) Funnel Metrics

| Metric Name | Type | Unit | Frequency | Tile Group | Alert Threshold | Description |
|-------------|------|------|-----------|------------|----------------|-------------|
| `tpop_funnel_views` | Counter | Count | 1 min | TPOP | Drop >15% | Page views for TPOP content |
| `tpop_funnel_clicks` | Counter | Count | 1 min | TPOP | CTR <3% | Click-through events |
| `tpop_funnel_engagements` | Counter | Count | 5 min | TPOP | <5% of clicks | Policy/content engagement |
| `tpop_funnel_conversions` | Counter | Count | 5 min | TPOP | <1% of views | Final conversion to R&D |
| `tpop_ctr_ops_percent` | Gauge | Percent | 5 min | TPOP | <5% | Click-through rate for OPS |
| `tpop_rd_conversion_percent` | Gauge | Percent | 15 min | TPOP | <2% | Conversion rate to R&D |

### Compliance & Security Metrics

| Metric Name | Type | Unit | Frequency | Tile Group | Alert Threshold | Description |
|-------------|------|------|-----------|------------|----------------|-------------|
| `age_gate_pass_rate_percent` | Gauge | Percent | 1 min | Compliance | <90% | 21+ age verification success rate |
| `coa_flags_red` | Gauge | Count | 5 min | Compliance | >0 | Critical COA compliance violations |
| `coa_flags_amber` | Gauge | Count | 5 min | Compliance | >10 | Warning-level COA issues |
| `content_violations_count` | Counter | Count | 1 min | Compliance | >0.5% rate | Content policy violations |
| `compliance_audit_score` | Gauge | Score | 1 hour | Compliance | <95/100 | Overall compliance health score |
| `underage_block_count` | Counter | Count | 1 min | Compliance | N/A (info) | Users blocked for underage |

### Multi-Model Router Metrics

| Metric Name | Type | Unit | Frequency | Tile Group | Alert Threshold | Description |
|-------------|------|------|-----------|------------|----------------|-------------|
| `router_requests_total` | Counter | Count | 30 sec | Router | N/A (info) | Total requests processed |
| `router_latency_ms` | Histogram | Milliseconds | 30 sec | Router | p95 >400ms | Response latency distribution |
| `router_fallback_triggers` | Counter | Count | 30 sec | Router | >5% of requests | Fallback cascade activations |
| `model_provider_availability` | Gauge | Percent | 1 min | Router | <99% | Provider availability percentage |
| `cost_per_thousand_tokens` | Gauge | USD | 15 min | Router | >budget threshold | Cost efficiency tracking |
| `quality_score_average` | Gauge | Score | 5 min | Router | <0.8/1.0 | Average response quality score |
| `router_error_rate_percent` | Gauge | Percent | 1 min | Router | >1% | Error rate across all providers |

### HNC (Herbitrage Network Content) Pipeline Metrics

| Metric Name | Type | Unit | Frequency | Tile Group | Alert Threshold | Description |
|-------------|------|------|-----------|------------|----------------|-------------|
| `synthesia_queue_depth` | Gauge | Count | 30 sec | HNC Pipeline | >100 | Jobs waiting in queue |
| `synthesia_jobs_active` | Gauge | Count | 30 sec | HNC Pipeline | >40 | Currently processing jobs |
| `synthesia_jobs_completed` | Counter | Count | 1 min | HNC Pipeline | <5/day | Successfully completed jobs |
| `publish_sla_compliance_percent` | Gauge | Percent | 15 min | HNC Pipeline | <85% | D+1 publishing SLA adherence |
| `content_generation_duration_ms` | Histogram | Milliseconds | 1 min | HNC Pipeline | p95 >5min | Content generation time |
| `pipeline_error_rate_percent` | Gauge | Percent | 1 min | HNC Pipeline | >2% | Pipeline failure rate |

### System Reliability & Performance Metrics

| Metric Name | Type | Unit | Frequency | Tile Group | Alert Threshold | Description |
|-------------|------|------|-----------|------------|----------------|-------------|
| `api_error_rate_5xx_percent` | Gauge | Percent | 1 min | Reliability | >2% | Server error rate |
| `api_latency_p95_ms` | Gauge | Milliseconds | 1 min | Reliability | >400ms | 95th percentile response time |
| `api_latency_p99_ms` | Gauge | Milliseconds | 1 min | Reliability | >800ms | 99th percentile response time |
| `service_availability_percent` | Gauge | Percent | 1 min | Reliability | <99.5% | Overall service uptime |
| `error_budget_remaining_percent` | Gauge | Percent | 5 min | Reliability | <70% | Available error budget |
| `concurrent_users_count` | Gauge | Count | 1 min | Performance | N/A (info) | Active user sessions |

### Infrastructure & Cost Metrics

| Metric Name | Type | Unit | Frequency | Tile Group | Alert Threshold | Description |
|-------------|------|------|-----------|------------|----------------|-------------|
| `gcp_cost_daily_usd` | Gauge | USD | 1 hour | Budget | >110% daily budget | Daily GCP spending |
| `budget_utilization_percent` | Gauge | Percent | 1 hour | Budget | >90% | Month-to-date budget usage |
| `cost_per_active_user_usd` | Gauge | USD | 1 hour | Budget | >20% increase | Cost efficiency per user |
| `resource_utilization_percent` | Gauge | Percent | 5 min | Infrastructure | <50% | Average resource utilization |
| `storage_usage_gb` | Gauge | Gigabytes | 15 min | Infrastructure | >80% capacity | Data storage consumption |
| `bandwidth_usage_gbps` | Gauge | Gbps | 1 min | Infrastructure | >threshold | Network bandwidth usage |

### Verification & Testing Metrics

| Metric Name | Type | Unit | Frequency | Tile Group | Alert Threshold | Description |
|-------------|------|------|-----------|------------|----------------|-------------|
| `check_script_success_rate_percent` | Gauge | Percent | 5 min | Verification | <95% | Verification script pass rate |
| `check_script_duration_ms` | Histogram | Milliseconds | 1 min | Verification | p95 >30sec | Script execution time |
| `compliance_violation_count` | Counter | Count | 1 min | Verification | >0 critical | Compliance check failures |
| `test_success_rate_percent` | Gauge | Percent | Test run | Testing | <99% | Automated test pass rate |
| `test_flake_rate_percent` | Gauge | Percent | Test run | Testing | >5% | Test flakiness percentage |
| `coverage_percentage` | Gauge | Percent | Daily | Testing | <80% | Code coverage percentage |

### Scheduler & Orchestration Metrics

| Metric Name | Type | Unit | Frequency | Tile Group | Alert Threshold | Description |
|-------------|------|------|-----------|------------|----------------|-------------|
| `scheduler_execution_duration_ms` | Histogram | Milliseconds | Per run | Schedulers | p95 >30min | Scheduler job duration |
| `scheduler_success_rate_percent` | Gauge | Percent | Per run | Schedulers | <100% | Scheduler success rate |
| `high_noon_sync_status` | Gauge | Status | Per run | Schedulers | Failed | High Noon execution status |
| `compliance_check_results` | Counter | Count | Per run | Schedulers | Failed >0 | Compliance check outcomes |
| `trinity_sync_duration_ms` | Histogram | Milliseconds | Per run | Schedulers | p95 >10min | Repository sync time |

### Knowledge Base & Documentation Metrics

| Metric Name | Type | Unit | Frequency | Tile Group | Alert Threshold | Description |
|-------------|------|------|-----------|------------|----------------|-------------|
| `knowledge_base_freshness_hours` | Gauge | Hours | 1 hour | Knowledge | >24 hours | Time since last KB update |
| `documentation_completeness_percent` | Gauge | Percent | Daily | Knowledge | <90% | Documentation coverage |
| `cross_reference_validation_percent` | Gauge | Percent | Daily | Knowledge | <95% | Valid cross-references |
| `adr_promotion_rate` | Gauge | Count/Month | Weekly | Knowledge | Trend decline | ADR creation rate |
| `knowledge_promotion_duration_ms` | Histogram | Milliseconds | Per session | Knowledge | p95 >2hours | Promotion process time |

## Dashboard Tile Mapping

### Left Column: System & Infrastructure
- `api_error_rate_5xx_percent`
- `api_latency_p95_ms`  
- `error_budget_remaining_percent`
- `gcp_cost_daily_usd`
- `resource_utilization_percent`
- `check_script_success_rate_percent`

### Center Column: Business & Revenue
- `revenue_daily_usd`
- `roi_ratio`
- `customer_acquisition_rate`
- `tpop_ctr_ops_percent`
- `tpop_rd_conversion_percent`
- `conversion_rate_percent`

### Right Column: Compliance & Operations
- `age_gate_pass_rate_percent`
- `coa_flags_red`
- `coa_flags_amber`
- `synthesia_queue_depth`
- `publish_sla_compliance_percent`
- `compliance_audit_score`

## Alert Configuration Matrix

### Critical Alerts (PagerDuty)
- `coa_flags_red` > 0
- `age_gate_pass_rate_percent` < 90%
- `api_error_rate_5xx_percent` > 2%
- `service_availability_percent` < 99.5%
- `compliance_violation_count` > 0
- `scheduler_success_rate_percent` < 100%

### Warning Alerts (Slack)
- `revenue_daily_usd` < 80% of target
- `router_latency_ms` p95 > 400ms
- `synthesia_queue_depth` > 50
- `budget_utilization_percent` > 80%
- `test_flake_rate_percent` > 3%

### Info Alerts (Dashboard Only)
- `concurrent_users_count` (trending)
- `tpop_funnel_views` (volume tracking)
- `router_requests_total` (usage metrics)
- `knowledge_base_freshness_hours` (maintenance)

## Metric Implementation

### Custom Metric Creation Script
```javascript
// automation/scripts/create_custom_metric.js
const {MetricServiceClient} = require('@google-cloud/monitoring');
const client = new MetricServiceClient();

async function createCustomMetric(metricType, displayName, description, valueType, metricKind) {
  const request = {
    name: client.projectPath(process.env.GCP_PROJECT),
    metricDescriptor: {
      type: `custom.googleapis.com/herbitrage/${metricType}`,
      displayName: displayName,
      description: description,
      valueType: valueType,
      metricKind: metricKind
    }
  };
  
  const [metric] = await client.createMetricDescriptor(request);
  console.log(`Created metric: ${metric.type}`);
}

// Example: Create revenue metric
await createCustomMetric(
  'revenue_daily_usd',
  'Daily Revenue (USD)',  
  'Daily revenue in US dollars',
  'DOUBLE',
  'GAUGE'
);
```

### Metric Publishing Pattern
```javascript
// automation/scripts/push_custom_metrics.js
async function writeMetric(metricType, value, labels = {}) {
  const dataPoint = {
    interval: {
      endTime: { seconds: Math.floor(Date.now() / 1000) }
    },
    value: { doubleValue: value }
  };
  
  const timeSeriesData = {
    metric: { 
      type: `custom.googleapis.com/herbitrage/${metricType}`,
      labels: labels
    },
    resource: { 
      type: 'global', 
      labels: { project_id: process.env.GCP_PROJECT } 
    },
    points: [dataPoint]
  };
  
  await client.createTimeSeries({
    name: client.projectPath(process.env.GCP_PROJECT),
    timeSeries: [timeSeriesData]
  });
}

// Example usage
await writeMetric('age_gate_pass_rate_percent', 97.5);
await writeMetric('router_latency_ms', 245.8, { provider: 'deepseek' });
```

## Monitoring Best Practices

### Metric Naming Standards
- **Descriptive Names:** Include unit and measurement type
- **Consistent Prefixes:** Group related metrics with common prefixes
- **Avoid Abbreviations:** Use full words for clarity (except well-known units)
- **Include Context:** Add functional area for categorization

### Data Collection Guidelines
- **Appropriate Frequency:** Balance accuracy with cost/performance
- **Consistent Units:** Standardize on milliseconds, percentages, USD, etc.
- **Proper Labeling:** Use labels for dimensions, not separate metrics
- **Historical Retention:** Plan for long-term trend analysis

### Dashboard Design Principles
- **Visual Hierarchy:** Most critical metrics in prominent positions
- **Color Coding:** Consistent color scheme for status indication
- **Threshold Lines:** Clear visual indicators for alert thresholds
- **Time Ranges:** Appropriate default time windows for each metric type

## Maintenance & Evolution

### Regular Review Process
- **Monthly:** Review metric relevance and usage
- **Quarterly:** Update alert thresholds based on trends  
- **Semi-Annually:** Assess new metric requirements
- **Annually:** Complete taxonomy reorganization if needed

### Deprecation Process
1. **Identify:** Unused or redundant metrics
2. **Notify:** Stakeholders of planned deprecation
3. **Grace Period:** 30-day notice before removal
4. **Remove:** Delete metric and update documentation
5. **Verify:** Ensure no broken dashboard tiles or alerts

---

**Verification Commands:**
```bash
# List all custom metrics
gcloud logging metrics list --filter="name:custom.googleapis.com/herbitrage"

# Check metric usage in dashboards
grep -r "custom.googleapis.com/herbitrage" docs/monitoring_pack/

# Validate metric naming convention
automation/scripts/validate_metric_taxonomy.sh --namespace herbitrage
```

**References:**
- [Dashboard Command Center Reference](./DASHBOARD_COMMAND_CENTER_REF.md)
- ADR-002_Dashboard_Command_Center_ENHANCED.md (Root level)
- GCP Cloud Monitoring Custom Metrics documentation