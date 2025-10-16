### Adding New Capabilities

1. Add capability to `ClaudeAutonomousAgent`:

```javascript
// In claude-autonomous-agent.js
this.capabilities.add('my_new_capability');
```

2. Implement the action:

```javascript
async myNewCapabilityAction(parameters) {
  // Implementation
  return { result: 'success', data: {} };
}
```

3. Add to executeStep switch:

```javascript
case 'my_new_capability':
  return await this.myNewCapabilityAction(step.parameters);
```
