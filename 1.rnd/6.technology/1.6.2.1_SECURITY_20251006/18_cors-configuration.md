#### CORS Configuration

```javascript
// Allowed origins
const allowedOrigins = [
  'https://livhana.com',
  'https://www.livhana.com',
  'https://app.livhana.com'
];

// Local development
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173');
  allowedOrigins.push('http://localhost:3000');
}
```
