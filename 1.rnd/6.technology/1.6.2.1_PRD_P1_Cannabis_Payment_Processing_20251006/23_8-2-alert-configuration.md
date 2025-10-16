### 8.2 Alert Configuration

```yaml
PAYMENT_ALERTS:
  critical:
    - payment_success_rate < 95%
    - age_verification_failure
    - thc_non_compliance_detected
    - authorize_net_connection_failure
    
  warning:
    - payment_success_rate < 98%
    - fraud_score > 70
    - unusual_transaction_volume
    - high_dispute_rate
    
  info:
    - daily_revenue_milestone
    - new_customer_first_purchase
    - monthly_revenue_target_reached
```
