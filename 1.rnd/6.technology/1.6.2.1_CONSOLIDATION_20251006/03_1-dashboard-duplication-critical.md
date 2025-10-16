### 1. DASHBOARD DUPLICATION (CRITICAL)

**Problem:** 5 separate dashboard components with overlapping functionality

| Component | Size | Purpose | Data Source | Overlap |
|-----------|------|---------|-------------|---------|
| `UltimateCockpit.jsx` | 679 lines | Unified hub with sub-dashboards | Multi-service | **MASTER** |
| `Dashboard.jsx` | 650 lines | System health + metrics | localhost:3005 | 80% with Ultimate |
| `ExecutiveDashboard.jsx` | 1173 lines | Business intelligence | BigQuery via 3005 | 70% with Ultimate |
| `EmpireDashboard.jsx` | 321 lines | Revenue engines | Mock + real data | 60% with Ultimate |
| `SquareLiveCockpit.jsx` | 498 lines | BigQuery live data | BigQuery via 3005 | 85% with Executive |

**Analysis:**

- `UltimateCockpit` ALREADY imports and embeds all other dashboards (lines 50-54)
- It acts as a router/container, not a duplicate implementation
- **Verdict:** Keep UltimateCockpit as master, consolidate data fetching
