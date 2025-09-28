# Deterministic CI Playwright Reference

**Status:** Planned  
**Source:** Current Chat Session (ADR-003 Referenced)  
**Last Updated:** 2025-09-28T12:00:00Z  
**Reference:** ADR-003 (Location TBD)

---

## Overview

The Deterministic Playwright CI Pipeline ensures reliable, flake-free end-to-end testing through structured test taxonomy, comprehensive mocking strategies, and strict deterministic execution patterns. This system implements the Model-Context-Protocol (MCP) for consistent test execution across environments.

## Test Taxonomy

### Test Categories & Responsibilities

#### 1. Unit Tests
**Scope:** Individual component/function testing  
**Location:** `*/*.test.js`, `*/*.spec.js`  
**Duration Target:** <100ms per test  
**Mocking:** Pure functions, minimal dependencies

```javascript
// Example: Age verification unit test
describe('AgeVerification', () => {
  it('should validate 21+ compliance', () => {
    const result = validateAge('1990-01-01');
    expect(result.verified).toBe(true);
    expect(result.age).toBeGreaterThanOrEqual(21);
  });
});
```

#### 2. Contract Tests  
**Scope:** API interface validation  
**Location:** `tests/contract/`  
**Duration Target:** <500ms per test  
**Mocking:** External API responses, database interactions

```javascript
// Example: Square payment contract test
describe('Square API Contract', () => {
  it('should handle payment processing', async () => {
    const mockSquareResponse = fixtures.squarePaymentSuccess;
    nock('https://connect.squareupsandbox.com')
      .post('/v2/payments')
      .reply(200, mockSquareResponse);
      
    const result = await processPayment(testPaymentData);
    expect(result.status).toBe('COMPLETED');
  });
});
```

#### 3. Integration Tests
**Scope:** Service-to-service interaction testing  
**Location:** `tests/integration/`  
**Duration Target:** <2s per test  
**Mocking:** External services, preserved database state

```javascript
// Example: Age gate integration test
describe('Age Gate Integration', () => {
  it('should enforce 21+ across user journey', async () => {
    // Test complete flow from verification to checkout
    await navigateToAgeGate();
    await submitValidAge();
    await expectCheckoutAccess();
  });
});
```

#### 4. End-to-End (E2E) Tests
**Scope:** Complete user journey validation  
**Location:** `tests/e2e/playwright/`  
**Duration Target:** <30s per test  
**Mocking:** Minimal - real services with test data

```javascript
// Example: Complete purchase flow E2E
test('Complete 21+ compliant purchase flow', async ({ page }) => {
  await test.step('Navigate to product page', async () => {
    await page.goto('/products/indica-blend');
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
  });
  
  await test.step('Verify age gate', async () => {
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="age-verification"]')).toBeVisible();
  });
  
  await test.step('Complete purchase', async () => {
    await fillAgeVerification(page, validTestUser);
    await completeCheckout(page, testPaymentMethod);
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
  });
});
```

## Mocking Strategy

### Mock Hierarchy (Deterministic → Real)

#### Level 1: Pure Mocks (Unit Tests)
- **Date/Time:** Fixed timestamps for consistency
- **Random:** Seeded generators for reproducibility  
- **External APIs:** Complete mock responses
- **File System:** In-memory mock implementations

#### Level 2: Service Mocks (Contract/Integration)
- **Database:** Test database with known state
- **Payment Processing:** Sandbox environment with test cards
- **Identity Services:** Mock user sessions and tokens
- **Third-party APIs:** Nock/MSW interceptors

#### Level 3: Minimal Mocks (E2E)
- **Payment Gateway:** Sandbox mode only
- **Email Services:** Test SMTP or captured emails
- **External Content:** Cached responses for speed
- **Analytics:** Test/dev property tracking

### Mock Configuration Examples

#### Time Determinism
```javascript
// playwright.config.js
export default {
  use: {
    // Consistent timezone for all tests
    timezoneId: 'UTC',
    // Mock system time for deterministic tests
    mockTime: new Date('2025-09-28T12:00:00Z')
  },
  projects: [{
    name: 'e2e-deterministic',
    use: {
      // Disable animations for consistency
      reducedMotion: 'reduce'
    }
  }]
};
```

#### API Mocking with MSW
```javascript
// tests/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // Square payment mock
  rest.post('*/v2/payments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        payment: {
          id: 'DETERMINISTIC_PAYMENT_ID',
          status: 'COMPLETED',
          amount_money: { amount: 2500, currency: 'USD' }
        }
      })
    );
  }),
  
  // Age verification mock  
  rest.post('*/verify-age', (req, res, ctx) => {
    const { birthDate } = req.body;
    const age = calculateAge(birthDate);
    return res(
      ctx.status(200),
      ctx.json({
        verified: age >= 21,
        age: age,
        sessionToken: 'DETERMINISTIC_SESSION_TOKEN'
      })
    );
  })
];
```

## Flake Reduction Targets

### Performance Targets
| Test Type | Success Rate Target | Flake Tolerance | Max Duration |
|-----------|-------------------|-----------------|--------------|
| **Unit** | >99.9% | <0.1% | 5 minutes total |
| **Contract** | >99.5% | <0.5% | 10 minutes total |
| **Integration** | >99.0% | <1.0% | 15 minutes total |  
| **E2E** | >95.0% | <5.0% | 30 minutes total |

### Flake Prevention Strategies

#### 1. Wait Strategies
```javascript
// Bad: Fixed delays
await page.waitForTimeout(1000);

// Good: Condition-based waits
await expect(page.locator('[data-testid="loading"]')).toBeHidden();
await expect(page.locator('[data-testid="content"]')).toBeVisible();
```

#### 2. Element Selection
```javascript
// Bad: Unstable selectors
page.click('.btn-primary:nth-child(2)');

// Good: Stable data attributes
page.click('[data-testid="submit-button"]');
```

#### 3. Network Stability
```javascript
// Network idle validation
await page.waitForLoadState('networkidle');

// API response interception
await page.route('**/api/**', route => {
  // Ensure consistent API responses
  route.fulfill({ json: mockData });
});
```

## CI/CD Integration

### Pipeline Structure
```yaml
# .github/workflows/playwright-ci.yml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test --shard=${{ matrix.shard }}
        env:
          COMPLIANCE_LEVEL: "21+"
          TEST_MODE: "true"
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/
```

### Test Execution Gates

#### Pre-commit Hooks
```bash
# Basic smoke tests before commit
npx playwright test --grep "@smoke"
```

#### CI Pipeline Gates
1. **Unit Tests:** Must pass with >99.9% success rate
2. **Contract Tests:** Must pass with >99.5% success rate  
3. **Integration Tests:** Must pass with >99% success rate
4. **E2E Smoke Tests:** Must pass critical user journeys

#### Production Deployment Gates
- All test suites must pass
- Flake rate must be <5% over last 10 runs
- Performance regression tests must pass
- Compliance verification tests must pass

## Test Data Management

### Deterministic Test Data
```javascript
// tests/fixtures/users.js
export const testUsers = {
  validAdult: {
    email: 'test+adult@livhana.com',
    birthDate: '1990-01-01',
    id: 'TEST_USER_ADULT_001'
  },
  underageUser: {
    email: 'test+minor@livhana.com', 
    birthDate: '2010-01-01',
    id: 'TEST_USER_MINOR_001'
  }
};

// tests/fixtures/products.js
export const testProducts = {
  indicaBlend: {
    id: 'PROD_INDICA_001',
    name: 'Relaxing Indica Blend',
    price: 2500, // cents
    thcContent: 15.5,
    cbdContent: 2.1
  }
};
```

### Database State Management
```javascript
// tests/setup/database.js
export async function resetTestDatabase() {
  await db.query('DELETE FROM test_orders WHERE created_at < NOW() - INTERVAL "1 day"');
  await db.query('DELETE FROM test_users WHERE email LIKE "test+%"');
  
  // Seed consistent test data
  await seedTestUsers();
  await seedTestProducts();
}
```

## Compliance Testing

### Age Gate Validation
```javascript
describe('21+ Compliance', () => {
  test('blocks underage users from product pages', async ({ page }) => {
    await page.goto('/products');
    
    // Simulate underage verification attempt
    await page.fill('[data-testid="birth-year"]', '2010');
    await page.click('[data-testid="verify-age"]');
    
    // Should be redirected to blocked page
    await expect(page.url()).toContain('/age-restricted');
    await expect(page.locator('[data-testid="underage-notice"]')).toBeVisible();
  });
  
  test('allows verified 21+ users to proceed', async ({ page }) => {
    await page.goto('/products');
    
    // Simulate valid age verification
    await page.fill('[data-testid="birth-year"]', '1990');
    await page.click('[data-testid="verify-age"]');
    
    // Should access product catalog
    await expect(page.url()).toContain('/products');
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });
});
```

### Content Compliance
```javascript
describe('Content Policy Compliance', () => {
  test('displays required disclaimers', async ({ page }) => {
    await page.goto('/products/indica-blend');
    
    // Verify compliance footer
    await expect(page.locator('[data-testid="compliance-footer"]'))
      .toContainText('21+ • No medical claims • Natural cannabinoids');
    
    // Verify no medical claims in product description
    const productText = await page.locator('[data-testid="product-description"]').textContent();
    expect(productText).not.toMatch(/cure|treat|medical|therapeutic/i);
  });
});
```

## Verification Hooks

### Existing Scripts (Referenced)
- CI pipeline configuration validation
- Test environment setup verification

### Required Scripts (To Be Created)
- `automation/scripts/check_playwright_health.sh` - Test runner validation
- `automation/scripts/verify_test_coverage.sh` - Coverage threshold enforcement
- `automation/scripts/validate_test_determinism.sh` - Flake rate monitoring
- `automation/scripts/run_compliance_test_suite.sh` - 21+ compliance validation

## Monitoring & Reporting

### Test Metrics
```yaml
# Custom metrics for test health
custom.googleapis.com/herbitrage/test_success_rate_percent     # Gauge
custom.googleapis.com/herbitrage/test_duration_seconds         # Histogram  
custom.googleapis.com/herbitrage/test_flake_rate_percent       # Gauge
custom.googleapis.com/herbitrage/compliance_test_pass_rate     # Gauge
```

### Dashboard Integration
- Test execution status tiles
- Flake rate trend analysis  
- Coverage percentage tracking
- Compliance test health monitoring

---

**Verification Commands:**
```bash
# Run full test suite
npm run test:all

# Run compliance-specific tests
npm run test:compliance

# Check test determinism (future)
automation/scripts/validate_test_determinism.sh --runs 10

# Generate coverage report (future)
automation/scripts/verify_test_coverage.sh --threshold 80
```

**Next Steps:**
1. Locate or create formal ADR-003 for CI/Testing architecture
2. Implement Playwright test framework with MCP integration
3. Create missing verification and monitoring scripts
4. Establish comprehensive compliance test coverage
5. Set up automated flake rate monitoring and alerting