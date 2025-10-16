## MIGRATION PATH

```
┌─────────────────────────────────────────────────────────────┐
│                      PHASE 1: DELETE                         │
│                      (30 minutes)                            │
├─────────────────────────────────────────────────────────────┤
│  rm VibeCoding.jsx, AgentSwarm.jsx, PilotTraining.jsx      │
│  Update App.jsx (remove imports/routes)                     │
│  Update Sidebar.jsx (remove nav links)                      │
│  npm run build                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  PHASE 2: UNIFY API CLIENT                   │
│                      (2 days)                                │
├─────────────────────────────────────────────────────────────┤
│  Create src/api/livhanaApiClient.js                         │
│  Implement unified methods (bigquery, health, reasoning)    │
│  Migrate ExecutiveDashboard to use api.*                    │
│  Migrate SquareLiveCockpit to use api.*                     │
│  Migrate VoiceMode to use api.*                             │
│  Delete autonomousApi.js                                    │
│  Test all API calls                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              PHASE 3: LIFT DATA FETCHING                     │
│                      (5 days)                                │
├─────────────────────────────────────────────────────────────┤
│  Refactor UltimateCockpit:                                  │
│    - Add unifiedData state                                  │
│    - Fetch all data in parallel                             │
│    - Pass data to sub-dashboards as props                   │
│                                                              │
│  Refactor sub-dashboards:                                   │
│    - Remove data fetching logic                             │
│    - Accept data as props                                   │
│    - Become presentation-only                               │
│    - ExecutiveDashboard, Dashboard, SquareLiveCockpit,      │
│      EmpireDashboard                                        │
│                                                              │
│  Test all dashboards                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               PHASE 4: CENTRALIZE STYLES                     │
│                      (2 days)                                │
├─────────────────────────────────────────────────────────────┤
│  Create src/theme/styles.js                                 │
│  Export style constants (cardStyles, buttonStyles, etc.)    │
│  Migrate components to use references                       │
│    - UltimateCockpit (50 instances → 10 references)        │
│    - ExecutiveDashboard (48 instances → 8 references)      │
│    - VideoMode (39 instances → 7 references)               │
│    - VoiceMode (46 instances → 9 references)               │
│  Visual regression testing                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  PHASE 5: TEST & DEPLOY                      │
│                      (5 days)                                │
├─────────────────────────────────────────────────────────────┤
│  Update all tests                                           │
│  Integration testing                                        │
│  Visual regression testing                                  │
│  Performance benchmarking                                   │
│  Deploy to production                                       │
└─────────────────────────────────────────────────────────────┘
```

---
