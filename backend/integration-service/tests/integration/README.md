# Square → BigQuery Sync Integration Tests

## Overview
Comprehensive integration test suite for the Square sync pipeline that validates the entire data flow from Square API through data transformation to BigQuery insertion.

## Test File Location
`/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service/tests/integration/square-sync.test.js`

## Test Coverage Summary

### Total Tests: 27 (All Passing)
- 12 Test Suites
- 27 Individual Test Cases
- Execution Time: ~400-500ms

## Test Categories

### 1. Square API Connection & Authentication (2 tests)
- ✓ Successfully connect to Square API with valid credentials
- ✓ Fail gracefully with invalid credentials (401 Unauthorized)

**Purpose:** Validates that the sync pipeline can authenticate with Square's API and handle authentication failures properly.

### 2. Product Catalog Fetch (2 tests)
- ✓ Fetch product catalog successfully (200 OK)
- ✓ Handle paginated catalog fetch with cursor

**Purpose:** Ensures the catalog fetch logic works correctly and handles pagination for large product catalogs.

### 3. Payment History Fetch - 180 Days (2 tests)
- ✓ Fetch payment history for last 180 days
- ✓ Handle empty payment history

**Purpose:** Validates that payment data is retrieved correctly within the required time window and handles edge cases.

### 4. BigQuery Insertion - Payments Table (2 tests)
- ✓ Insert payment data into BigQuery successfully
- ✓ Batch insert large payment datasets (1000 per batch)

**Purpose:** Tests the payment data insertion logic and validates batch processing for large datasets (2500+ records).

### 5. BigQuery Insertion - Items Table (2 tests)
- ✓ Insert catalog items into BigQuery successfully
- ✓ Handle items with missing optional fields

**Purpose:** Ensures catalog items are inserted correctly and handles incomplete data gracefully.

### 6. Error Handling - Square API Unavailable (3 tests)
- ✓ Handle Square API 500 errors gracefully
- ✓ Handle network timeout errors (ECONNABORTED)
- ✓ Handle rate limiting (429 Too Many Requests)

**Purpose:** Validates resilience against Square API failures and rate limits.

### 7. Error Handling - BigQuery Unavailable (3 tests)
- ✓ Handle BigQuery insertion errors gracefully
- ✓ Handle BigQuery authentication errors
- ✓ Handle partial BigQuery insertion failures

**Purpose:** Tests error handling for BigQuery failures including quota exceeded, auth errors, and partial failures.

### 8. Idempotency - Duplicate Sync Prevention (3 tests)
- ✓ Detect and skip duplicate payment records
- ✓ Allow re-sync of updated records (based on updated_at timestamp)
- ✓ Track last sync timestamp to prevent redundant syncs

**Purpose:** Ensures the sync process is idempotent and doesn't create duplicate records.

### 9. Mock Fallback - Degraded Mode (2 tests)
- ✓ Fallback to mock data when Square API is unavailable
- ✓ Indicate degraded mode in response metadata

**Purpose:** Tests the degraded mode functionality that serves mock data when Square is unavailable.

### 10. End-to-End Sync Cycle (2 tests)
- ✓ Complete full sync cycle: Square → Transform → BigQuery
- ✓ Handle partial failures during sync cycle

**Purpose:** Validates the complete sync pipeline from end to end and tests partial failure scenarios.

### 11. Data Transformation Validation (2 tests)
- ✓ Correctly transform Square payment to BigQuery schema
- ✓ Correctly transform Square catalog item to BigQuery schema

**Purpose:** Ensures data transformations from Square's format to BigQuery schema are accurate.

### 12. Concurrent Sync Prevention (2 tests)
- ✓ Prevent multiple simultaneous syncs
- ✓ Use lock file or mutex to prevent concurrent syncs

**Purpose:** Tests the locking mechanism that prevents concurrent sync operations.

## Running the Tests

### Run All Integration Tests
```bash
npm test -- tests/integration/square-sync.test.js
```

### Run with Verbose Output
```bash
npm test -- tests/integration/square-sync.test.js --verbose
```

### Run with Coverage Report
```bash
npm test -- tests/integration/square-sync.test.js --coverage
```

### Run Specific Test Suite
```bash
npm test -- tests/integration/square-sync.test.js -t "Square API Connection"
```

## Test Architecture

### Mocking Strategy
- **axios**: Mocked to simulate Square API responses
- **@google-cloud/bigquery**: Mocked to test BigQuery operations without actual database calls
- **Environment Variables**: Set programmatically for test isolation

### Test Isolation
Each test suite uses:
- `beforeEach()`: Sets up clean environment and fresh mocks
- `afterEach()`: Restores original environment variables
- `jest.clearAllMocks()`: Ensures no test pollution

## Key Test Scenarios

### Happy Path
- Square API returns 200 OK
- Data transforms correctly
- BigQuery accepts all insertions
- Sync completes successfully

### Error Scenarios
- Square API down (500, timeout, network errors)
- BigQuery unavailable (auth errors, quota exceeded)
- Partial failures (some records fail, others succeed)
- Rate limiting (429 responses with retry-after headers)

### Edge Cases
- Empty datasets (no payments/items)
- Missing optional fields (null handling)
- Large datasets (2500+ records, batch processing)
- Duplicate records (idempotency checks)
- Concurrent sync attempts (locking mechanism)

## Dependencies
- **jest**: Test framework
- **axios**: HTTP client (mocked)
- **@google-cloud/bigquery**: BigQuery client (mocked)
- **nock**: HTTP mocking library (installed but axios mocks used)

## Test Data Examples

### Mock Square Payment
```javascript
{
  id: 'PAY123',
  amount_money: { amount: 4500, currency: 'USD' },
  status: 'COMPLETED',
  customer_id: 'CUST123',
  location_id: 'LOC123',
  created_at: '2024-01-01T00:00:00Z',
  source_type: 'CARD',
  card_details: { card: { card_brand: 'VISA' } },
  receipt_url: 'https://squareup.com/receipt/123'
}
```

### Mock Square Catalog Item
```javascript
{
  type: 'ITEM',
  id: 'ITEM123',
  item_data: {
    name: 'Premium THCA Flower - 3.5g',
    category_id: 'CAT123',
    variations: [{
      item_variation_data: {
        sku: 'THCA-35',
        price_money: { amount: 4500, currency: 'USD' }
      }
    }],
    available_online: true
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z'
}
```

### Transformed BigQuery Payment Record
```javascript
{
  id: 'PAY123',
  amount: 4500,
  currency: 'USD',
  status: 'COMPLETED',
  customer_id: 'CUST123',
  location_id: 'LOC123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: null,
  source_type: 'CARD',
  card_brand: 'VISA',
  receipt_url: 'https://squareup.com/receipt/123'
}
```

## Performance Benchmarks
- Single test execution: ~1-6ms per test
- Full suite execution: ~400-500ms
- Concurrent sync test: ~200ms (simulates actual async operation)
- Batch insert test: ~2ms (tests 2500 records)

## Future Enhancements
- [ ] Add integration tests with real Square sandbox API
- [ ] Add integration tests with BigQuery emulator
- [ ] Add performance benchmarks for large dataset syncs
- [ ] Add tests for webhook-triggered syncs
- [ ] Add tests for incremental sync logic
- [ ] Add tests for sync retry mechanisms
- [ ] Add tests for sync monitoring and alerting

## Maintenance Notes
- Tests use mocked dependencies - no external API calls required
- All tests are deterministic and should always pass
- No cleanup required after test execution
- Tests can run in parallel without conflicts

## Related Files
- Implementation: `/backend/integration-service/scripts/sync-square-to-bigquery.js`
- Scheduler: `/backend/integration-service/src/square-sync-scheduler.js`
- Catalog API: `/backend/integration-service/src/square_catalog.js`
- BigQuery Client: `/backend/integration-service/src/bigquery_live.js`

## Test Results (Latest Run)
```
PASS tests/integration/square-sync.test.js
  Square → BigQuery Sync Pipeline Integration Tests
    ✓ 27 tests passed
    ✓ 0 tests failed
    ✓ Execution time: 0.444s

Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        0.444 s
```

## Contact & Support
For questions or issues with these tests, contact the integration service team or open an issue in the project repository.
