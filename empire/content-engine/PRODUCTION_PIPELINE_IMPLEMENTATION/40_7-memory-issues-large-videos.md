#### 7. Memory Issues (Large Videos)

**Error:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" ./video-production-pipeline.mjs produce 1
```
