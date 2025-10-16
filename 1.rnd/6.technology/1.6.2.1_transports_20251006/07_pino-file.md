#### `pino/file`

The `pino/file` transport routes logs to a file (or file descriptor).

The `options.destination` property may be set to specify the desired file destination.

```js
const pino = require('pino')
const transport = pino.transport({
  target: 'pino/file',
  options: { destination: '/path/to/file' }
})
pino(transport)
```

By default, the `pino/file` transport assumes the directory of the destination file exists. If it does not exist, the transport will throw an error when it attempts to open the file for writing. The `mkdir` option may be set to `true` to configure the transport to create the directory, if it does not exist, before opening the file for writing.

```js
const pino = require('pino')
const transport = pino.transport({
  target: 'pino/file',
  options: { destination: '/path/to/file', mkdir: true }
})
pino(transport)
```

By default, the `pino/file` transport appends to the destination file if it exists. The `append` option may be set to `false` to configure the transport to truncate the file upon opening it for writing.

```js
const pino = require('pino')
const transport = pino.transport({
  target: 'pino/file',
  options: { destination: '/path/to/file', append: false }
})
pino(transport)
```

The `options.destination` property may also be a number to represent a file descriptor. Typically this would be `1` to write to STDOUT or `2` to write to STDERR. If `options.destination` is not set, it defaults to `1` which means logs will be written to STDOUT. If `options.destination` is a string integer, e.g. `'1'`, it will be coerced to a number and used as a file descriptor. If this is not desired, provide a full path, e.g. `/tmp/1`.

The difference between using the `pino/file` transport builtin and using `pino.destination` is that `pino.destination` runs in the main thread, whereas `pino/file` sets up `pino.destination` in a worker thread.
