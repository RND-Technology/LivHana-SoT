### Step 2: Update App.jsx (10 minutes)

**File:** `src/App.jsx`

**Remove these lines:**

Find and delete (around lines 19-22):

```javascript
const VibeCoding = lazy(() => import('./components/VibeCoding'));
const AgentSwarm = lazy(() => import('./components/AgentSwarm'));
const PilotTraining = lazy(() => import('./components/PilotTraining'));
```

Find and delete (around lines 218-224):

```javascript
<Route path="/vibe-coding" element={<ErrorBoundary componentName="VibeCoding"><VibeCoding /></ErrorBoundary>} />
<Route path="/agent-swarm" element={<ErrorBoundary componentName="AgentSwarm"><AgentSwarm /></ErrorBoundary>} />
<Route path="/pilot-training" element={<ErrorBoundary componentName="PilotTraining"><PilotTraining /></ErrorBoundary>} />
```

Save the file.
