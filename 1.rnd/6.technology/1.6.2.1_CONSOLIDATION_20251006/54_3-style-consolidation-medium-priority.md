### 3. Style Consolidation (MEDIUM PRIORITY)

**Problem:**

- 327 instances of inline `sx={{}}` styles
- Theme exists but underutilized
- Same styles repeated across components

**Solution:**

- Create `src/theme/styles.js` with common patterns
- Replace inline styles with references
- Theme becomes single source of truth

**Impact:**

- Bundle reduction: 8KB (deduplicated objects)
- Consistency: 100% (same styles everywhere)
- Maintenance: Change once, update everywhere

---
