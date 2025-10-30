### 8.1 Payment Metrics Dashboard

```javascript
const CANNABIS_PAYMENT_METRICS = {
  // Revenue metrics
  daily_revenue: 'sum(amount) where date = today',
  monthly_revenue: 'sum(amount) where month = current',
  average_order_value: 'avg(amount) where status = success',
  
  // Success metrics
  payment_success_rate: 'success_count / total_count * 100',
  authorization_rate: 'authorized_count / attempted_count * 100',
  settlement_rate: 'settled_count / authorized_count * 100',
  
  // Compliance metrics
  age_verification_rate: 'age_verified_count / total_count * 100',
  thc_compliance_rate: 'thc_compliant_count / total_count * 100',
  texas_resident_rate: 'texas_resident_count / total_count * 100',
  
  // Risk metrics
  fraud_detection_rate: 'fraud_detected_count / total_count * 100',
  chargeback_rate: 'chargeback_count / total_count * 100',
  dispute_rate: 'dispute_count / total_count * 100'
};
```
