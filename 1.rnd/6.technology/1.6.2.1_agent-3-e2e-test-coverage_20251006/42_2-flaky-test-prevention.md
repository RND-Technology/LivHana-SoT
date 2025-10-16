### 2. Flaky Test Prevention

- ✅ Always use explicit waits (not fixed delays)
- ✅ Wait for specific elements, not timeouts
- ✅ Retry flaky assertions with exponential backoff
- ✅ Use test-specific data attributes (`data-testid`)
