### **Problem: Service won't start**

```bash
# Check if port is in use
lsof -ti:4002
# If output shows PID, kill it:
lsof -ti:4002 | xargs kill -9

# Try again
npm start
```
