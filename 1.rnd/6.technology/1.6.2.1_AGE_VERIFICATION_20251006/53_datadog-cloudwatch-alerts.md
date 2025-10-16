### Datadog / CloudWatch Alerts

```yaml
# Low success rate
- alert: AgeVerificationLowSuccessRate
  condition: success_rate < 90%
  window: 1 hour
  severity: critical

# High processing time
- alert: AgeVerificationSlowResponse
  condition: p95_processing_time > 500ms
  window: 5 minutes
  severity: warning

# Service health
- alert: AgeVerificationServiceDown
  condition: health_check_fails > 3
  window: 5 minutes
  severity: critical
```

---
