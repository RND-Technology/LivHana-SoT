# Dashboard Command Center Reference

**Status:** Accepted  
**Source:** ADR-002 + Current Chat Session  
**Last Updated:** 2025-09-28T12:00:00Z  
**Reference:** ADR-002_Dashboard_Command_Center_ENHANCED.md

---

## Overview

The Herbitrage Command Center Dashboard provides comprehensive monitoring across system reliability, business metrics, compliance, and operational health. Built on a three-column grid architecture mixing system and business tiles for unified visibility.

## Architecture Summary

### Design Philosophy
- **Unified View:** Single dashboard for technical and business metrics
- **Real-time Data:** Live metric updates with <10 minute latency
- **Drill-down Capability:** Direct links to BigQuery analysis queries
- **Compliance Integration:** Embedded 21+ compliance monitoring

### Grid Layout (3-Column)
1. **Left Column:** System Reliability & Performance
2. **Center Column:** Business & Revenue Metrics  
3. **Right Column:** Compliance & Pipeline Health

## Tile Groups & Metrics

### 1. Reliability Tiles
**Purpose:** System health and performance monitoring  
**Location:** Left column

| Tile | Metric | Target | Alert Threshold |
|------|--------|--------|----------------|
| **API Error Rate** | 5xx ratio | <1% | >2% |
| **Response Latency** | p95 latency | <400ms | >800ms |
| **Error Budget** | Burn rate | >90% remaining | <70% remaining |
| **Service Availability** | Uptime % | >99.9% | <99.5% |

### 2. Revenue & Business Tiles  
**Purpose:** Financial performance and business KPIs  
**Location:** Center column

| Tile | Metric | Target | Alert Threshold |
|------|--------|--------|----------------|
| **Daily Revenue** | Revenue vs target | Meet/exceed daily target | <80% of target |
| **ROI** | Revenue/Cost ratio | >3:1 | <2:1 |
| **Top Channel** | Highest performing source | N/A | Performance drop >30% |
| **Customer Acquisition** | New signups/day | Growth trajectory | Decline >20% |

### 3. TPOP Funnel Tiles
**Purpose:** TPOP (The Power of Plants) customer journey monitoring  
**Location:** Center/Right column

| Stage | Metric | Conversion Target | Alert Threshold |
|-------|--------|-------------------|-----------------|
| **Views** | Page impressions | Baseline growth | Drop >15% |
| **CTR (OPS)** | Click-through rate | >5% | <3% |
| **Policy Actions** | Engagement events | >10% of clicks | <5% |
| **R&D Joins** | Final conversion | >2% of views | <1% |

### 4. Compliance Tiles
**Purpose:** 21+ compliance and regulatory monitoring  
**Location:** Right column

| Tile | Metric | Target | Alert Threshold |
|------|--------|--------|----------------|
| **Age Gate Pass Rate** | 21+ verification success | >95% | <90% |
| **COA Red Flags** | Critical compliance issues | 0 | >0 |
| **COA Amber Flags** | Warning-level issues | <5 | >10 |
| **Content Compliance** | Policy violation rate | <0.1% | >0.5% |

### 5. HNC Pipeline Tiles  
**Purpose:** HNC (Herbitrage Network Content) pipeline health  
**Location:** Right column

| Tile | Metric | Target | Alert Threshold |
|------|--------|--------|----------------|
| **Synthesia Queue** | Jobs queued | <50 | >100 |
| **Jobs In-Flight** | Active processing | <20 | >40 |
| **Jobs Complete** | Successful completions/day | >10 | <5 |
| **D+1 Publish SLA** | Next-day publishing rate | >95% | <85% |

### 6. Budget & Cost Tiles
**Purpose:** GCP cost monitoring and budget tracking  
**Location:** Left column

| Tile | Metric | Target | Alert Threshold |
|------|--------|--------|----------------|
| **GCP Cost Daily** | Current day spend | Within budget | >110% daily budget |
| **Budget Utilization** | Month-to-date % | <80% | >90% |
| **Cost per User** | Daily cost/active users | Decreasing trend | >20% increase |
| **Resource Efficiency** | Utilization rates | >70% | <50% |

## Custom Metrics Implementation

### GCP Custom Metrics Schema
All custom metrics use the namespace: `custom.googleapis.com/herbitrage/`

#### Business Metrics
```javascript
// Revenue tracking
custom.googleapis.com/herbitrage/revenue_daily_usd          // Gauge
custom.googleapis.com/herbitrage/roi_ratio                  // Gauge  
custom.googleapis.com/herbitrage/customer_acquisition_rate  // Gauge

// TPOP funnel metrics
custom.googleapis.com/herbitrage/tpop_funnel_views         // Counter
custom.googleapis.com/herbitrage/tpop_funnel_clicks        // Counter
custom.googleapis.com/herbitrage/tpop_funnel_conversions   // Counter
```

#### Compliance Metrics  
```javascript
// Age verification and compliance
custom.googleapis.com/herbitrage/age_gate_pass_rate        // Gauge
custom.googleapis.com/herbitrage/coa_flags_red            // Gauge
custom.googleapis.com/herbitrage/coa_flags_amber          // Gauge
custom.googleapis.com/herbitrage/content_violations       // Counter
```

#### Pipeline Metrics
```javascript  
// Synthesia and content pipeline
custom.googleapis.com/herbitrage/synthesia_queue_depth     // Gauge
custom.googleapis.com/herbitrage/synthesia_jobs_active     // Gauge
custom.googleapis.com/herbitrage/synthesia_jobs_completed  // Counter
custom.googleapis.com/herbitrage/publish_sla_compliance    // Gauge
```

### Metric Exporter Implementation
```javascript
// scripts/push_custom_metrics.js
import {MetricServiceClient} from '@google-cloud/monitoring';

const client = new MetricServiceClient();
const project = process.env.GCP_PROJECT;

async function writeGauge(metricType, value) {
  const dataPoint = {
    interval: {
      endTime: { seconds: Math.floor(Date.now() / 1000) }
    },
    value: { doubleValue: value }
  };
  
  const timeSeriesData = {
    metric: { type: metricType },
    resource: { type: 'global', labels: { project_id: project } },
    points: [dataPoint]
  };
  
  await client.createTimeSeries({
    name: client.projectPath(project),
    timeSeries: [timeSeriesData]
  });
}

// Example usage
await writeGauge('custom.googleapis.com/herbitrage/age_gate_pass_rate', 0.97);
await writeGauge('custom.googleapis.com/herbitrage/revenue_daily_usd', 2847.32);
```

## Phase Rollout Strategy

### Phase 1: Foundation (Completed)
- ✅ Base dashboard JSON with API latency and revenue tiles
- ✅ Basic GCP monitoring integration
- ✅ Core infrastructure tiles

### Phase 2: Business Intelligence (Current)
- 🔄 Custom metrics implementation
- 🔄 TPOP funnel tracking  
- 🔄 ROI and revenue analysis tiles
- 🔄 BigQuery drill-down integration

### Phase 3: Compliance Integration
- ⏳ Age gate monitoring tiles
- ⏳ COA compliance tracking
- ⏳ Content policy violation monitoring
- ⏳ Automated compliance reporting

### Phase 4: Advanced Analytics
- ⏳ Predictive analytics tiles
- ⏳ Trend analysis and forecasting
- ⏳ Customer lifetime value tracking
- ⏳ A/B testing results integration

## Dashboard Configuration

### Base Dashboard JSON Structure
```json
{
  "displayName": "Herbitrage Command Center",
  "mosaicLayout": {
    "tiles": [
      {
        "width": 4, "height": 4,
        "widget": {
          "title": "API Error Rate",
          "scorecard": {
            "gaugeView": {
              "upperBound": 0.05,
              "lowerBound": 0.0
            }
          }
        }
      }
    ]
  },
  "dashboardFilters": [
    {
      "filterType": "RESOURCE_LABEL",
      "labelKey": "project_id",
      "stringValue": "${GCP_PROJECT}"
    }
  ]
}
```

### Tile Update Frequency
- **System Metrics:** 1 minute intervals
- **Business Metrics:** 5 minute intervals  
- **Compliance Metrics:** 1 minute intervals
- **Pipeline Metrics:** 30 second intervals

## Security & Compliance Considerations

### Data Privacy
- **No PII in Metrics:** Only aggregated counts and ratios
- **Anonymized User Data:** All user identifiers hashed or removed
- **Access Control:** Dashboard restricted to authorized personnel

### Compliance Footer
All dashboard pages display the compliance statement:
> "21+ • No medical claims • Natural cannabinoids; NIST-validated methods."

### Audit Trail
- All dashboard access logged with user identification
- Metric push operations tracked with timestamps
- Configuration changes require approval and are version controlled

## Verification Hooks

### Existing Validation
- Dashboard accessibility verification
- Metric data freshness validation  
- Tile rendering and update confirmation

### Required Scripts (To Be Created)
- `automation/scripts/check_dashboard_metrics.sh` - Metric availability validation
- `automation/scripts/verify_alerting_channels.sh` - Alert delivery testing
- `automation/scripts/validate_metric_taxonomy.sh` - Custom metric compliance

## Integration Points

### Monitoring Systems
- **GCP Cloud Monitoring:** Primary metric source
- **BigQuery:** Analytics and drill-down queries
- **PagerDuty:** Critical alert escalation  
- **Slack:** Operational notifications

### Data Sources
- **Square POS:** Transaction and revenue data
- **Identity Platform:** Age verification metrics
- **Synthesia API:** Content pipeline status
- **AlloyDB:** Business intelligence queries

## Acceptance Criteria

### Tier 1 Completeness Requirements
- [x] Dashboard deployed and accessible to operators
- [ ] All six tile groups present with live data  
- [ ] BigQuery drill-down links functional
- [ ] Metric update latency <10 minutes
- [ ] Alert thresholds configured and tested

### Success Metrics
- **Dashboard Availability:** >99.9% uptime
- **Metric Freshness:** <5 minutes for critical metrics
- **User Adoption:** Daily usage by operations team
- **Alert Accuracy:** <5% false positive rate

---

**Verification Commands:**
```bash
# Check dashboard accessibility (future)
automation/scripts/check_dashboard_metrics.sh --url "${DASHBOARD_URL}"

# Validate metric freshness (future)  
automation/scripts/validate_metric_taxonomy.sh --namespace herbitrage

# Test alert delivery (future)
automation/scripts/verify_alerting_channels.sh --test-mode
```

**References:**
- ADR-002_Dashboard_Command_Center_ENHANCED.md (Root level)
- `docs/monitoring_pack/dashboard.json` (Configuration)
- Custom metrics implementation in `scripts/push_custom_metrics.js`