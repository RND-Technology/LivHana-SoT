### Error Logging

Comprehensive error logging added throughout:

```javascript
console.error('Failed to fetch Square products:', error);
if (error.code === 'ECONNABORTED') {
  console.error('API timeout - falling back to demo products');
} else if (error.response?.status === 401) {
  console.error('Authentication failed - user may need to log in');
} else if (error.response?.status >= 500) {
  console.error('Server error - Square service may be down');
}
```

---
