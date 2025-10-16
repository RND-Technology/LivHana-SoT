### pino-airbrake-transport

[pino-airbrake-transport][pino-airbrake-transport] is a Pino v7+ compatible transport to forward log events to [Airbrake][Airbrake]
from a dedicated worker:

```js
const pino = require('pino')
const transport = pino.transport({
  target: 'pino-airbrake-transport',
  options: {
    airbrake: {
      projectId: 1,
      projectKey: "REPLACE_ME",
      environment: "production",
      // additional options for airbrake
      performanceStats: false,
    },
  },
  level: "error", // minimum log level that should be sent to airbrake
})
pino(transport)
```

[pino-airbrake-transport]: https://github.com/enricodeleo/pino-airbrake-transport
[Airbrake]: https://airbrake.io/

<a id="pino-applicationinsights"></a>
