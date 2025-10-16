### Step 1.3: Update Sidebar.jsx

**File:** `src/components/Sidebar.jsx`

Find and remove navigation links for deleted components:

```javascript
// DELETE these menu items
{
  text: 'Vibe Coding',
  path: '/vibe-coding',
  icon: <Code />
},
{
  text: 'Agent Swarm',
  path: '/agent-swarm',
  icon: <Group />
},
{
  text: 'Pilot Training',
  path: '/pilot-training',
  icon: <School />
}
```
