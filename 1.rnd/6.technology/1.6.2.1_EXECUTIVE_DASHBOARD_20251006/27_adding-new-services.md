### Adding New Services

Add to `SERVICES` array:

```javascript
const SERVICES = [
  // ... existing services
  { name: 'My Service', port: 3006, key: 'myservice' },
];
```

Service will automatically appear in health monitoring section.
