### pino-logfmt

[pino-logfmt](https://github.com/botflux/pino-logfmt) is a Pino v7+ transport that formats logs into [logfmt](https://brandur.org/logfmt). This transport can output the formatted logs to stdout or file.

```js
import pino from 'pino'

const logger = pino({
  transport: {
    target: 'pino-logfmt'
  }
})
```

<a id="pino-loki"></a>
