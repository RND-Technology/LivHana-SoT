### pino-loki

pino-loki is a transport that will forwards logs into [Grafana Loki](https://grafana.com/oss/loki/).
Can be used in CLI version in a separate process or in a dedicated worker:

CLI :

```console
node app.js | pino-loki --hostname localhost:3100 --labels='{ "application": "my-application"}' --user my-username --password my-password
```

Worker :

```js
const pino = require('pino')
const transport = pino.transport({
  target: 'pino-loki',
  options: { host: 'localhost:3100' }
})
pino(transport)
```

For full documentation and configuration, see the [README](https://github.com/Julien-R44/pino-loki).

<a id="pino-mq"></a>
