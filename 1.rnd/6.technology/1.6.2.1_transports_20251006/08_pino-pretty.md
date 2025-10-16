#### `pino-pretty`

The [`pino-pretty`][pino-pretty] transport prettifies logs.

By default the `pino-pretty` builtin logs to STDOUT.

The `options.destination` property may be set to log pretty logs to a file descriptor or file. The following would send the prettified logs to STDERR:

```js
const pino = require('pino')
const transport = pino.transport({
  target: 'pino-pretty',
  options: { destination: 1 } // use 2 for stderr
})
pino(transport)
```
