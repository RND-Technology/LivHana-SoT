# RPM Task Template - Liv Hana Tier-1

**Purpose:** Standardized task assignment for efficiency and guardrails
**Version:** 1.0.0
**Status:** Production Ready

---

## Task Assignment Protocol

### 1. Task Identification
```yaml
task_id: "unique_identifier"
priority: "high|medium|low"
assigned_to: "agent_name|human_name"
created_by: "liv_hana"
created_at: "ISO8601_timestamp"
```

### 2. RPM DNA Framework
```yaml
result: "What this task delivers (precise, measurable)"
purpose: "Why this task matters (underlying motivation)"
map: # Massive Action Plan
  - action: "Specific step 1"
    timeframe: "estimated_hours"
    cost: "estimated_cost"
    roi_projection: "expected_return"
    dependencies: ["prerequisite_tasks"]
    guardrails: ["compliance_checks"]
  - action: "Specific step 2"
    timeframe: "estimated_hours"
    cost: "estimated_cost"
    roi_projection: "expected_return"
    dependencies: ["prerequisite_tasks"]
    guardrails: ["compliance_checks"]
```

### 3. Competition Tracking
```yaml
prediction:
  participant: "task_assignee"
  metric: "roi_per_day|timeframe|cost"
  value: "projected_value"
  unit: "USD|hours|days"
  timeframe: "completion_window"
  confidence: "0-100_percentage"
  context:
    project: "project_name"
    task_id: "unique_identifier"
```

### 4. Guardrails & Compliance
```yaml
guardrails:
  age21: true|false
  pii_redaction: true|false
  cannabis_compliance: true|false
  financial_accuracy: true|false
  secrets_handling: true|false
  medical_claims: true|false
  novel_cannabinoids: true|false
compliance_status: "passed|failed|pending"
```

### 5. Execution Tracking
```yaml
status: "assigned|in_progress|completed|blocked"
progress: "0-100_percentage"
actuals:
  timeframe_hours: "actual_hours_spent"
  cost: "actual_cost"
  roi_achieved: "actual_return"
  completed_at: "ISO8601_timestamp"
  verified_by: "verifier_name"
```

---

## Task Assignment Examples

### Example 1: Voice Service Deployment
```yaml
task_id: "voice_service_deploy_001"
priority: "high"
assigned_to: "liv_hana"
created_by: "jesse_ceo"
created_at: "2025-10-21T21:00:00Z"

result: "Voice service operational on port 8080 with STT/TTS integration"
purpose: "Enable voice-first interaction for cannabis intelligence"
map:
  - action: "Deploy voice service container"
    timeframe: "2"
    cost: "0"
    roi_projection: "500"
    dependencies: ["docker_ready"]
    guardrails: ["age21", "cannabis_compliance"]
  - action: "Configure STT/TTS endpoints"
    timeframe: "1"
    cost: "0"
    roi_projection: "300"
    dependencies: ["voice_service_deployed"]
    guardrails: ["age21"]

prediction:
  participant: "liv_hana"
  metric: "roi_per_day"
  value: "800"
  unit: "USD"
  timeframe: "30"
  confidence: "85"
  context:
    project: "voice_mode_deployment"
    task_id: "voice_service_deploy_001"

guardrails:
  age21: true
  pii_redaction: true
  cannabis_compliance: true
  financial_accuracy: true
  secrets_handling: true
  medical_claims: true
  novel_cannabinoids: true
compliance_status: "passed"

status: "completed"
progress: "100"
actuals:
  timeframe_hours: "3"
  cost: "0"
  roi_achieved: "800"
  completed_at: "2025-10-21T21:30:00Z"
  verified_by: "jesse_ceo"
```

### Example 2: Compliance Service Integration
```yaml
task_id: "compliance_integration_002"
priority: "high"
assigned_to: "qa_agent"
created_by: "liv_hana"
created_at: "2025-10-21T21:00:00Z"

result: "Compliance service integrated with all voice interactions"
purpose: "Ensure all interactions meet regulatory requirements"
map:
  - action: "Deploy compliance service"
    timeframe: "1"
    cost: "0"
    roi_projection: "200"
    dependencies: ["fastapi_ready"]
    guardrails: ["age21", "cannabis_compliance"]
  - action: "Integrate with voice service"
    timeframe: "2"
    cost: "0"
    roi_projection: "300"
    dependencies: ["compliance_service_deployed"]
    guardrails: ["age21"]

prediction:
  participant: "qa_agent"
  metric: "roi_per_day"
  value: "500"
  unit: "USD"
  timeframe: "30"
  confidence: "90"
  context:
    project: "compliance_integration"
    task_id: "compliance_integration_002"

guardrails:
  age21: true
  pii_redaction: true
  cannabis_compliance: true
  financial_accuracy: true
  secrets_handling: true
  medical_claims: true
  novel_cannabinoids: true
compliance_status: "passed"

status: "completed"
progress: "100"
actuals:
  timeframe_hours: "3"
  cost: "0"
  roi_achieved: "500"
  completed_at: "2025-10-21T21:45:00Z"
  verified_by: "liv_hana"
```

---

## Task Assignment Workflow

### 1. Task Creation
1. **Identify Need:** What needs to be done?
2. **Define Result:** What will this deliver?
3. **Clarify Purpose:** Why does this matter?
4. **Create MAP:** Break down into actionable steps
5. **Assign Agent:** Who is best suited?
6. **Set Prediction:** What do we expect?
7. **Check Guardrails:** Ensure compliance

### 2. Task Execution
1. **Accept Assignment:** Agent acknowledges task
2. **Update Status:** Mark as in_progress
3. **Track Progress:** Update percentage
4. **Log Actuals:** Record time/cost/ROI
5. **Verify Completion:** QA agent validates
6. **Submit Results:** Update competition system

### 3. Task Completion
1. **Final Status:** Mark as completed
2. **Actual Metrics:** Record final results
3. **Competition Entry:** Submit to leaderboard
4. **Lessons Learned:** Document insights
5. **Archive Task:** Move to completed tasks

---

## Agent Assignment Guidelines

### Liv Hana (Chief of Staff)
- **Specializes in:** Orchestration, coordination, strategic planning
- **Best for:** Complex multi-step tasks, cross-agent coordination
- **ROI Target:** $1000+/day
- **Confidence:** 85-95%

### RPM Planning Agent
- **Specializes in:** Task breakdown, timeline estimation, resource planning
- **Best for:** Planning tasks, MAP generation, timeline optimization
- **ROI Target:** $500+/day
- **Confidence:** 80-90%

### Research Agent
- **Specializes in:** Information gathering, best practices, market intelligence
- **Best for:** Research tasks, competitive analysis, trend monitoring
- **ROI Target:** $300+/day
- **Confidence:** 75-85%

### QA Agent
- **Specializes in:** Validation, compliance, quality assurance
- **Best for:** Testing tasks, compliance checks, quality validation
- **ROI Target:** $400+/day
- **Confidence:** 90-95%

### Cheetah (Execution Layer)
- **Specializes in:** Fast implementation, code generation, technical execution
- **Best for:** Technical tasks, code implementation, system deployment
- **ROI Target:** $600+/day
- **Confidence:** 80-90%

---

## Competition Integration

### Daily Scoring
- **ROI/$/Day:** Primary metric (50% weight)
- **Timeframe Accuracy:** Secondary metric (25% weight)
- **Cost Accuracy:** Secondary metric (20% weight)
- **Compliance Score:** Tertiary metric (5% weight)

### Weekly Awards
- **Best ROI/$/Day:** Highest daily return
- **Most Accurate:** Best composite score
- **Fastest Execution:** Shortest completion time
- **Most Compliant:** Highest compliance score
- **Most Improved:** Biggest week-over-week gain

### Monthly Championships
- **Overall Champion:** Best composite performance
- **ROI Champion:** Highest ROI/$/Day
- **Accuracy Champion:** Most accurate predictions
- **Efficiency Champion:** Best time/cost ratio
- **Innovation Champion:** Most creative solutions

---

## Quality Assurance

### Pre-Assignment Checklist
- [ ] Task has clear result definition
- [ ] Purpose is well-defined
- [ ] MAP is actionable and specific
- [ ] Agent assignment is appropriate
- [ ] Prediction is realistic
- [ ] Guardrails are comprehensive
- [ ] Dependencies are identified

### Post-Completion Checklist
- [ ] Actual results are recorded
- [ ] Competition entry is submitted
- [ ] Lessons learned are documented
- [ ] Quality is validated by QA agent
- [ ] Task is archived properly
- [ ] Performance metrics are updated

---

## Continuous Improvement

### Weekly Review
- Analyze task completion rates
- Review prediction accuracy
- Identify improvement opportunities
- Update task templates
- Refine agent assignments
- Optimize guardrails

### Monthly Optimization
- Review competition results
- Analyze ROI trends
- Identify best practices
- Update assignment guidelines
- Refine scoring metrics
- Plan next month's focus

---

**Status:** Production Ready
**Last Updated:** 2025-10-21
**Next Review:** 2025-10-28