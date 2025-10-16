### Customizing Alerts

Modify alert fetch functions to match your business logic:

```javascript
const fetchInventoryAlerts = async () => {
  // Fetch from your inventory API
  const response = await fetch(`${BASE_URL}:3002/api/inventory/low-stock`);
  const data = await response.json();

  // Map to alert format
  setAlerts(prev => ({
    ...prev,
    inventory: data.map(item => ({
      message: `Low stock: ${item.name} (${item.quantity} remaining)`,
      severity: item.quantity < 5 ? 'error' : 'warning',
    })),
  }));
};
```

---
