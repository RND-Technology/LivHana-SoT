### API Patterns

```
BEFORE:                          AFTER:
├─ 3 different patterns          ├─ 1 unified client
│  ├─ fetch() inline             │  └─ api.* everywhere
│  ├─ axios direct               └─ Consistent error handling
│  └─ autonomousApi.js
└─ 12+ duplicate calls           └─ Deduplicated calls
```
