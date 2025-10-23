---
title: "P2: Codegen - Under Spec Lock"
purpose: Generate minimal implementation that satisfies spec
status: MANDATORY - Coding phase
enforcement: CI typecheck + test coverage
---

# PROMPT 2: CODEGEN (Code Builder)

**Use this ONLY after Prompt 1 (Spec Lock) is complete.**

## Prompt Template

```
You are the Code Builder. Inputs: {spec}, {lang}, {repo layout}.

Produce minimal implementation ONLY at public seams.

Rules:
- No globals, no I/O in domain layer, typed errors only
- Follow spec exactly - no additional features
- All functions have explicit return types
- No implicit any, no escape hatches
- Error handling for all external calls
- Timeouts and backpressure on all I/O
- Idempotent operations (safe to retry)
- No cleverness - prefer 3 simple functions over 1 complex one

Emit unit+property tests that pass deterministically.

Output:
1. Implementation code
2. Unit tests
3. Property tests
4. Integration tests (if needed)
```

## Enforcement

### TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Test Coverage Gate

```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Complexity Limits

```json
// .eslintrc.json
{
  "rules": {
    "max-lines-per-function": ["error", { "max": 50 }],
    "complexity": ["error", { "max": 10 }]
  }
}
```

## Example Usage

### Input

```yaml
# specs/features/quote-comparison.spec.yaml (from Prompt 1)
```

### Expected Output

```typescript
// src/lib/quote-comparison.ts

import { type QuoteReq, type QuoteResp } from '../types/carrier.js';
import { type CarrierAdapter } from '../types/carrier.js';

export class QuoteComparison {
  constructor(private adapters: CarrierAdapter[]) {
    if (adapters.length === 0) {
      throw new Error('At least one adapter required');
    }
  }

  async getAllQuotes(req: QuoteReq): Promise<QuoteResp[]> {
    // Parallel fetch from all carriers
    const results = await Promise.allSettled(
      this.adapters.map(adapter => adapter.getQuote(req))
    );

    // Extract successful quotes
    const quotes: QuoteResp[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        quotes.push(result.value);
      }
    }

    if (quotes.length === 0) {
      throw new Error('No carriers available');
    }

    // Sort by price (cheapest first)
    return quotes.sort((a, b) => a.priceCents - b.priceCents);
  }
}
```

```typescript
// tests/unit/quote-comparison.test.ts

import { QuoteComparison } from '../../src/lib/quote-comparison.js';
import { type CarrierAdapter } from '../../src/types/carrier.js';

describe('QuoteComparison', () => {
  it('should sort quotes by price ascending', async () => {
    const mockAdapter: CarrierAdapter = {
      name: 'skipcart',
      getQuote: async () => ({
        carrier: 'skipcart',
        priceCents: 500,
        etaMins: 60,
        quoteId: 'test-123',
      }),
      createOrder: async () => ({ orderId: '1', externalId: '1', status: 'created' }),
      parseWebhook: () => ({ carrier: 'skipcart', externalId: '1', status: 'created', at: Date.now() }),
    };

    const comparison = new QuoteComparison([mockAdapter]);
    const quotes = await comparison.getAllQuotes({
      fromZip: '78209',
      toZip: '78258',
      weightGrams: 500,
      etaMins: 60,
    });

    expect(quotes).toHaveLength(1);
    expect(quotes[0]!.priceCents).toBe(500);
  });
});
```

## Checklist

Before committing:

- [ ] All spec requirements implemented
- [ ] TypeScript strict mode passes
- [ ] ESLint passes with zero warnings
- [ ] All tests pass (unit + property)
- [ ] Test coverage ≥80%
- [ ] Complexity limits respected
- [ ] No console errors or warnings
- [ ] No TODO/FIXME comments

## Violations

If code fails checks:

1. Commit is blocked
2. Fix issues before retry
3. No bypass allowed

---

**Status**: MANDATORY - No exceptions
**Enforcement**: Pre-commit hook + CI gates
**Owner**: Jesse Niesen (CEO)
**Last Updated**: 2025-10-08
