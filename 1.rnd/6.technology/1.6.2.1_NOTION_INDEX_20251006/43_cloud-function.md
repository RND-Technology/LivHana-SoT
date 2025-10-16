### Cloud Function

```javascript
exports.notionIngest = async (req, res) => {
  const { main } = await import('./notion_ingest.js');
  await main();
  res.status(200).send({ success: true });
};
```
