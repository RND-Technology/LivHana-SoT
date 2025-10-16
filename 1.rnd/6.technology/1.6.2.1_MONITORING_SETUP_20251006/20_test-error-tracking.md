### Test Error Tracking

Create a test error:

```javascript
// Add a test endpoint
app.get('/test-error', (req, res) => {
  throw new Error('Test error for Sentry');
});

// Visit in browser or curl
curl http://localhost:3005/test-error
```

Check Sentry dashboard to see the error appear.
