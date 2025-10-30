### 4.1 Cannabis-Specific Fraud Detection

```python
class CannabisFraudDetection:
    def __init__(self):
        self.risk_factors = {
            'age_verification_mismatch': 100,    # Immediate block
            'non_texas_location': 95,           # Very high risk
            'multiple_failed_age_checks': 90,   # High risk
            'unusual_purchase_amount': 70,      # Medium-high risk
            'new_customer_large_order': 60,     # Medium risk
            'rapid_repeat_purchases': 50        # Monitor closely
        }
    
    def calculate_risk_score(self, transaction):
        score = 0
        
        # Age verification inconsistencies
        if not transaction.age_verified:
            score += self.risk_factors['age_verification_mismatch']
        
        # Geographic restrictions
        if transaction.customer.location.state != 'TX':
            score += self.risk_factors['non_texas_location']
        
        # Purchase pattern analysis
        if transaction.amount > transaction.customer.avg_order * 3:
            score += self.risk_factors['unusual_purchase_amount']
        
        # Velocity checks
        recent_orders = self.get_recent_orders(transaction.customer.id, hours=24)
        if len(recent_orders) > 5:
            score += self.risk_factors['rapid_repeat_purchases']
        
        return min(score, 100)  # Cap at 100%
    
    def determine_action(self, risk_score):
        if risk_score >= 90:
            return 'BLOCK'
        elif risk_score >= 70:
            return 'MANUAL_REVIEW'
        elif risk_score >= 50:
            return 'ENHANCED_VERIFICATION'
        else:
            return 'APPROVE'
```
