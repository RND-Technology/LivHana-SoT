### Fixture Architecture

**File:** `tests/fixtures/auth-tokens.ts`

```typescript
export const TEST_TOKENS = {
  VALID_ADMIN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  VALID_USER: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  EXPIRED_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  INVALID_TOKEN: 'invalid-token-12345',
};

export function getTestToken(role: 'admin' | 'user' = 'admin') {
  return role === 'admin' ? TEST_TOKENS.VALID_ADMIN : TEST_TOKENS.VALID_USER;
}
```

**File:** `tests/fixtures/mock-data.ts`

```typescript
export const MOCK_SQUARE_PRODUCTS = [
  {
    id: 'PROD-001',
    name: 'Premium THCA Flower - 3.5g',
    price: 45.00,
    sku: 'THCA-35',
    category: 'THCA Flower',
  },
  // ... 20 more products
];

export const MOCK_BIGQUERY_DASHBOARD = {
  metrics: {
    todayRevenue: 1250.50,
    weekRevenue: 8750.25,
    monthRevenue: 35600.00,
    yearRevenue: 892345.67,
    totalTransactions: 12847,
    totalCustomers: 3421,
    avgOrderValue: 69.42,
  },
  recentTransactions: [
    { id: 'TXN-001', amount: 125.00, created_at: '2025-10-01T12:30:00Z' },
    // ... 24 more transactions
  ],
};
```

**File:** `tests/fixtures/test-users.ts`

```typescript
export const TEST_USERS = {
  ADMIN: {
    id: 'USER-ADMIN-001',
    email: 'admin@livhana.local',
    role: 'admin',
    token: TEST_TOKENS.VALID_ADMIN,
  },
  CUSTOMER_WITH_MEMBERSHIP: {
    id: 'CUST-001',
    email: 'gold-member@test.com',
    membershipTier: 'GOLD',
    membershipId: 'MEM-GOLD-001',
  },
  CUSTOMER_NO_VERIFICATION: {
    id: 'CUST-002',
    email: 'unverified@test.com',
    ageVerified: false,
  },
};
```
