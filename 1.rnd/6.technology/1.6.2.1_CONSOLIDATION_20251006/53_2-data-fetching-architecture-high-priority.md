### 2. Data Fetching Architecture (HIGH PRIORITY)

**Problem:**

- Each dashboard fetches its own data independently
- ExecutiveDashboard makes 6 API calls
- SquareLiveCockpit makes 3 API calls
- UltimateCockpit makes separate calls
- Result: 3x fetches of same BigQuery data

**Solution:**

- Lift data fetching to `UltimateCockpit`
- Pass data down as props to sub-dashboards
- Sub-dashboards become presentational only

**Impact:**

- Data fetching: 3x BigQuery calls → 1x call
- Bundle reduction: 50KB (remove duplicate fetch logic)
- Performance: Parallel loading, centralized caching
