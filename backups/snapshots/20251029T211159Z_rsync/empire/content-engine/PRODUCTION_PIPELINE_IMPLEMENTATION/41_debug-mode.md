### Debug Mode

Enable verbose logging:

```javascript
// Add at top of video-production-pipeline.mjs
process.env.DEBUG = 'true';
```

Or use Node.js built-in debugging:

```bash
node --trace-warnings video-production-pipeline.mjs produce 1
```

---
