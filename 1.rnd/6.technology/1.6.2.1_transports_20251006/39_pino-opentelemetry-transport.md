### pino-opentelemetry-transport

[pino-opentelemetry-transport](https://www.npmjs.com/package/pino-opentelemetry-transport) is a transport that will forward logs to an [OpenTelemetry log collector](https://opentelemetry.io/docs/collector/) using [OpenTelemetry JS instrumentation](https://opentelemetry.io/docs/instrumentation/js/).

```javascript
const pino = require('pino')

const transport = pino.transport({
  target: 'pino-opentelemetry-transport',
  options: {
    resourceAttributes: {
      'service.name': 'test-service',
      'service.version': '1.0.0'
    }
  }
})

pino(transport)
```

Documentation on running a minimal example is available in the [README](https://github.com/Vunovati/pino-opentelemetry-transport#minimalistic-example).

<a id="pino-papertrail"></a>
