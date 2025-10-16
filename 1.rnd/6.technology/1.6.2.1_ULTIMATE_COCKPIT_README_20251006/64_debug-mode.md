### **Debug Mode:**

```javascript
// In UltimateCockpit.jsx
const DEBUG = true;

useEffect(() => {
  if (DEBUG) {
    console.log('Active layer:', activeLayer);
    console.log('Live data:', liveData);
    console.log('Reasoning mode:', reasoningMode);
  }
}, [activeLayer, liveData, reasoningMode]);
```
