### Issue 2: SSE Not Working with Auth

**Symptom**: EventSource cannot send Authorization headers

**Solution**:

- EventSource spec doesn't support custom headers
- Options:
  1. Use WebSocket instead
  2. Pass token via query parameter
  3. Use cookie-based auth for SSE
  4. Implement custom fetch-based streaming

**Current Implementation**: Uses EventSource with note that backend must accept alternative auth method
