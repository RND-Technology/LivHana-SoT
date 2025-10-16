### 10.2 Rollback Plan

```bash
#!/bin/bash
# Cannabis payment rollback procedure

echo "🚨 INITIATING CANNABIS PAYMENT ROLLBACK"

# 1. Stop new payment processing
kubectl scale deployment cannabis-payment-api --replicas=0

# 2. Enable maintenance mode
kubectl apply -f maintenance-mode.yaml

# 3. Revert to previous payment processor
kubectl rollout undo deployment/cannabis-payment-api

# 4. Verify rollback success
./check_payment_health.sh

# 5. Re-enable with previous version
kubectl scale deployment cannabis-payment-api --replicas=3

echo "✅ Cannabis payment rollback complete"
```
