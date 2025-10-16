### @openobserve/pino-openobserve

[@openobserve/pino-openobserve](https://github.com/openobserve/pino-openobserve) is a
Pino v7+ transport that will send logs to an
[OpenObserve](https://openobserve.ai) instance.

```
const pino = require('pino');
const OpenobserveTransport = require('@openobserve/pino-openobserve');

const logger = pino({
  level: 'info',
  transport: {
    target: OpenobserveTransport,
    options: {
      url: 'https://your-openobserve-server.com',
      organization: 'your-organization',
      streamName: 'your-stream',
      auth: {
        username: 'your-username',
        password: 'your-password',
      },
    },
  },
});
```

For full documentation check the [README](https://github.com/openobserve/pino-openobserve).

<a id="pino-airbrake-transport"></a>
