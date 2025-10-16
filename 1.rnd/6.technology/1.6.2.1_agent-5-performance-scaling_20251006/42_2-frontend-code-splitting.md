#### 2. Frontend Code Splitting

**File**: `/frontend/vibe-cockpit/src/App.jsx`
**Impact**: 40-60% initial bundle reduction
**Effort**: 4 hours

**Changes:**

- Lazy load all route components (lines 185-199)
- Add React.Suspense wrapper
- Configure Vite chunking

**Expected Result**:

- Initial load: ~2MB → ~800KB
- Time to interactive: 3-5s → 1-2s
