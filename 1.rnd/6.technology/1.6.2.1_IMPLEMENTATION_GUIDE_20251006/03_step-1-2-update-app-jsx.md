### Step 1.2: Update App.jsx

**File:** `src/App.jsx`

**Remove these imports (lines 19, 20, 22):**

```javascript
// DELETE
const VibeCoding = lazy(() => import('./components/VibeCoding'));
const AgentSwarm = lazy(() => import('./components/AgentSwarm'));
const PilotTraining = lazy(() => import('./components/PilotTraining'));
```

**Remove these routes (lines 218, 219, 224):**

```javascript
// DELETE
<Route path="/vibe-coding" element={<ErrorBoundary componentName="VibeCoding"><VibeCoding /></ErrorBoundary>} />
<Route path="/agent-swarm" element={<ErrorBoundary componentName="AgentSwarm"><AgentSwarm /></ErrorBoundary>} />
<Route path="/pilot-training" element={<ErrorBoundary componentName="PilotTraining"><PilotTraining /></ErrorBoundary>} />
```
