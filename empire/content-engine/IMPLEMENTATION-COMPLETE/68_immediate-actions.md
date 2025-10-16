### Immediate Actions

1. **Configure API Keys**
   ```bash
   cd empire/content-engine
   cp .env.example .env
   # Edit .env with your API keys
   ```

2. **Run Setup**
   ```bash
   ./setup-pipeline.sh
   ```

3. **Create Test Episode**
   ```bash
   # Create output/high-noon-cartoon/episode_001.json
   # Use format from QUICK-REFERENCE.md
   ```

4. **Test Production**
   ```bash
   ./video-production-pipeline.mjs produce 1
   ```
