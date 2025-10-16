### API Call Patterns

**Files with axios/fetch**: 8 components making API calls

**Concern**: No request deduplication visible
**Risk**: Cache stampede on dashboard load

**Recommended**: Implement React Query or SWR

```jsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['bigquery', 'dashboard'],
  queryFn: fetchDashboard,
  staleTime: 30_000,
  gcTime: 300_000,
  refetchOnWindowFocus: false
});
```

**Benefits:**

- Automatic request deduplication
- Background refetch
- Optimistic updates
- Cache invalidation

---
