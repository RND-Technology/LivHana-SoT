### 1. Reasoning Gateway Integration

The memory system is automatically integrated with the DeepSeek reasoning processor. When enabled, it:

1. **Enriches prompts** with customer context before sending to AI
2. **Learns from responses** automatically after completion
3. **Tracks conversation patterns** for better recommendations

**Enable in environment:**

```bash
ENABLE_MEMORY_LEARNING=true
```

**Usage in reasoning jobs:**

```javascript
// In job metadata, include customerId
await reasoningQueue.add('reasoning-task', {
  prompt: "What do you recommend for sleep?",
  sessionId: "session-456",
  metadata: {
    customerId: "customer-123"  // This triggers memory enrichment
  }
});
```
