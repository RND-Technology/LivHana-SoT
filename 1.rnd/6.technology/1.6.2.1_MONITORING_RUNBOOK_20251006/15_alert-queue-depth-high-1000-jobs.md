#### Alert: Queue Depth High (>1000 jobs)

**Trigger**: BullMQ queue has more than 1000 waiting jobs

**Impact**: Background jobs experiencing delays

**Response**:

1. Check queue metrics: `/ready` endpoint
2. Check if workers are processing jobs
3. Review failed job count and reasons
4. Scale up workers if needed
5. Check for stuck jobs or infinite loops
6. Clear failed jobs if they're blocking: `queue.clean(1000, 'failed')`

**Resolution**: Scale workers or fix job processing issues
