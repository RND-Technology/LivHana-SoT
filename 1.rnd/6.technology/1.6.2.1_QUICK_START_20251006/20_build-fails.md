### Build Fails

```bash
# Check for syntax errors
npm run lint

# Check for missing imports
grep -r "VibeCoding\|AgentSwarm\|PilotTraining" src/

# Reset if needed
git checkout -- src/App.jsx src/components/Sidebar.jsx
```
