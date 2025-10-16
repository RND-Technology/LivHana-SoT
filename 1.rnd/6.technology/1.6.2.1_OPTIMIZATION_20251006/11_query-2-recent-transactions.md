#### Query 2: Recent Transactions

- **Before:** 1000 rows → slice(25) → 800ms
- **After:** 25 rows → LIMIT 25 → 150ms
- **Improvement:** 81% faster
