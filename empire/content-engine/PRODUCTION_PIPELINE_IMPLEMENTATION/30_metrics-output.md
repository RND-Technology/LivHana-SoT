### Metrics Output

Metrics are saved to:

```
output/metrics/episode_001_metrics.json
output/metrics/episode_002_metrics.json
...
```

Sample metrics file:

```json
{
  "episodeNumber": 1,
  "timestamp": "2025-10-07T12:00:00.000Z",
  "metrics": {
    "totalDuration": 450.5,
    "apiCalls": {
      "elevenLabs": 5,
      "openai": 8,
      "dId": 5,
      "suno": 1
    },
    "filesGenerated": {
      "audio": 6,
      "images": 8,
      "videos": 5
    },
    "errors": []
  },
  "costs": {
    "breakdown": {
      "elevenLabs": 0.15,
      "openai": 0.32,
      "dId": 1.25,
      "suno": 0.10
    },
    "total": 1.82,
    "currency": "USD"
  }
}
```
