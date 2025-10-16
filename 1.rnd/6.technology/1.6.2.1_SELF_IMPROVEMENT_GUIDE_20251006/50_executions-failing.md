### Executions Failing

```bash
# Check test failures
npm test

# Check rollback logs
grep "Rolling back" /var/log/livhana-improvement.log

# Check proposal status
redis-cli GET "improvement:proposal:{id}"
```
