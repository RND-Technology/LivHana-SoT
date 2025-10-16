## Legacy Transports

A legacy Pino "transport" is a supplementary tool that consumes Pino logs.

Consider the following example for creating a transport:

```js
const { pipeline, Writable } = require('node:stream')
const split = require('split2')

const myTransportStream = new Writable({
  write (chunk, enc, cb) {
  // apply a transform and send to STDOUT
  console.log(chunk.toString().toUpperCase())
  cb()
  }
})

pipeline(process.stdin, split(JSON.parse), myTransportStream)
```

The above defines our "transport" as the file `my-transport-process.js`.

Logs can now be consumed using shell piping:

```sh
node my-app-which-logs-stuff-to-stdout.js | node my-transport-process.js
```

Ideally, a transport should consume logs in a separate process to the application,
Using transports in the same process causes unnecessary load and slows down
Node's single-threaded event loop.
