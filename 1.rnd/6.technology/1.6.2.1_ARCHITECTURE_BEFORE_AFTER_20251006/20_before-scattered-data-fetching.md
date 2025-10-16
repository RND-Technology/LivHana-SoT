### BEFORE: Scattered Data Fetching

```
App
├─ UltimateCockpit
│  ├─ fetchLiveData()              ← Fetches data
│  ├─ Dashboard (embedded)
│  │  └─ fetchDashboardData()      ← Fetches AGAIN
│  ├─ ExecutiveDashboard (embedded)
│  │  └─ fetchBigQueryData()       ← Fetches AGAIN
│  ├─ SquareLiveCockpit (embedded)
│  │  └─ fetchLiveData()           ← Fetches AGAIN
│  └─ EmpireDashboard (embedded)
│     └─ Mock data
└─ Routes
   ├─ /ultimate → UltimateCockpit
   ├─ /dashboard → Dashboard        ← Fetches independently
   ├─ /executive → ExecutiveDashboard ← Fetches independently
   └─ /cockpit → SquareLiveCockpit  ← Fetches independently

PROBLEM: Same data fetched 3-4x depending on route
```
