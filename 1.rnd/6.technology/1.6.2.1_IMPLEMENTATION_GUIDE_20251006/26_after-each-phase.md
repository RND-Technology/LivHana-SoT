### After Each Phase

```bash
# 1. Verify build succeeds
npm run build

# 2. Check bundle size
du -sh dist/assets/

# 3. Run tests
npm run test

# 4. Run dev server and manually test
npm run dev

# 5. Check for console errors
# Open browser DevTools → Console
# Navigate through all routes
# Verify no errors or warnings
```
