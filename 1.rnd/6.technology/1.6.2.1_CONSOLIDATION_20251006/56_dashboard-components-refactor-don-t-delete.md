### Dashboard Components (Refactor, Don't Delete)

```
UltimateCockpit.jsx      - Master container (KEEP)
Dashboard.jsx            - System health (KEEP - refactor to props)
ExecutiveDashboard.jsx   - Business intelligence (KEEP - refactor to props)
EmpireDashboard.jsx      - Revenue engines (KEEP - refactor to props)
SquareLiveCockpit.jsx    - BigQuery live data (KEEP - refactor to props)
```

**Why Keep:**

- Each has distinct UI and functionality
- UltimateCockpit already orchestrates them
- Deleting would lose working features
- Refactoring to props is the right move
