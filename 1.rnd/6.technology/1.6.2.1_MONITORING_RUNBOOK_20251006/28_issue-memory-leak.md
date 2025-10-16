### Issue: Memory Leak

**Symptoms**: Memory usage grows over time, eventual crash

**Causes**:

- Event listeners not removed
- Circular references
- Large object retention
- Cache not expiring

**Resolution**:

1. Profile with Chrome DevTools or clinic.js
2. Check for event listener leaks
3. Review cache TTL settings
4. Use weak references where appropriate
