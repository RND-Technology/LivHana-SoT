### Data Fetching

```
BEFORE:                          AFTER:
├─ Each component fetches        ├─ UltimateCockpit fetches
│  independently                 │  all data once
├─ 3x BigQuery calls             ├─ 1x BigQuery call
└─ No caching                    └─ Centralized caching
```
