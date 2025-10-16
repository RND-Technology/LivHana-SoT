#### Alert: Memory Usage High (>80%)

**Trigger**: Container/process memory usage exceeds 80%

**Impact**: Risk of OOM kills and service crashes

**Response**:

1. Check memory usage: `docker stats` or `ps aux --sort=-%mem | head`
2. Look for memory leaks in New Relic
3. Check if memory usage is growing over time
4. Review recent code changes for memory issues
5. Restart service to clear memory (temporary fix)
6. Scale up memory allocation if consistent high usage
7. Profile application for memory leaks

**Resolution**: Fix memory leak or scale resources

---
