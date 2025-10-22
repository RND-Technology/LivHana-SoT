#### Port Conflicts

```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 [PID]

# Or use different port
PORT=8081 npm run dev
```
