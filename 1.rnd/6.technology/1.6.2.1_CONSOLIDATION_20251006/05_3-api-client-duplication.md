### 3. API CLIENT DUPLICATION

**Current State:**

- `src/utils/autonomousApi.js` - Full axios instance with interceptors (127 lines)
- Inline `fetch()` calls in 4+ components
- ExecutiveDashboard: 6 separate fetch functions (lines 148-395)
- SquareLiveCockpit: 3 fetch functions (lines 33-59)
- UltimateCockpit: Inline parallel fetch (lines 157-182)

**Duplication Count:**

- 3 separate BigQuery dashboard data fetchers
- 2 separate health check implementations
- 4 different error handling patterns
