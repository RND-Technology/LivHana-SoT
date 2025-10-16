### Graceful Degradation

- Failed pages: Log and continue
- Batch insert failure: Fall back to row-by-row
- Nested block failure: Log but preserve parent content
- Missing properties: Default to null
