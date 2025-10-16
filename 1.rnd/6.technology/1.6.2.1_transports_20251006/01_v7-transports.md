## v7+ Transports

A transport is a module that exports a default function that returns a writable stream:

```js
import { createWriteStream } from 'node:fs'

export default (options) => {
  return createWriteStream(options.destination)
}
```

Let's imagine the above defines our "transport" as the file `my-transport.mjs`
(ESM files are supported even if the project is written in CJS).

We would set up our transport by creating a transport stream with `pino.transport`
and passing it to the `pino` function:

```js
const pino = require('pino')
const transport = pino.transport({
  target: '/absolute/path/to/my-transport.mjs'
})
pino(transport)
```

The transport code will be executed in a separate worker thread. The main thread
will write logs to the worker thread, which will write them to the stream returned
from the function exported from the transport file/module.

The exported function can also be async. If we use an async function we can throw early
if the transform could not be opened. As an example:

```js
import fs from 'node:fs'
import { once } from 'events'
export default async (options) => {
  const stream = fs.createWriteStream(options.destination)
  await once(stream, 'open')
  return stream
}
```

While initializing the stream we're able to use `await` to perform asynchronous operations. In this
case, waiting for the write streams `open` event.

Let's imagine the above was published to npm with the module name `some-file-transport`.

The `options.destination` value can be set when creating the transport stream with `pino.transport` like so:

```js
const pino = require('pino')
const transport = pino.transport({
  target: 'some-file-transport',
  options: { destination: '/dev/null' }
})
pino(transport)
```

Note here we've specified a module by package rather than by relative path. The options object we provide
is serialized and injected into the transport worker thread, then passed to the module's exported function.
This means that the options object can only contain types that are supported by the
[Structured Clone Algorithm][sca] which is used to (de)serialize objects between threads.

What if we wanted to use both transports, but send only error logs to `my-transport.mjs` while
sending all logs to `some-file-transport`? We can use the `pino.transport` function's `level` option:

```js
const pino = require('pino')
const transport = pino.transport({
  targets: [
    { target: '/absolute/path/to/my-transport.mjs', level: 'error' },
    { target: 'some-file-transport', options: { destination: '/dev/null' }}
  ]
})
pino(transport)
```

If we're using custom levels, they should be passed in when using more than one transport.

```js
const pino = require('pino')
const transport = pino.transport({
  targets: [
    { target: '/absolute/path/to/my-transport.mjs', level: 'error' },
    { target: 'some-file-transport', options: { destination: '/dev/null' }
  ],
  levels: { foo: 35 }
})
pino(transport)
```

It is also possible to use the `dedupe` option to send logs only to the stream with the higher level.

```js
const pino = require('pino')
const transport = pino.transport({
  targets: [
    { target: '/absolute/path/to/my-transport.mjs', level: 'error' },
    { target: 'some-file-transport', options: { destination: '/dev/null' }
  ],
  dedupe: true
})
pino(transport)
```

To make pino log synchronously, pass `sync: true` to transport options.

```js
const pino = require('pino')
const transport = pino.transport({
  targets: [
    { target: '/absolute/path/to/my-transport.mjs', level: 'error' },
  ],
  dedupe: true,
  sync: true,
});
pino(transport);
```

For more details on `pino.transport` see the [API docs for `pino.transport`][pino-transport].

[pino-transport]: /docs/api.md#pino-transport
[sca]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm

<a id="writing"></a>
