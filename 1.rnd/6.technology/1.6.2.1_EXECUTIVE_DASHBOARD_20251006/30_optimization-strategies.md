### Optimization Strategies

1. **Polling Interval:** Set to 30 seconds by default. Adjust `REFRESH_INTERVAL` constant.
2. **Parallel Fetching:** All data fetches run in parallel via `Promise.all()`
3. **Error Boundaries:** Component handles errors gracefully without crashing
4. **Conditional Rendering:** Charts only render when data is available
5. **Memo/Callback:** Uses `useCallback` for stable function references
