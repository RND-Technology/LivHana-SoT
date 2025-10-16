### 8.3 Common Debug Commands
```bash
# Check running processes
ps aux | grep node

# Check port usage
lsof -i :8080
lsof -i :3000

# Check logs
tail -f logs/application.log
```
