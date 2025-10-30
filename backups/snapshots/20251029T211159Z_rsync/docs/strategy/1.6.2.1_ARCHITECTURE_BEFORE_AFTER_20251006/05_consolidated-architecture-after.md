## CONSOLIDATED ARCHITECTURE (AFTER)

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.jsx (Root)                           │
│                    ThemeProvider + Router                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼─────┐       ┌──────▼──────┐      ┌────▼─────┐
   │  Header  │       │   Sidebar   │      │  Routes  │
   └──────────┘       └─────────────┘      └────┬─────┘
                                                 │
                                    ┌────────────▼────────────┐
                                    │   UltimateCockpit       │
                                    │   (DATA ORCHESTRATOR)   │
                                    │                         │
                                    │  useEffect(() => {      │
                                    │    api.bigquery.all()   │ ← ONE CALL
                                    │    api.health.all()     │ ← ONE CALL
                                    │  })                     │
                                    │                         │
                                    │  unifiedData = {        │
                                    │    bigquery: {...},     │
                                    │    health: {...}        │
                                    │  }                      │
                                    │                         │
                                    │  Renders sub-dashboards │
                                    │  with data as props ↓   │
                                    └────────┬────────────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
    ┌─────────▼─────────┐       ┌───────────▼──────────┐       ┌──────────▼─────────┐
    │ ExecutiveDashboard│       │    Dashboard         │       │ EmpireDashboard    │
    │                   │       │                      │       │                    │
    │ Props: data       │       │ Props: data          │       │ Props: data        │
    │ No data fetching  │       │ No data fetching     │       │ No data fetching   │
    │ Presentation only │       │ Presentation only    │       │ Presentation only  │
    └───────────────────┘       └──────────────────────┘       └────────────────────┘

    ┌────────────────────┐
    │ SquareLiveCockpit  │
    │                    │
    │ Props: data        │
    │ No data fetching   │
    │ Presentation only  │
    └────────────────────┘

    ┌─────────────────┐       ┌─────────────────┐
    │  VoiceMode      │       │   VideoMode     │
    │                 │       │                 │
    │ Uses api client │       │ WebRTC calls    │
    └─────────────────┘       └─────────────────┘

    DELETED (3 stubs):
    ❌ VibeCoding.jsx
    ❌ AgentSwarm.jsx
    ❌ PilotTraining.jsx
```
