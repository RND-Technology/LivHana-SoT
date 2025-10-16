### Step 2: Add Route

In the same file, add this route inside the `<Routes>` component (around line 216):

```javascript
<Route path="/executive" element={<ExecutiveDashboard />} />
```

**Complete Routes section should look like:**

```javascript
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/voice" element={<VoiceMode />} />
  <Route path="/video" element={<VideoMode />} />
  <Route path="/vibe-coding" element={<VibeCoding />} />
  <Route path="/agent-swarm" element={<AgentSwarm />} />
  <Route path="/empire-systems" element={<EmpireSystems />} />
  <Route path="/empire-dashboard" element={<EmpireDashboard />} />
  <Route path="/products" element={<SquareRealProducts />} />
  <Route path="/cockpit" element={<SquareLiveCockpit />} />
  <Route path="/executive" element={<ExecutiveDashboard />} /> {/* NEW */}
  <Route path="/pilot-training" element={<PilotTraining />} />
  <Route path="/settings" element={<Settings />} />
</Routes>
```
