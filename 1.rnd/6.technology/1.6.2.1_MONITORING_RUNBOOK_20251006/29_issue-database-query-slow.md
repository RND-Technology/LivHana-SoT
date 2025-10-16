### Issue: Database Query Slow

**Symptoms**: High database query latency

**Causes**:

- Missing indexes
- Large result sets
- N+1 query problem
- Database overloaded

**Resolution**:

1. Analyze query with EXPLAIN
2. Add appropriate indexes
3. Implement query result caching
4. Use pagination for large result sets
5. Consider read replicas

---
