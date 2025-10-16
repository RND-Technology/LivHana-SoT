### Asynchronous startup

The new transports boot asynchronously and calling `process.exit()` before the transport
starts will cause logs to not be delivered.

```js
const pino = require('pino')
const transport = pino.transport({
  targets: [
    { target: '/absolute/path/to/my-transport.mjs', level: 'error' },
    { target: 'some-file-transport', options: { destination: '/dev/null' } }
  ]
})
const logger = pino(transport)

logger.info('hello')

// If logs are printed before the transport is ready when process.exit(0) is called,
// they will be lost.
transport.on('ready', function () {
  process.exit(0)
})
```
