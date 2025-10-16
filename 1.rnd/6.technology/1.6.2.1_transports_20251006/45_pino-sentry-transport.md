### pino-sentry-transport

[pino-sentry-transport][pino-sentry-transport] is a Pino v7+ compatible transport to forward log events to [Sentry][Sentry]
from a dedicated worker:

```js
const pino = require('pino')
const transport = pino.transport({
  target: 'pino-sentry-transport',
  options: {
    sentry: {
      dsn: 'https://******@sentry.io/12345',
    }
  }
})
pino(transport)
```

[pino-sentry-transport]: https://github.com/tomer-yechiel/pino-sentry-transport

<a id="pino-seq"></a>
