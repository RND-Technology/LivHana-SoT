### pino-axiom

[pino-axiom](https://www.npmjs.com/package/pino-axiom) is a transport that will forward logs to [Axiom](https://axiom.co).

```javascript
const pino = require('pino')
const transport = pino.transport({
  target: 'pino-axiom',
  options: {
    orgId: 'YOUR-ORG-ID', 
    token: 'YOUR-TOKEN', 
    dataset: 'YOUR-DATASET', 
  },
})
pino(transport)
```

<a id="pino-azuretable"></a>
