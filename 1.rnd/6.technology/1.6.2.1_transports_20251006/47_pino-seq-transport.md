### pino-seq-transport

[pino-seq-transport][pino-seq-transport] is a Pino v7+ compatible transport to forward log events to [Seq][Seq]
from a dedicated worker:

```js
const pino = require('pino')
const transport = pino.transport({
  target: '@autotelic/pino-seq-transport',
  options: { serverUrl: 'http://localhost:5341' }
})
pino(transport)
```

[pino-seq-transport]: https://github.com/autotelic/pino-seq-transport

<a id="pino-slack-webhook"></a>
