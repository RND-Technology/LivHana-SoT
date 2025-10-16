### Automatic (Reasoning Gateway)

Already integrated! Just add `customerId` to job metadata:

```javascript
await reasoningQueue.add('reasoning-task', {
  prompt: "What do you recommend?",
  metadata: {
    customerId: "customer-123"  // Memory learning activates automatically
  }
});
```
