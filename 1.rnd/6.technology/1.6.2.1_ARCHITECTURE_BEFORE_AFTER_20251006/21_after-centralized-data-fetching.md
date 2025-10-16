### AFTER: Centralized Data Fetching

```
App
├─ UltimateCockpit (DATA LAYER)
│  ├─ fetchLiveData()              ← ONE FETCH
│  │  ├─ api.bigquery.all()        ← Parallel
│  │  └─ api.health.all()          ← Parallel
│  │
│  ├─ unifiedData = { ... }
│  │
│  ├─ Dashboard (props: data)      ← No fetching
│  ├─ ExecutiveDashboard (props: data) ← No fetching
│  ├─ SquareLiveCockpit (props: data)  ← No fetching
│  └─ EmpireDashboard (props: data)    ← No fetching
│
└─ Routes
   ├─ /ultimate → UltimateCockpit
   ├─ /dashboard → Dashboard (props from context)
   ├─ /executive → ExecutiveDashboard (props from context)
   └─ /cockpit → SquareLiveCockpit (props from context)

SOLUTION: Data fetched once, shared across all dashboards
          Presentation components receive props
          Clean separation of concerns
```

---
