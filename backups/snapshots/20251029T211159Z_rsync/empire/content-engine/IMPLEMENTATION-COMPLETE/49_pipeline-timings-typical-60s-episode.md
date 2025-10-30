### Pipeline Timings (Typical 60s Episode)

| Step | Duration | Notes |
|------|----------|-------|
| Load Script | <1s | JSON parsing |
| Generate Voices | 10-20s | 5 lines, cached after first run |
| Generate Characters | 15-30s | 5 images, cached after first run |
| Create Lip-Sync | 60-90s | D-ID processing (4x real-time) |
| Generate Backgrounds | 15-30s | 3 images, cached after first run |
| Generate Music | 20-40s | 60s track |
| Compose Video | 30-60s | FFmpeg rendering |
| Upload to GCS | 10-20s | 50-100 MB |
| Distribute | 30-60s | 3 platforms |
| **Total** | **3-5 min** | First run without caching |
| **Total (Cached)** | **2-3 min** | With character/background cache |
