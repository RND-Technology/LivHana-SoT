## CURRENT ARCHITECTURE (BEFORE)

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
                    ┌────────────────────────────┼───────────────────────┐
                    │                            │                       │
          ┌─────────▼─────────┐     ┌───────────▼──────────┐  ┌────────▼────────┐
          │ UltimateCockpit   │     │  ExecutiveDashboard  │  │    Dashboard    │
          │                   │     │                      │  │                 │
          │ - Imports:        │     │ fetchBigQueryData()  │  │ fetchDashboard  │
          │   Dashboard       │     │ fetchHistorical()    │  │   Data()        │
          │   Executive       │     │ fetchProducts()      │  │ fetchHealth()   │
          │   Empire          │     │ fetchServiceHealth() │  └─────────────────┘
          │   Square          │     │ fetchCompliance()    │
          │   Autonomous      │     │ fetchCustomerIntel() │
          │                   │     └──────────────────────┘
          │ fetchLiveData()   │
          │ (separate calls)  │     ┌────────────────────────┐
          └───────────────────┘     │  SquareLiveCockpit     │
                                    │                        │
                                    │ fetchLiveData()        │
          ┌─────────────────┐       │ - dashboard()          │
          │ EmpireDashboard │       │ - historical()         │
          │                 │       │ - products()           │
          │ Mock data +     │       └────────────────────────┘
          │ Revenue calc    │
          └─────────────────┘

          ┌─────────────────┐       ┌─────────────────┐
          │  VoiceMode      │       │   VideoMode     │
          │                 │       │                 │
          │ fetch() calls   │       │ WebRTC calls    │
          └─────────────────┘       └─────────────────┘

          ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
          │  VibeCoding     │       │  AgentSwarm     │       │ PilotTraining   │
          │                 │       │                 │       │                 │
          │ "coming soon"   │       │ Static text     │       │ Static text     │
          │ (STUB)          │       │ (STUB)          │       │ (STUB)          │
          └─────────────────┘       └─────────────────┘       └─────────────────┘
```
