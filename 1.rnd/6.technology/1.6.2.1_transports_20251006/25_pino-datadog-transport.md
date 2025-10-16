### pino-datadog-transport

[pino-datadog-transport][pino-datadog-transport] is a Pino v7+ compatible transport to forward log events to [Datadog][Datadog]
from a dedicated worker:

```js
const pino = require('pino')
const transport = pino.transport({
  target: 'pino-datadog-transport',
  options: {
    ddClientConf: {
      authMethods: {
        apiKeyAuth: <your datadog API key>
      }
    },
  },
  level: "error", // minimum log level that should be sent to datadog
})
pino(transport)
```

[pino-datadog-transport]: https://github.com/theogravity/datadog-transports
[Datadog]: https://www.datadoghq.com/
