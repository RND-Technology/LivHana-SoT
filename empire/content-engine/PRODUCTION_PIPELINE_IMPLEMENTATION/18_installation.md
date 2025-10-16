### Installation

```bash
# 1. Clone repository
cd empire/content-engine

# 2. Install dependencies (if any)
# npm install (currently uses only Node.js built-ins)

# 3. Make scripts executable
chmod +x video-production-pipeline.mjs

# 4. Verify FFmpeg installation
ffmpeg -version

# 5. Verify gcloud setup
gcloud auth list
gcloud config get-value project

# 6. Run tests
node video-production-pipeline.test.mjs
```

---
