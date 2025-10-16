### Step 4: Verify (5 minutes)

```bash
# Build the project
npm run build

# Check for errors
# Should complete without errors

# Check bundle size
du -sh dist/assets/
# Should be slightly smaller

# List generated chunks
ls -lh dist/assets/*.js | grep -E "(VibeCoding|AgentSwarm|PilotTraining)"
# Should return nothing (those chunks are gone)

# Start dev server
npm run dev

# Open browser to http://localhost:5173
# Verify:
# - Homepage loads
# - All routes work (Ultimate, Dashboard, etc.)
# - No console errors
# - Sidebar doesn't show deleted items
```
