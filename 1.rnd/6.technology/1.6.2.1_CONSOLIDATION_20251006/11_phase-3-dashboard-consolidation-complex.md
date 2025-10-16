### PHASE 3: DASHBOARD CONSOLIDATION (COMPLEX)

**Strategy:** UltimateCockpit is ALREADY the master container

**Current Architecture (GOOD):**

```javascript
// UltimateCockpit.jsx (line 50-54)
import Dashboard from './Dashboard';
import ExecutiveDashboard from './ExecutiveDashboard';
import EmpireDashboard from './EmpireDashboard';
import SquareLiveCockpit from './SquareLiveCockpit';
```

**Problem:** Each sub-dashboard fetches its own data independently

**Solution: Lift Data Fetching to UltimateCockpit**

```javascript
// UltimateCockpit.jsx - Add unified data layer
const [dashboardData, setDashboardData] = useState({
  bigquery: {},
  health: {},
  reasoning: {},
  empire: {},
});

// ONE fetch function, pass data down to children
<ExecutiveDashboard data={dashboardData.bigquery} />
<EmpireDashboard data={dashboardData.empire} />
<SquareLiveCockpit data={dashboardData.bigquery} />
<Dashboard data={dashboardData.health} />
```

**Refactor Each Dashboard:**

- Remove data fetching logic (useEffect + fetch)
- Accept data as props
- Focus on presentation only
- Reduce from 650-1173 lines to 300-500 lines each

**Impact:**

- Data fetching: Deduplicated (3x BigQuery calls → 1)
- Bundle: -50KB (remove duplicate fetch logic)
- Performance: Parallel data loading
- Caching: ONE cache layer for all dashboards
