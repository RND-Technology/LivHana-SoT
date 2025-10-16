### Adding New Metrics

1. Add state variable:

```javascript
const [myMetric, setMyMetric] = useState(0);
```

2. Create fetch function:

```javascript
const fetchMyMetric = async () => {
  const response = await fetch(`${BASE_URL}:PORT/api/endpoint`);
  const data = await response.json();
  setMyMetric(data.value);
};
```

3. Add to `fetchAllData()`:

```javascript
await Promise.all([
  // ... existing fetches
  fetchMyMetric(),
]);
```

4. Display in UI:

```javascript
<MetricCard
  title="My Metric"
  value={myMetric}
  icon={<MyIcon />}
  color="#16A34A"
/>
```
