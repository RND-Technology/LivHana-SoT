### 4.2 Data Consistency Risks

**Risk Matrix:**

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|-----------|--------|----------|-----------|
| BigQuery sync lag (15min) | High | Low | MEDIUM | Add real-time checkout validation |
| Price drift during checkout | Medium | Medium | MEDIUM | Lock price at cart add, not checkout |
| Age verification expiry edge case | Low | High | MEDIUM | Add 30-day renewal reminder |
| Duplicate payment on retry | Low | High | HIGH | Implement idempotency keys |
| Membership billing failure | Medium | High | HIGH | Add retry + email notification |
| Raffle draw randomness audit | Low | Critical | HIGH | Store draw_seed in BigQuery |

**Detailed Analysis:**

**1. Duplicate Payment Risk:**

```
Scenario: Customer clicks "Pay Now" → Network timeout → Retries
Problem: Payment processed twice if first request succeeded but response lost
Current Mitigation: Transaction ID includes timestamp (unique per retry)
Recommended Fix: Add idempotency keys to payment requests

// Proposed solution:
const idempotencyKey = `${customerId}_${cartId}_${Date.now()}`;
await kajaGateway.chargeCard(amount, paymentMethod, description, { idempotencyKey });

// Gateway stores: idempotency_key → transaction_id mapping (24h TTL)
// Duplicate request with same key → return original transaction result
```

**2. Age Verification Expiry Edge Case:**

```
Scenario: Customer verified on 2024-10-01, verification expires 2025-10-01
Problem: Customer tries to checkout on 2025-10-01 at 12:01 AM (just expired)
Current Behavior: Verification fails, customer must re-verify
Recommended Fix: Add 30-day renewal grace period + proactive email

// Implementation:
if (verification.expiresAt < Date.now() + (30 * 24 * 60 * 60 * 1000)) {
  // Send renewal email 30 days before expiry
  await emailService.sendAgeVerificationRenewal(customerId, verification.expiresAt);
}
```

**3. Membership Billing Failure:**

```
Scenario: Monthly billing date arrives, customer's card declined
Problem: Subscription cancelled immediately, customer loses benefits
Recommended Fix: 7-day grace period with retry + email notifications

// Proposed flow:
Day 1: Billing attempt fails → Email "Payment failed, please update card"
Day 3: Retry billing → If fails, email "2nd attempt failed"
Day 7: Final retry → If fails, suspend membership (not cancel)
Day 14: Cancel membership if still not resolved

// Status progression:
active → payment_failed → suspended → cancelled
```

**4. Raffle Draw Randomness Audit:**

```
Current: Draw uses crypto.randomBytes() (CSPRNG - secure)
Gap: No audit trail for draw seed
Risk: Cannot prove fairness in dispute

// Proposed solution:
const drawSeed = crypto.randomBytes(32).toString('hex');
logger.info({ raffleId, drawSeed }, 'Raffle draw seed generated');

// Store in BigQuery:
await bqClient.dataset(DATASET).table(RAFFLES_TABLE).update(raffleId, {
  draw_seed: drawSeed,
  draw_timestamp: new Date().toISOString()
});

// Verification: Anyone can re-run draw with same seed → verify winner
```

---
