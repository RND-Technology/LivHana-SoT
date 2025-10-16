### CORS Configuration

Ensure backend services allow frontend origin:

```javascript
// In backend service index.js
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```
